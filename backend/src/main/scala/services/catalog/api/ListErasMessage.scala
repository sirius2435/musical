package services.catalog.api
import cats.effect.IO
import cats.syntax.all.*
import services.system.api.APIMessage
import services.user.objects.*
import services.catalog.objects.Entry
import services.catalog.tables.era.EraTable
import java.sql.Connection
final case class ListErasMessage(keyword: String = "", category: String = "", sort: String = "chronological") extends APIMessage[List[Entry]]:
  override def plan(connection: Connection): IO[List[Entry]] =
    EraTable.list(connection,keyword,category,sort)
