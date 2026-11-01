package services.catalog.api
import cats.effect.IO
import cats.syntax.all.*
import services.system.api.APIMessage
import services.catalog.objects.Entry
import services.catalog.tables.productionsong.ProductionSongTable
import services.catalog.tables.production.ProductionTable
import java.sql.Connection
final case class GetSongProductionsMessage(id: String) extends APIMessage[List[Entry]]:
  override def plan(connection: Connection): IO[List[Entry]] = ProductionSongTable.owners(connection,id).flatMap(_.traverse(ProductionTable.find(connection,_))).map(_.flatten)
