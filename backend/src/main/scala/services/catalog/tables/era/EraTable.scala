package services.catalog.tables.era
import cats.effect.{IO,Resource}
import cats.syntax.all.*
import services.catalog.objects.Entry
import java.sql.Connection
object EraTable:
  private val listSql = """select * from eras where (? = '' or concat_ws(' ', title, subtitle, summary, category) ilike ? ) and (? = '' or category = ?) order by case when ? = 'alphabetical' then title end, year, title"""
  def list(connection: Connection, keyword: String, category: String, sort: String): IO[List[Entry]] = query(connection,listSql)(q => { q.setString(1, keyword); q.setString(2, "%" + keyword + "%"); q.setString(3, category); q.setString(4, category); q.setString(5, sort) })(rows)
  private val findSql = "select * from eras where slug=? or id=?"
  def find(connection: Connection, slug: String): IO[Option[Entry]] = query(connection,findSql)(q => {q.setString(1,slug);q.setString(2,slug)})(rows).map(_.headOption)
  private val saveSql = """insert into eras (id,slug,title,subtitle,summary,body,category,year,era_id,source,image) values (?,?,?,?,?,?,?,?,?,?,?) on conflict(id) do update set slug=excluded.slug,title=excluded.title,subtitle=excluded.subtitle,summary=excluded.summary,body=excluded.body,category=excluded.category,year=excluded.year,era_id=excluded.era_id,source=excluded.source,image=excluded.image returning *"""
  def save(connection: Connection, e: Entry): IO[Entry] = query(connection,saveSql)(q => {
    q.setString(1,e.id);q.setString(2,e.slug);q.setString(3,e.title);q.setString(4,e.subtitle);q.setString(5,e.summary);q.setString(6,e.body);q.setString(7,e.category);q.setInt(8,e.year);q.setString(9,e.eraId.orNull);q.setString(10,e.source);q.setString(11,e.image)
  })(rows).flatMap(r => IO.fromOption(r.headOption)(new IllegalStateException("Save failed")))
  private val imageSql = "update eras set image=? where slug=?"
  def updateImage(connection: Connection, slug: String, image: String): IO[Unit] =
    Resource.fromAutoCloseable(IO.blocking(connection.prepareStatement(imageSql))).use(s => IO.blocking { s.setString(1,image); s.setString(2,slug); s.executeUpdate() }.void)
  private val deleteSql = "delete from eras where id=? returning *"
  def delete(connection: Connection,id: String): IO[Boolean] = query(connection,deleteSql)(_.setString(1,id))(rows).map(_.nonEmpty)
  private def query[A](connection: Connection, sql: String)(bind: java.sql.PreparedStatement => Unit)(read: java.sql.ResultSet => IO[A]): IO[A] =
    Resource.fromAutoCloseable(IO.blocking(connection.prepareStatement(sql))).use { statement =>
      IO.blocking(bind(statement)) *> Resource.fromAutoCloseable(IO.blocking(statement.executeQuery())).use(read)
    }
  private def rows(r: java.sql.ResultSet): IO[List[Entry]] =
    IO.blocking(r.next()).flatMap {
      case false => IO.pure(Nil)
      case true => read(r).flatMap(e => rows(r).map(e :: _))
    }
  private def read(r: java.sql.ResultSet): IO[Entry] = IO.blocking(Entry(r.getString("id"), r.getString("slug"), r.getString("title"), r.getString("subtitle"), r.getString("summary"), r.getString("body"), r.getString("category"), r.getInt("year"), Option(r.getString("era_id")), r.getString("source"), r.getString("image")))
