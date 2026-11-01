package services.user.objects
import io.circe.{Encoder,Decoder}
enum UserRole:
  case Reader, Admin
object UserRole:
  def toString(role: UserRole): String = role match
    case UserRole.Reader => "reader"
    case UserRole.Admin => "admin"
  def fromString(value: String): Either[String,UserRole] = value match
    case "reader" => Right(UserRole.Reader)
    case "admin" => Right(UserRole.Admin)
    case _ => Left("Unknown user role")
  given Encoder[UserRole] = Encoder.encodeString.contramap(toString)
  given Decoder[UserRole] = Decoder.decodeString.emap(fromString)
