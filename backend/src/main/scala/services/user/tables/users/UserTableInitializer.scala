package services.user.tables.users
import cats.effect.{IO,Resource}
import java.sql.Connection
object UserTableInitializer:
  private val initializeSql = """create table if not exists users (id text primary key,email text unique not null,name text not null,role text not null check(role in ('reader','admin')),hash text not null,salt text not null)"""
  def initialize(c: Connection): IO[Unit] = Resource.fromAutoCloseable(IO.blocking(c.createStatement())).use(s => IO.blocking(s.execute(initializeSql)).void)
