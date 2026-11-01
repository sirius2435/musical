package services.catalog.tables.production
import cats.effect.{IO, Resource}
import java.sql.Connection
object ProductionTableInitializer:
  private val initializeSql = """create table if not exists productions (id text primary key, slug text unique not null, title text not null, subtitle text not null default '', summary text not null default '', body text not null default '', category text not null default '', year integer not null default 0, era_id text references eras(id), source text not null default '', image text not null default '')"""
  def initialize(connection: Connection): IO[Unit] = Resource.fromAutoCloseable(IO.blocking(connection.createStatement())).use(s => IO.blocking(s.execute(initializeSql)).void)
