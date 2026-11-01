package services.user.api
import cats.effect.IO
import cats.syntax.all.*
import services.system.api.APIMessage
import services.system.HttpError
import services.user.objects.*
import java.sql.Connection
final case class RequireAdminMessage(userId: String) extends APIMessage[Unit]:
  override def plan(connection: Connection): IO[Unit] =
    CurrentUserMessage(userId).plan(connection).flatMap(u => if u.role == UserRole.Admin then IO.unit else IO.raiseError(HttpError.Forbidden("Administrator access required")))
