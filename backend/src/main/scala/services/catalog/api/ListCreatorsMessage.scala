package services.catalog.api
import cats.effect.IO
import cats.syntax.all.*
import services.system.api.APIMessage
import services.user.objects.*
import services.catalog.objects.Entry
import services.catalog.tables.creator.CreatorTable
import java.sql.Connection
final case class ListCreatorsMessage(keyword: String = "", category: String = "", sort: String = "chronological") extends APIMessage[List[Entry]]:
  override def plan(connection: Connection): IO[List[Entry]] =
    CreatorTable.list(connection,keyword,category,sort)
