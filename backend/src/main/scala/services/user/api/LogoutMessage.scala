package services.user.api
import cats.effect.IO
import cats.syntax.all.*
import services.system.api.APIWithTokenMessage
import services.user.objects.*
import services.user.tables.sessions.SessionTable
import java.sql.Connection
final case class LogoutMessage(userId: String) extends APIWithTokenMessage[Boolean]:
  override def plan(connection: Connection): IO[Boolean] =
    SessionTable.delete(connection,userId).as(true)
