package services.favorites.api
import cats.effect.IO
import cats.syntax.all.*
import services.system.api.APIWithTokenMessage
import services.user.objects.*
import services.favorites.tables.favorite.FavoriteTable
import java.sql.Connection
final case class SetFavoriteMessage(userId: String, productionId: String, saved: Boolean) extends APIWithTokenMessage[Boolean]:
  override def plan(connection: Connection): IO[Boolean] =
    (if saved then FavoriteTable.add(connection,userId,productionId) else FavoriteTable.remove(connection,userId,productionId)).as(saved)
