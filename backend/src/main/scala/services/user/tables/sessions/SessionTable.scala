package services.user.tables.sessions
import cats.effect.{IO,Resource}
import java.sql.Connection
object SessionTable:
  private val insertSql = "insert into sessions(token_hash,user_id) values (?,?)"
  def insert(c: Connection,hash: String,id: String): IO[Unit] = Resource.fromAutoCloseable(IO.blocking(c.prepareStatement(insertSql))).use(s => IO.blocking {s.setString(1,hash);s.setString(2,id);s.executeUpdate();()})
  private val resolveSql = "select user_id from sessions where token_hash=? and expires_at>now()"
  def resolve(c: Connection,hash: String): IO[Option[String]] = Resource.fromAutoCloseable(IO.blocking(c.prepareStatement(resolveSql))).use(s => IO.blocking(s.setString(1,hash)) *> Resource.fromAutoCloseable(IO.blocking(s.executeQuery())).use(r => IO.blocking(if r.next() then Some(r.getString(1)) else None)))
  private val deleteSql = "delete from sessions where user_id=?"
  def delete(c: Connection,id: String): IO[Unit] = Resource.fromAutoCloseable(IO.blocking(c.prepareStatement(deleteSql))).use(s => IO.blocking {s.setString(1,id);s.executeUpdate();()})
