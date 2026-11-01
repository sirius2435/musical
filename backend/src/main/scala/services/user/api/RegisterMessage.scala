package services.user.api
import cats.effect.IO
import cats.syntax.all.*
import services.system.api.APIMessage
import services.system.HttpError
import services.user.objects.*
import services.user.objects.apiTypes.AuthResponse
import services.user.tables.users.UserTable
import services.user.utils.Passwords
import java.sql.Connection
final case class RegisterMessage(email: String, name: String, password: String) extends APIMessage[AuthResponse]:
  override def plan(connection: Connection): IO[AuthResponse] =
    for
      _ <- IO.raiseWhen(password.length > 256 || email.length > 254)(HttpError.BadRequest("Credentials are too long"))
      _ <- IO.raiseWhen(!email.contains("@") || name.trim.isEmpty || password.length < 10)(HttpError.BadRequest("Provide an email, name and a password of at least 10 characters"))
      existing <- UserTable.find(connection,email.trim.toLowerCase)
      _ <- IO.raiseWhen(existing.nonEmpty)(HttpError.Conflict("This email is already registered"))
      id <- IO(java.util.UUID.randomUUID().toString)
      salt <- Passwords.random
      hash <- Passwords.hash(password,salt)
      _ <- UserTable.insert(connection,StoredUser(id,email.trim.toLowerCase,name.trim,UserRole.Reader,hash,salt))
      auth <- LoginMessage(email,password).plan(connection)
    yield auth
