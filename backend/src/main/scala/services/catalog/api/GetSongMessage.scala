package services.catalog.api
import cats.effect.IO
import cats.syntax.all.*
import services.system.api.APIMessage
import services.system.HttpError
import services.user.objects.*
import services.catalog.objects.Entry
import services.catalog.tables.song.SongTable
import java.sql.Connection
final case class GetSongMessage(slug: String) extends APIMessage[Entry]:
  override def plan(connection: Connection): IO[Entry] =
    SongTable.find(connection,slug).flatMap(e => IO.fromOption(e)(HttpError.NotFound("Archive entry not found")))
