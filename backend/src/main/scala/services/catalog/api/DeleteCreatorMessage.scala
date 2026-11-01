package services.catalog.api
import cats.effect.IO
import cats.syntax.all.*
import services.system.api.APIWithTokenMessage
import services.system.HttpError
import services.user.objects.*
import services.catalog.objects.Entry
import services.catalog.tables.creator.CreatorTable
import java.sql.Connection
final case class DeleteCreatorMessage(userId: String, id: String) extends APIWithTokenMessage[Boolean]:
  override def plan(connection: Connection): IO[Boolean] =
    services.user.api.RequireAdminMessage(userId).plan(connection) *> CreatorTable.delete(connection,id).flatMap(deleted => if deleted then IO.pure(true) else IO.raiseError(HttpError.NotFound("Entry not found")))
