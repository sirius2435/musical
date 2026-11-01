package services.user.routes
import io.circe.generic.auto.*
import services.system.api.RegisteredAPIMessage
import services.system.api.RegisteredAPIMessage.{api,apiWithToken}
import services.user.api.*
import services.catalog.objects.Entry
import services.user.objects.*
import services.user.objects.apiTypes.AuthResponse
object UserRoutes:
  val apiMessages: List[RegisteredAPIMessage] = List(
    api[RegisterMessage,AuthResponse],
    api[LoginMessage,AuthResponse],
    apiWithToken[CurrentUserMessage,UserProfile],
    apiWithToken[UpdateProfileMessage,UserProfile],
    apiWithToken[LogoutMessage,Boolean]
  )
