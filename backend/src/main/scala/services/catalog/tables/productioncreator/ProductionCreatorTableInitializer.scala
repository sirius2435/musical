package services.catalog.tables.productioncreator
import cats.effect.{IO,Resource}
import java.sql.Connection
object ProductionCreatorTableInitializer:
  private val initializeSql = "create table if not exists production_creators (production_id text references productions(id) on delete cascade, creator_id text references creators(id) on delete restrict, role text not null, primary key(production_id,creator_id))"
  def initialize(c: Connection): IO[Unit] = Resource.fromAutoCloseable(IO.blocking(c.createStatement())).use(s => IO.blocking(s.execute(initializeSql)).void)
