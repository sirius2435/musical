package services.catalog.api
import cats.effect.IO
import cats.syntax.all.*
import services.system.api.APIWithTokenMessage
import services.user.api.RequireAdminMessage
import services.catalog.tables.productioncreator.ProductionCreatorTable
import services.catalog.tables.productionsong.ProductionSongTable
import services.catalog.tables.production.ProductionTable
import services.system.HttpError
import java.sql.Connection
final case class UpdateProductionRelationsMessage(userId: String,productionId: String,creatorIds: List[String],songIds: List[String]) extends APIWithTokenMessage[Boolean]:
  override def plan(connection: Connection): IO[Boolean] =
    for
      _ <- RequireAdminMessage(userId).plan(connection)
      _ <- ProductionTable.find(connection,productionId).flatMap(e => IO.fromOption(e)(HttpError.NotFound("Production not found")))
      existing <- ProductionCreatorTable.list(connection,productionId)
      _ <- existing.filterNot(creatorIds.contains).traverse_(id => ProductionCreatorTable.unlink(connection,productionId,id))
      _ <- ProductionSongTable.clear(connection,productionId)
      _ <- creatorIds.distinct.traverse_(id => ProductionCreatorTable.link(connection,productionId,id,"Contributor"))
      _ <- songIds.distinct.traverse_(id => ProductionSongTable.link(connection,productionId,id))
    yield true
