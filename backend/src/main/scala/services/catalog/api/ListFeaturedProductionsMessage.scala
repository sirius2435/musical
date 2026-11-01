package services.catalog.api

import cats.effect.IO
import services.system.api.NoRequestMessage
import services.catalog.objects.Entry
import services.catalog.tables.production.ProductionTable
import java.sql.Connection

final case class ListFeaturedProductionsMessage() extends NoRequestMessage[List[Entry]]:
  override def plan(connection: Connection): IO[List[Entry]] =
    ProductionTable.list(connection, "", "", "chronological").map { productions =>
      List("carousel", "south-pacific", "the-king-and-i", "west-side-story")
        .flatMap(slug => productions.find(_.slug == slug))
    }
