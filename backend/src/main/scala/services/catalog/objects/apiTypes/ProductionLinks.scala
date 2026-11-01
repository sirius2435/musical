package services.catalog.objects.apiTypes
import io.circe.{Encoder, Decoder}
import io.circe.generic.semiauto.{deriveEncoder, deriveDecoder}
final case class ProductionLinks(creatorIds: List[String], songIds: List[String])
object ProductionLinks:
  given Encoder[ProductionLinks] = deriveEncoder[ProductionLinks]
  given Decoder[ProductionLinks] = deriveDecoder[ProductionLinks]
