package services.catalog.routes
import io.circe.generic.auto.*
import services.system.api.RegisteredAPIMessage
import services.system.api.RegisteredAPIMessage.{api,apiWithToken,noRequest}
import services.catalog.api.*
import services.catalog.objects.Entry
import services.user.objects.*
object CatalogRoutes:
  val apiMessages: List[RegisteredAPIMessage] = List(
    noRequest[ListFeaturedProductionsMessage,List[Entry]](ListFeaturedProductionsMessage()),
    noRequest[ListSongFunctionsMessage,List[services.catalog.objects.SongFunctionDefinition]](ListSongFunctionsMessage()),
    api[ListErasMessage,List[Entry]],
    api[GetEraMessage,Entry],
    apiWithToken[SaveEraMessage,Entry],
    apiWithToken[DeleteEraMessage,Boolean],
    api[ListProductionsMessage,List[Entry]],
    api[GetProductionMessage,Entry],
    apiWithToken[SaveProductionMessage,Entry],
    apiWithToken[DeleteProductionMessage,Boolean],
    api[ListSongsMessage,List[Entry]],
    api[GetSongMessage,Entry],
    apiWithToken[SaveSongMessage,Entry],
    apiWithToken[DeleteSongMessage,Boolean],
    api[ListCreatorsMessage,List[Entry]],
    api[GetCreatorMessage,Entry],
    apiWithToken[SaveCreatorMessage,Entry],
    apiWithToken[DeleteCreatorMessage,Boolean],
    apiWithToken[UpdateProductionRelationsMessage,Boolean],
    api[GetSongProductionsMessage,List[Entry]],
    api[GetProductionLinksMessage,services.catalog.objects.apiTypes.ProductionLinks]
  )
