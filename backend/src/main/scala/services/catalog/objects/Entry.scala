package services.catalog.objects
import io.circe.{Encoder, Decoder}
import io.circe.generic.semiauto.{deriveEncoder, deriveDecoder}
final case class Entry(id: String, slug: String, title: String, subtitle: String, summary: String, body: String, category: String, year: Int, eraId: Option[String], source: String, image: String)
object Entry:
  given Encoder[Entry] = deriveEncoder[Entry]
  given Decoder[Entry] = deriveDecoder[Entry]
