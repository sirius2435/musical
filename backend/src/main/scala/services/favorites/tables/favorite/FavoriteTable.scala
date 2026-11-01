package services.favorites.tables.favorite
import cats.effect.{IO,Resource}
import services.catalog.objects.Entry
import services.catalog.tables.production.ProductionTable
import java.sql.Connection
object FavoriteTable:
  private val listSql = "select p.slug from favorites f join productions p on p.id=f.production_id where f.user_id=? order by p.title"
  def list(c: Connection,id: String): IO[List[String]] = Resource.fromAutoCloseable(IO.blocking(c.prepareStatement(listSql))).use(s => IO.blocking(s.setString(1,id)) *> Resource.fromAutoCloseable(IO.blocking(s.executeQuery())).use(read))
  private def read(r: java.sql.ResultSet): IO[List[String]] = IO.blocking(r.next()).flatMap {
    case false => IO.pure(Nil)
    case true => IO.blocking(r.getString(1)).flatMap(v => read(r).map(v :: _))
  }
  private val addSql = "insert into favorites(user_id,production_id) values (?,?) on conflict do nothing"
  def add(c: Connection,userId: String,productionId: String): IO[Unit] = Resource.fromAutoCloseable(IO.blocking(c.prepareStatement(addSql))).use(s => IO.blocking {s.setString(1,userId);s.setString(2,productionId);s.executeUpdate();()})
  private val removeSql = "delete from favorites where user_id=? and production_id=?"
  def remove(c: Connection,userId: String,productionId: String): IO[Unit] = Resource.fromAutoCloseable(IO.blocking(c.prepareStatement(removeSql))).use(s => IO.blocking {s.setString(1,userId);s.setString(2,productionId);s.executeUpdate();()})
