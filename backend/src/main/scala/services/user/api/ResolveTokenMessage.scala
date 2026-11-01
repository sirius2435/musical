package services.user.api
import cats.effect.IO
import cats.syntax.all.*
import services.system.api.APIMessage
import services.system.HttpError
import services.user.objects.*
import services.user.tables.sessions.SessionTable
import services.user.utils.Passwords
import java.sql.Connection
final case class ResolveTokenMessage(token: String) extends APIMessage[String]:
  override def plan(connection: Connection): IO[String] =
    SessionTable.resolve(connection,Passwords.tokenHash(token)).flatMap(u => IO.fromOption(u)(HttpError.Unauthorized("Your session has expired. Please sign in.")))
