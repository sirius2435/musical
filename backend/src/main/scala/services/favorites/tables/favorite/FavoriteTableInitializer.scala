package services.favorites.tables.favorite
import cats.effect.{IO,Resource}
import java.sql.Connection
object FavoriteTableInitializer:
  private val initializeSql = "create table if not exists favorites (user_id text references users(id) on delete cascade, production_id text references productions(id) on delete cascade, primary key(user_id,production_id))"
  def initialize(c: Connection): IO[Unit] = Resource.fromAutoCloseable(IO.blocking(c.createStatement())).use(s => IO.blocking(s.execute(initializeSql)).void)
