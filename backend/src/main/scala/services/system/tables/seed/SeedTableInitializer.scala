package services.system.tables.seed
import cats.effect.{IO,Resource}
import java.sql.Connection
object SeedTableInitializer:
  private val initializeSql = "create table if not exists archive_seed(version integer primary key)"
  def initialize(c: Connection): IO[Unit] = Resource.fromAutoCloseable(IO.blocking(c.createStatement())).use(s => IO.blocking(s.execute(initializeSql)).void)
