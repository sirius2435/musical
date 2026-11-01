package services.user.tables.sessions
import cats.effect.{IO,Resource}
import java.sql.Connection
object SessionTableInitializer:
  private val initializeSql = "create table if not exists sessions (token_hash text primary key,user_id text not null references users(id) on delete cascade,expires_at timestamptz not null default now()+interval '7 days')"
  def initialize(c: Connection): IO[Unit] = Resource.fromAutoCloseable(IO.blocking(c.createStatement())).use(s => IO.blocking(s.execute(initializeSql)).void)
