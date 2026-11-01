package services.catalog.objects
import io.circe.{Encoder,Decoder}
import io.circe.generic.semiauto.{deriveEncoder,deriveDecoder}
final case class SongFunctionDefinition(id: SongFunction,title: String,subtitle: String,description: String)
object SongFunctionDefinition:
  given Encoder[SongFunctionDefinition] = deriveEncoder[SongFunctionDefinition]
  given Decoder[SongFunctionDefinition] = deriveDecoder[SongFunctionDefinition]
