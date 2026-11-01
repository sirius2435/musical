package services.system.tables.seed
import cats.effect.{IO,Resource}
import java.sql.Connection
object SeedTable:
  private val existsSql = "select version from archive_seed where version=1"
  def exists(c: Connection): IO[Boolean] = Resource.fromAutoCloseable(IO.blocking(c.prepareStatement(existsSql))).use(s => Resource.fromAutoCloseable(IO.blocking(s.executeQuery())).use(r => IO.blocking(r.next())))
  private val markSql = "insert into archive_seed values (1)"
  def mark(c: Connection): IO[Unit] = Resource.fromAutoCloseable(IO.blocking(c.prepareStatement(markSql))).use(s => IO.blocking(s.executeUpdate()).void)
  private val mediaExistsSql = "select version from archive_seed where version=2"
  def mediaExists(c: Connection): IO[Boolean] = Resource.fromAutoCloseable(IO.blocking(c.prepareStatement(mediaExistsSql))).use(s => Resource.fromAutoCloseable(IO.blocking(s.executeQuery())).use(r => IO.blocking(r.next())))
  private val markMediaSql = "insert into archive_seed values (2)"
  def markMedia(c: Connection): IO[Unit] = Resource.fromAutoCloseable(IO.blocking(c.prepareStatement(markMediaSql))).use(s => IO.blocking(s.executeUpdate()).void)
