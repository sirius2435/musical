package services.catalog.api
import cats.effect.IO
import cats.syntax.all.*
import services.system.api.APIWithTokenMessage
import services.system.HttpError
import services.user.objects.*
import services.catalog.objects.Entry
import services.catalog.tables.creator.CreatorTable
import java.sql.Connection
final case class SaveCreatorMessage(userId: String, entry: Entry) extends APIWithTokenMessage[Entry]:
  override def plan(connection: Connection): IO[Entry] =
    for
      _ <- services.user.api.RequireAdminMessage(userId).plan(connection)
      _ <- IO.raiseWhen(entry.title.trim.isEmpty || !entry.slug.matches("[a-z0-9]+(?:-[a-z0-9]+)*"))(HttpError.BadRequest("A title and a lowercase URL slug are required"))
      _ <- IO.raiseWhen(entry.source.nonEmpty && !entry.source.startsWith("https://"))(HttpError.BadRequest("Sources must use HTTPS"))
      _ <- IO.raiseWhen(entry.image.nonEmpty && !entry.image.startsWith("/art/") && !entry.image.startsWith("/images/") && !entry.image.startsWith("https://"))(HttpError.BadRequest("Images must use HTTPS or a local archive path"))
      id <- if entry.id.isEmpty then IO(java.util.UUID.randomUUID().toString) else IO.pure(entry.id)
      saved <- CreatorTable.save(connection,entry.copy(id=id))
    yield saved
