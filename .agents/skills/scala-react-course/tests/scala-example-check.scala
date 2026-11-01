package examples

import cats.effect.{IO, IOApp}
import examples.style.*
import io.circe.syntax.*
import services.books.objects.{BookId, BookRecord}
import services.books.routes.BooksRoutes
import services.books.tables.book.BookTable

import java.lang.reflect.{InvocationHandler, Method, Proxy}
import java.sql.{Connection, PreparedStatement, ResultSet, SQLException}
import java.util.concurrent.atomic.{AtomicBoolean, AtomicInteger}

/** Isolated test fixture: JDBC proxies are external boundaries, not production persistence. */
object ScalaExampleCheck extends IOApp.Simple:
  private def proxy[A](kind: Class[A])(handle: (Method, Array[Object]) => Object): A =
    Proxy.newProxyInstance(kind.getClassLoader, Array(kind), new InvocationHandler:
      override def invoke(instance: Object, method: Method, args: Array[Object]): Object =
        handle(method, Option(args).getOrElse(Array.empty[Object]))
    ).asInstanceOf[A]

  private def checkResources(failMapping: Boolean): IO[Unit] =
    IO.defer {
      val resultClosed = new AtomicBoolean(false)
      val statementClosed = new AtomicBoolean(false)
      val prepared = new AtomicInteger(0)
      val cursor = new AtomicInteger(0)
      val rows = proxy(classOf[ResultSet]) { (method, args) =>
        method.getName match
          case "next" => java.lang.Boolean.valueOf(cursor.getAndIncrement() == 0)
          case "getString" =>
            if failMapping then throw new SQLException("mapping failure fixture")
            else if args(0) == "id" then "b-1" else "Scala"
          case "close" => resultClosed.set(true); null
          case other => throw new UnsupportedOperationException(other)
      }
      val statement = proxy(classOf[PreparedStatement]) { (method, _) =>
        method.getName match
          case "setString" => null
          case "executeQuery" => rows
          case "close" => statementClosed.set(true); null
          case other => throw new UnsupportedOperationException(other)
      }
      val connection = proxy(classOf[Connection]) { (method, _) =>
        method.getName match
          case "prepareStatement" => prepared.incrementAndGet(); statement
          case other => throw new UnsupportedOperationException(other)
      }
      val operation = BookTable.findById(connection, BookId("b-1"))
      for
        _ <- IO(assert(prepared.get() == 0, "JDBC ran before IO execution"))
        result <- operation.attempt
        _ <- IO {
          assert(resultClosed.get() && statementClosed.get(), "JDBC resources leaked")
          if failMapping then assert(result.isLeft)
          else assert(result == Right(Some(BookRecord(BookId("b-1"), "Scala"))))
        }
      yield ()
    }

  override def run: IO[Unit] =
    for
      _ <- IO {
        val book = BookRecord(BookId("b-1"), "Scala")
        assert(book.asJson.hcursor.downField("id").get[String]("value") == Right("b-1"))
        assert(book.asJson.as[BookRecord] == Right(book))
        assert(BooksRoutes.apiMessages.map(_.apiName).toSet == Set("getbookapi", "listbooksapi", "renamebookapi"))
        assert(parseCount("2") == Right(2))
        assert(parseCount("bad").isLeft && parseCount("0").isLeft)
        assert(normalizedTitles(List(" Scala ", " ")) == List("Scala"))
      }
      combined <- combine(IO.pure(1), value => IO.pure(value + 2))
      _ <- IO(assert(combined == 3))
      _ <- checkResources(false)
      _ <- checkResources(true)
      _ <- IO.println("PASS: Scala codecs, route registration names, Try/Either/IO composition, JDBC deferred access and success/error resource release")
    yield ()
