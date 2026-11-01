package services.favorites.api
import cats.effect.IO
import cats.syntax.all.*
import services.system.api.APIWithTokenMessage
import services.user.objects.*
import services.favorites.tables.favorite.FavoriteTable
import java.sql.Connection
final case class ListFavoritesMessage(userId: String) extends APIWithTokenMessage[List[String]]:
  override def plan(connection: Connection): IO[List[String]] =
    FavoriteTable.list(connection,userId)
