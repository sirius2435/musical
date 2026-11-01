package services.catalog.api
import cats.effect.IO
import cats.syntax.all.*
import services.system.api.APIMessage
import services.user.objects.*
import java.sql.Connection
final case class GetProductionLinksMessage(id: String) extends APIMessage[services.catalog.objects.apiTypes.ProductionLinks]:
  override def plan(connection: Connection): IO[services.catalog.objects.apiTypes.ProductionLinks] =
    for
      creators <- services.catalog.tables.productioncreator.ProductionCreatorTable.list(connection,id)
      songs <- services.catalog.tables.productionsong.ProductionSongTable.list(connection,id)
    yield services.catalog.objects.apiTypes.ProductionLinks(creators,songs)
