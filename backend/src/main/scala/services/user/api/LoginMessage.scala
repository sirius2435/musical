package services.user.api
import cats.effect.IO
import cats.syntax.all.*
import services.system.api.APIMessage
import services.system.HttpError
import services.user.objects.*
import services.user.objects.apiTypes.AuthResponse
import services.user.tables.users.UserTable
import services.user.tables.sessions.SessionTable
import services.user.utils.Passwords
import java.sql.Connection
final case class LoginMessage(email: String, password: String) extends APIMessage[AuthResponse]:
  override def plan(connection: Connection): IO[AuthResponse] =
    for
      _ <- IO.raiseWhen(password.length > 256 || email.length > 254)(HttpError.BadRequest("Credentials are too long"))
      user <- UserTable.find(connection,email.trim.toLowerCase).flatMap(u => IO.fromOption(u)(HttpError.Unauthorized("Invalid email or password")))
      candidate <- Passwords.hash(password,user.salt)
      _ <- IO.raiseUnless(java.security.MessageDigest.isEqual(candidate.getBytes(java.nio.charset.StandardCharsets.UTF_8),user.hash.getBytes(java.nio.charset.StandardCharsets.UTF_8)))(HttpError.Unauthorized("Invalid email or password"))
      token <- Passwords.random
      _ <- SessionTable.insert(connection,Passwords.tokenHash(token),user.id)
    yield AuthResponse(token,UserProfile(user.id,user.email,user.name,user.role))
