package services.favorites.routes
import io.circe.generic.auto.*
import services.system.api.RegisteredAPIMessage
import services.system.api.RegisteredAPIMessage.{api,apiWithToken}
import services.favorites.api.*
import services.catalog.objects.Entry
import services.user.objects.*
object FavoritesRoutes:
  val apiMessages: List[RegisteredAPIMessage] = List(
    apiWithToken[ListFavoritesMessage,List[String]],
    apiWithToken[SetFavoriteMessage,Boolean]
  )
