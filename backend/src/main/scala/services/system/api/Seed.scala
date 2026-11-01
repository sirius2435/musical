package services.system.api
import cats.effect.IO
import cats.syntax.all.*
import io.circe.parser.parse
import services.catalog.objects.Entry
import services.catalog.tables.era.EraTable
import services.catalog.tables.production.ProductionTable
import services.catalog.tables.song.SongTable
import services.catalog.tables.creator.CreatorTable
import services.catalog.tables.productionsong.ProductionSongTable
import services.catalog.tables.productioncreator.ProductionCreatorTable
import services.system.tables.seed.{SeedTable,SeedTableInitializer}
import services.user.api.RegisterMessage
import services.user.tables.users.UserTable
import java.sql.Connection
object Seed:
  def initialize(c: Connection): IO[Unit] =
    for
      _ <- SeedTableInitializer.initialize(c)
      done <- SeedTable.exists(c)
      _ <- if done then IO.unit else load(c)
      mediaDone <- SeedTable.mediaExists(c)
      _ <- if mediaDone then IO.unit else refreshImages(c)
      _ <- (sys.env.get("STAGE_ADMIN_EMAIL"),sys.env.get("STAGE_ADMIN_PASSWORD")) match
        case (Some(email),Some(password)) => UserTable.find(c,email.trim.toLowerCase).flatMap {
          case Some(_) => IO.unit
          case None => RegisterMessage(email,"Archive Curator",password).plan(c).flatMap(auth => UserTable.promote(c,auth.user.id))
        }
        case _ => IO.unit
    yield ()
  private def readSeed: IO[String] =
    IO.blocking(java.nio.file.Files.readString(java.nio.file.Paths.get(sys.env.getOrElse("STAGE_SEED_FILE","seed.json"))))
  private def load(c: Connection): IO[Unit] =
    for
      raw <- readSeed
      json <- IO.fromEither(parse(raw))
      eras <- IO.fromEither(json.hcursor.get[List[Entry]]("eras"))
      productions <- IO.fromEither(json.hcursor.get[List[Entry]]("productions"))
      songs <- IO.fromEither(json.hcursor.get[List[Entry]]("songs"))
      creators <- IO.fromEither(json.hcursor.get[List[Entry]]("creators"))
      _ <- eras.traverse_(EraTable.save(c,_))
      _ <- productions.traverse_(ProductionTable.save(c,_))
      _ <- songs.traverse_(SongTable.save(c,_))
      _ <- creators.traverse_(CreatorTable.save(c,_))
      _ <- List("if-i-loved-you","soliloquy").traverse_(ProductionSongTable.link(c,"carousel",_))
      _ <- List("carefully-taught","wash-that-man").traverse_(ProductionSongTable.link(c,"south-pacific",_))
      _ <- List("carousel","south-pacific","the-king-and-i","oklahoma").traverse_(p => ProductionCreatorTable.link(c,p,"richard-rodgers","Composer") *> ProductionCreatorTable.link(c,p,"oscar-hammerstein","Lyricist / book writer"))
      _ <- ProductionCreatorTable.link(c,"west-side-story","leonard-bernstein","Composer") *> ProductionCreatorTable.link(c,"west-side-story","stephen-sondheim","Lyricist")
      _ <- ProductionCreatorTable.link(c,"south-pacific","joshua-logan","Book writer")
      _ <- ProductionCreatorTable.link(c,"my-fair-lady","frederick-loewe","Composer")
      _ <- ProductionCreatorTable.link(c,"my-fair-lady","alan-jay-lerner","Lyricist / book writer")
      _ <- ProductionCreatorTable.link(c,"west-side-story","arthur-laurents","Book writer")
      _ <- ProductionCreatorTable.link(c,"west-side-story","jerome-robbins","Conception / choreography")
      _ <- ProductionCreatorTable.link(c,"hair","galt-macdermot","Composer")
      _ <- ProductionCreatorTable.link(c,"hair","gerome-ragni","Lyricist / book writer")
      _ <- ProductionCreatorTable.link(c,"hair","james-rado","Lyricist / book writer")
      _ <- ProductionCreatorTable.link(c,"grease","jim-jacobs","Music / lyrics / book")
      _ <- ProductionCreatorTable.link(c,"grease","warren-casey","Music / lyrics / book")
      _ <- SeedTable.mark(c)
    yield ()
  private def refreshImages(c: Connection): IO[Unit] =
    for
      raw <- readSeed
      json <- IO.fromEither(parse(raw))
      eras <- IO.fromEither(json.hcursor.get[List[Entry]]("eras"))
      productions <- IO.fromEither(json.hcursor.get[List[Entry]]("productions"))
      songs <- IO.fromEither(json.hcursor.get[List[Entry]]("songs"))
      creators <- IO.fromEither(json.hcursor.get[List[Entry]]("creators"))
      _ <- eras.traverse_(e => EraTable.updateImage(c,e.slug,e.image))
      _ <- productions.traverse_(e => ProductionTable.updateImage(c,e.slug,e.image))
      _ <- songs.traverse_(e => SongTable.updateImage(c,e.slug,e.image))
      _ <- creators.traverse_(e => CreatorTable.updateImage(c,e.slug,e.image))
      _ <- SeedTable.markMedia(c)
    yield ()
