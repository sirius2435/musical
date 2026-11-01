package services.user.objects
import io.circe.{Encoder, Decoder}
import io.circe.generic.semiauto.{deriveEncoder, deriveDecoder}
final case class StoredUser(id: String, email: String, name: String, role: UserRole, hash: String, salt: String)
object StoredUser:
  given Encoder[StoredUser] = deriveEncoder[StoredUser]
  given Decoder[StoredUser] = deriveDecoder[StoredUser]
