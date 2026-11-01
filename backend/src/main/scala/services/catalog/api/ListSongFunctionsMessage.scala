package services.catalog.api
import cats.effect.IO
import services.system.api.NoRequestMessage
import services.catalog.objects.{SongFunction,SongFunctionDefinition}
import java.sql.Connection
final case class ListSongFunctionsMessage() extends NoRequestMessage[List[SongFunctionDefinition]]:
  override def plan(connection: Connection): IO[List[SongFunctionDefinition]] = IO.pure(List(
    SongFunctionDefinition(SongFunction.Narration,"Narration","The story moves forward.","Music can carry information, frame an event, or change how we understand the action."),
    SongFunctionDefinition(SongFunction.Character,"I am","A person comes into focus.","A song can reveal identity, belief and an inner life beyond spoken dialogue."),
    SongFunctionDefinition(SongFunction.Wish,"I want","A possibility becomes a purpose.","Desire gives a character direction, while music makes that intention emotionally legible."),
    SongFunctionDefinition(SongFunction.Love,"I feel","What words cannot quite say.","An emotional or conditional love song makes a relationship audible.")
  ))
