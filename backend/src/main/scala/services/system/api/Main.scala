package services.system.api
import cats.effect.{IO,IOApp}
import cats.syntax.all.*
import com.comcast.ip4s.{host,Port}
import org.http4s.ember.server.EmberServerBuilder
import org.http4s.implicits.*
import services.system.DatabaseSession
import services.user.routes.UserRoutes
import services.catalog.routes.CatalogRoutes
import services.favorites.routes.FavoritesRoutes
import services.user.api.ResolveTokenMessage
import io.circe.syntax.*
import services.user.tables.users.UserTableInitializer
import services.user.tables.sessions.SessionTableInitializer
import services.favorites.tables.favorite.FavoriteTableInitializer
import services.catalog.tables.era.EraTableInitializer
import services.catalog.tables.production.ProductionTableInitializer
import services.catalog.tables.song.SongTableInitializer
import services.catalog.tables.creator.CreatorTableInitializer
import services.catalog.tables.productioncreator.ProductionCreatorTableInitializer
import services.catalog.tables.productionsong.ProductionSongTableInitializer
object Main extends IOApp.Simple:
  override def run: IO[Unit] = DatabaseSession.initialize.use { _ =>
    for
      _ <- DatabaseSession.withTransactionConnection(c =>
        UserTableInitializer.initialize(c) *> SessionTableInitializer.initialize(c) *>
        EraTableInitializer.initialize(c) *> ProductionTableInitializer.initialize(c) *> SongTableInitializer.initialize(c) *> CreatorTableInitializer.initialize(c) *>
        FavoriteTableInitializer.initialize(c) *> ProductionCreatorTableInitializer.initialize(c) *> ProductionSongTableInitializer.initialize(c) *> Seed.initialize(c))
      _ <- EmberServerBuilder.default[IO].withHost(host"127.0.0.1").withPort(Port.fromInt(sys.env.getOrElse("HTTP_PORT","8082").toInt).get)
        .withHttpApp(APIMessageRouter.routes(UserRoutes.apiMessages ++ CatalogRoutes.apiMessages ++ FavoritesRoutes.apiMessages,(token,c) => ResolveTokenMessage(token).plan(c).map(_.asJson)).orNotFound).build.useForever
    yield ()
  }
