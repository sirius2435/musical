package services.catalog.tables.productionsong
import cats.effect.{IO,Resource}
import java.sql.Connection
object ProductionSongTable:
  private val linkSql = "insert into production_songs values (?,?) on conflict do nothing"
  def link(c: Connection,productionId: String,songId: String): IO[Unit] = Resource.fromAutoCloseable(IO.blocking(c.prepareStatement(linkSql))).use(s => IO.blocking {s.setString(1,productionId);s.setString(2,songId);s.executeUpdate();()})
  private val listSql = "select song_id from production_songs where production_id=?"
  def list(c: Connection,id: String): IO[List[String]] = Resource.fromAutoCloseable(IO.blocking(c.prepareStatement(listSql))).use(s => IO.blocking(s.setString(1,id)) *> Resource.fromAutoCloseable(IO.blocking(s.executeQuery())).use(read))
  private def read(r: java.sql.ResultSet): IO[List[String]] = IO.blocking(r.next()).flatMap {
    case false => IO.pure(Nil)
    case true => IO.blocking(r.getString(1)).flatMap(v => read(r).map(v :: _))
  }

  private val clearSql = "delete from production_songs where production_id=?"
  def clear(c: Connection,id: String): IO[Unit] = Resource.fromAutoCloseable(IO.blocking(c.prepareStatement(clearSql))).use(s => IO.blocking {s.setString(1,id);s.executeUpdate();()})

  private val ownersSql = "select production_id from production_songs where song_id=?"
  def owners(c: Connection,id: String): IO[List[String]] = Resource.fromAutoCloseable(IO.blocking(c.prepareStatement(ownersSql))).use(s => IO.blocking(s.setString(1,id)) *> Resource.fromAutoCloseable(IO.blocking(s.executeQuery())).use(read))
