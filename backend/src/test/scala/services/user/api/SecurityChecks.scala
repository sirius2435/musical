package services.user.api
import cats.effect.{IO,IOApp}
import cats.syntax.all.*
import services.catalog.objects.Entry
import io.circe.{Json}
import io.circe.syntax.*
import org.http4s.{Request,Method,Uri,Status}
import org.http4s.implicits.*
import org.http4s.circe.CirceEntityCodec.*
import services.system.api.APIMessageRouter
import services.user.routes.UserRoutes
import services.catalog.routes.CatalogRoutes
import services.favorites.routes.FavoritesRoutes
import services.user.utils.Passwords
import java.sql.{Connection,PreparedStatement,ResultSet}
import java.lang.reflect.{Proxy,InvocationHandler,Method as JMethod}
import java.util.concurrent.atomic.AtomicReference
object SecurityChecks extends IOApp.Simple:
  private def proxy[A](kind: Class[A])(f: (JMethod,Array[Object]) => Object): A =
    Proxy.newProxyInstance(kind.getClassLoader,Array(kind),new InvocationHandler:
      override def invoke(instance: Object,m: JMethod,args: Array[Object]): Object = f(m,Option(args).getOrElse(Array.empty[Object]))
    ).asInstanceOf[A]
  override def run: IO[Unit] =
    for
      hash <- Passwords.hash("test-password-123","00" * 32)
      _ <- IO.defer {
        val users = new AtomicReference(Map("reader-a" -> Map("id"->"reader-a","email"->"a@example.test","name"->"Alice","role"->"reader","hash"->hash,"salt"->("00" * 32)),"reader-b" -> Map("id"->"reader-b","email"->"b@example.test","name"->"Bob","role"->"reader","hash"->hash,"salt"->("00" * 32)),"admin" -> Map("id"->"admin","email"->"admin@example.test","name"->"Curator","role"->"admin","hash"->hash,"salt"->("00" * 32))))
        val sessions = new AtomicReference(Map(Passwords.tokenHash("token-a")->"reader-a",Passwords.tokenHash("token-b")->"reader-b",Passwords.tokenHash("token-admin")->"admin"))
        val favorites = new AtomicReference(Set(("reader-b","south-pacific")))
        def result(values: List[Map[String,String]]): ResultSet =
          val remaining = new AtomicReference(values)
          val current = new AtomicReference(Map.empty[String,String])
          proxy(classOf[ResultSet]) { (m,args) => m.getName match
            case "next" => remaining.get() match
              case head :: tail => current.set(head);remaining.set(tail);java.lang.Boolean.TRUE
              case Nil => java.lang.Boolean.FALSE
            case "getString" => current.get().getOrElse(args(0).toString,"")
            case "close" => null
            case other => throw new UnsupportedOperationException(other)
          }
        val connection = proxy(classOf[Connection]) { (m,args) => m.getName match
          case "prepareStatement" =>
            val sql = args(0).toString
            val bindings = new AtomicReference(Map.empty[Int,String])
            proxy(classOf[PreparedStatement]) { (method,params) => method.getName match
              case "setString" => bindings.set(bindings.get().updated(params(0).asInstanceOf[Integer].intValue(),params(1).toString));null
              case "executeQuery" =>
                val b = bindings.get()
                if sql.startsWith("select * from users") then result(users.get().values.filter(u => u("id")==b(1)||u("email")==b(2)).toList)
                else if sql.startsWith("select user_id") then result(sessions.get().get(b(1)).map(id => Map("1"->id)).toList)
                else if sql.startsWith("select p.slug") then result(favorites.get().filter(_._1==b(1)).toList.map(p => Map("1"->p._2)))
                else throw new UnsupportedOperationException(sql)
              case "executeUpdate" =>
                val b = bindings.get()
                if sql.startsWith("insert into sessions") then sessions.set(sessions.get().updated(b(1),b(2)))
                else if sql.startsWith("delete from sessions") then sessions.set(sessions.get().filter(_._2!=b(1)))
                else if sql.startsWith("insert into favorites") then favorites.set(favorites.get() + ((b(1),b(2))))
                else if sql.startsWith("delete from favorites") then favorites.set(favorites.get() - ((b(1),b(2))))
                else if sql.startsWith("update users set name") then users.set(users.get().updated(b(2),users.get()(b(2)).updated("name",b(1))))
                else if sql.startsWith("insert into users") then users.set(users.get().updated(b(1),Map("id"->b(1),"email"->b(2),"name"->b(3),"role"->b(4),"hash"->b(5),"salt"->b(6))))
                else throw new UnsupportedOperationException(sql)
                Integer.valueOf(1)
              case "close" => null
              case other => throw new UnsupportedOperationException(other)
            }
          case other => throw new UnsupportedOperationException(other)
        }
        val app = APIMessageRouter.routes(UserRoutes.apiMessages ++ CatalogRoutes.apiMessages ++ FavoritesRoutes.apiMessages,(token,c) => ResolveTokenMessage(token).plan(c).map(_.asJson),operation => operation(connection)).orNotFound
        def request(name: String,payload: Json,status: Status): IO[Json] =
          app(Request[IO](Method.POST,Uri.unsafeFromString("/api/"+name)).withEntity(payload)).flatMap(r => IO(assert(r.status==status,s"$name expected $status, got ${r.status}")) *> r.as[Json])
        def obj(fields: (String,Json)*): Json = Json.obj(fields*)
        for
          _ <- request("login",obj("email"->"a@example.test".asJson,"password"->"wrong".asJson),Status.Unauthorized)
          login <- request("login",obj("email"->"a@example.test".asJson,"password"->"test-password-123".asJson),Status.Ok)
          _ <- IO(assert(login.hcursor.downField("user").get[String]("role")==Right("reader")))
          current <- request("currentuser",obj("userToken"->"token-a".asJson,"userId"->"admin".asJson),Status.Ok)
          _ <- IO(assert(current.hcursor.get[String]("id")==Right("reader-a")))
          _ <- request("currentuser",obj("userToken"->"expired".asJson),Status.Unauthorized)
          _ <- request("listfavorites",obj(),Status.Unauthorized)
          _ <- request("deleteproduction",obj("userToken"->"token-a".asJson,"userId"->"admin".asJson,"id"->"carousel".asJson),Status.Forbidden)
          _ <- List("saveproduction", "savesong", "saveera", "savecreator").traverse_ { name =>
            val entry = Entry("fixture", "fixture", "Fixture", "", "", "", "character", 0, None, "", "")
            request(name, obj("userToken" -> "token-a".asJson, "userId" -> "admin".asJson, "entry" -> entry.asJson), Status.Forbidden).void
          }
          _ <- List("deleteproduction", "deletesong", "deleteera", "deletecreator").traverse_(name =>
            request(name, obj("userToken" -> "token-a".asJson, "id" -> "fixture".asJson), Status.Forbidden).void)
          _ <- request("updateproductionrelations", obj("userToken" -> "token-a".asJson, "productionId" -> "fixture".asJson, "creatorIds" -> List.empty[String].asJson, "songIds" -> List.empty[String].asJson), Status.Forbidden)
          _ <- request("setfavorite",obj("userToken"->"token-a".asJson,"userId"->"reader-b".asJson,"productionId"->"carousel".asJson,"saved"->true.asJson),Status.Ok)
          own <- request("listfavorites",obj("userToken"->"token-a".asJson),Status.Ok)
          other <- request("listfavorites",obj("userToken"->"token-b".asJson),Status.Ok)
          _ <- IO {assert(own.as[List[String]]==Right(List("carousel")));assert(other.as[List[String]]==Right(List("south-pacific")))}
          _ <- request("updateprofile",obj("userToken"->"token-a".asJson,"userId"->"reader-b".asJson,"name"->"Updated Alice".asJson,"role"->"admin".asJson),Status.Ok)
          _ <- IO {assert(users.get()("reader-a")("name")=="Updated Alice");assert(users.get()("reader-b")("name")=="Bob");assert(users.get()("reader-a")("role")=="reader")}
          registration <- request("register",obj("email"->"new@example.test".asJson,"name"->"New Reader".asJson,"password"->"secure-test-123".asJson,"role"->"admin".asJson),Status.Ok)
          _ <- IO(assert(registration.hcursor.downField("user").get[String]("role")==Right("reader")))
          _ <- request("logout",obj("userToken"->"token-a".asJson),Status.Ok)
          _ <- request("currentuser",obj("userToken"->"token-a".asJson),Status.Unauthorized)
          _ <- IO.println("PASS: real message/router register/login/logout, token-to-identity overwrite, admin denial, user-scoped favorites and profile role protection (JDBC fixture)")
        yield ()
      }
    yield ()
