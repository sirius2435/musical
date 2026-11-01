package services.catalog.api
import cats.effect.IO
import cats.syntax.all.*
import services.system.api.APIMessage
import services.user.objects.*
import services.catalog.objects.Entry
import services.catalog.tables.production.ProductionTable
import java.sql.Connection
final case class ListProductionsMessage(keyword: String = "", category: String = "", sort: String = "chronological") extends APIMessage[List[Entry]]:
  override def plan(connection: Connection): IO[List[Entry]] =
    ProductionTable.list(connection,keyword,category,sort)
