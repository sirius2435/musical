package services.catalog.tables.productionsong
import cats.effect.{IO,Resource}
import java.sql.Connection
object ProductionSongTableInitializer:
  private val initializeSql = "create table if not exists production_songs (production_id text references productions(id) on delete cascade,song_id text references songs(id) on delete restrict,primary key(production_id,song_id))"
  def initialize(c: Connection): IO[Unit] = Resource.fromAutoCloseable(IO.blocking(c.createStatement())).use(s => IO.blocking(s.execute(initializeSql)).void)
