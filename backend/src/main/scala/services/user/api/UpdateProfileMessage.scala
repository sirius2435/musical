package services.user.api
import cats.effect.IO
import cats.syntax.all.*
import services.system.api.APIWithTokenMessage
import services.system.HttpError
import services.user.objects.*
import services.user.tables.users.UserTable
import java.sql.Connection
final case class UpdateProfileMessage(userId: String, name: String) extends APIWithTokenMessage[UserProfile]:
  override def plan(connection: Connection): IO[UserProfile] =
    for
      _ <- IO.raiseWhen(name.trim.isEmpty || name.length > 100)(HttpError.BadRequest("Name must be 1–100 characters"))
      _ <- UserTable.update(connection,userId,name.trim)
      u <- CurrentUserMessage(userId).plan(connection)
    yield u
