package services.catalog.tables.productioncreator
import cats.effect.{IO,Resource}
import java.sql.Connection
object ProductionCreatorTable:
  private val linkSql = "insert into production_creators values (?,?,?) on conflict do nothing"
  def link(c: Connection,productionId: String,creatorId: String,role: String): IO[Unit] = Resource.fromAutoCloseable(IO.blocking(c.prepareStatement(linkSql))).use(s => IO.blocking {s.setString(1,productionId);s.setString(2,creatorId);s.setString(3,role);s.executeUpdate();()})
  private val listSql = "select creator_id from production_creators where production_id=?"
  def list(c: Connection,id: String): IO[List[String]] = Resource.fromAutoCloseable(IO.blocking(c.prepareStatement(listSql))).use(s => IO.blocking(s.setString(1,id)) *> Resource.fromAutoCloseable(IO.blocking(s.executeQuery())).use(read))
  private def read(r: java.sql.ResultSet): IO[List[String]] = IO.blocking(r.next()).flatMap {
    case false => IO.pure(Nil)
    case true => IO.blocking(r.getString(1)).flatMap(v => read(r).map(v :: _))
  }

  private val clearSql = "delete from production_creators where production_id=?"
  def clear(c: Connection,id: String): IO[Unit] = Resource.fromAutoCloseable(IO.blocking(c.prepareStatement(clearSql))).use(s => IO.blocking {s.setString(1,id);s.executeUpdate();()})

  private val unlinkSql = "delete from production_creators where production_id=? and creator_id=?"
  def unlink(c: Connection, productionId: String, creatorId: String): IO[Unit] =
    Resource.fromAutoCloseable(IO.blocking(c.prepareStatement(unlinkSql))).use { statement =>
      IO.blocking {
        statement.setString(1, productionId)
        statement.setString(2, creatorId)
        statement.executeUpdate()
        ()
      }
    }
