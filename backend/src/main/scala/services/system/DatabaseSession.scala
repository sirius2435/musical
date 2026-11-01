package services.system
import cats.effect.{IO, Resource}
import java.sql.{Connection, DriverManager}
object DatabaseSession:
  def initialize: Resource[IO, Unit] = Resource.eval(IO.blocking(Class.forName("org.postgresql.Driver")))
  def withTransactionConnection[A](operation: Connection => IO[A]): IO[A] =
    Resource.fromAutoCloseable(IO.blocking(DriverManager.getConnection(sys.env.getOrElse("DATABASE_URL", "jdbc:postgresql://127.0.0.1:55432/stage_stories"), sys.env.getOrElse("DB_USER", "db"), sys.env.getOrElse("DB_PASSWORD", "root")))).use { connection =>
      IO.blocking(connection.setAutoCommit(false)) *> operation(connection).guaranteeCase {
        case cats.effect.kernel.Outcome.Succeeded(_) => IO.blocking(connection.commit())
        case _ => IO.blocking(connection.rollback())
      }
    }
