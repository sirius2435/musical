package services.user.api
import cats.effect.IO
import cats.syntax.all.*
import services.system.api.APIWithTokenMessage
import services.system.HttpError
import services.user.objects.*
import services.user.tables.users.UserTable
import java.sql.Connection
final case class CurrentUserMessage(userId: String) extends APIWithTokenMessage[UserProfile]:
  override def plan(connection: Connection): IO[UserProfile] =
    UserTable.find(connection,userId).flatMap(u => IO.fromOption(u)(HttpError.Unauthorized("Please sign in"))).map(u => UserProfile(u.id,u.email,u.name,u.role))
