package services.user.tables.users
import cats.effect.{IO,Resource}
import services.user.objects.{StoredUser,UserProfile,UserRole}
import java.sql.Connection
object UserTable:
  private val findSql = "select * from users where id=? or email=?"
  def find(c: Connection, value: String): IO[Option[StoredUser]] = Resource.fromAutoCloseable(IO.blocking(c.prepareStatement(findSql))).use { s =>
    IO.blocking {s.setString(1,value);s.setString(2,value)} *> Resource.fromAutoCloseable(IO.blocking(s.executeQuery())).use(r => IO.blocking(if r.next() then Some(StoredUser(r.getString("id"),r.getString("email"),r.getString("name"),UserRole.fromString(r.getString("role")).fold(message => throw new IllegalArgumentException(message),identity),r.getString("hash"),r.getString("salt"))) else None))
  }
  private val insertSql = "insert into users values (?,?,?,?,?,?)"
  def insert(c: Connection,u: StoredUser): IO[Unit] = Resource.fromAutoCloseable(IO.blocking(c.prepareStatement(insertSql))).use(s => IO.blocking {s.setString(1,u.id);s.setString(2,u.email);s.setString(3,u.name);s.setString(4,UserRole.toString(u.role));s.setString(5,u.hash);s.setString(6,u.salt);s.executeUpdate();()})
  private val updateSql = "update users set name=? where id=?"
  def update(c: Connection,id: String,name: String): IO[Unit] = Resource.fromAutoCloseable(IO.blocking(c.prepareStatement(updateSql))).use(s => IO.blocking {s.setString(1,name);s.setString(2,id);s.executeUpdate();()})

  private val promoteSql = "update users set role='admin' where id=?"
  def promote(c: Connection,id: String): IO[Unit] = Resource.fromAutoCloseable(IO.blocking(c.prepareStatement(promoteSql))).use(s => IO.blocking {s.setString(1,id);s.executeUpdate();()})
