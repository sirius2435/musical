package services.catalog.api
import cats.effect.IO
import cats.syntax.all.*
import services.system.api.APIWithTokenMessage
import services.system.HttpError
import services.user.objects.*
import services.catalog.objects.Entry
import services.catalog.tables.production.ProductionTable
import java.sql.Connection
final case class DeleteProductionMessage(userId: String, id: String) extends APIWithTokenMessage[Boolean]:
  override def plan(connection: Connection): IO[Boolean] =
    services.user.api.RequireAdminMessage(userId).plan(connection) *> ProductionTable.delete(connection,id).flatMap(deleted => if deleted then IO.pure(true) else IO.raiseError(HttpError.NotFound("Entry not found")))
