package services.catalog.objects
import io.circe.{Encoder,Decoder}
enum SongFunction:
  case Narration, Character, Wish, Love
object SongFunction:
  def toString(value: SongFunction): String = value match
    case SongFunction.Narration => "narration"
    case SongFunction.Character => "character"
    case SongFunction.Wish => "wish"
    case SongFunction.Love => "love"
  def fromString(value: String): Either[String,SongFunction] = values.find(v => toString(v)==value).toRight("Unknown song function")
  given Encoder[SongFunction] = Encoder.encodeString.contramap(toString)
  given Decoder[SongFunction] = Decoder.decodeString.emap(fromString)
