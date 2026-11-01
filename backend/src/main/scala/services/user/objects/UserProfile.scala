package services.user.objects
import io.circe.{Encoder, Decoder}
import io.circe.generic.semiauto.{deriveEncoder, deriveDecoder}
final case class UserProfile(id: String, email: String, name: String, role: UserRole)
object UserProfile:
  given Encoder[UserProfile] = deriveEncoder[UserProfile]
  given Decoder[UserProfile] = deriveDecoder[UserProfile]
