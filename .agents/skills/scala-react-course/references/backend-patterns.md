# 后端模式：消息、表与可信身份

对应规则 1–38。编码前读 [原文](rules.txt) 与 [Scala 风格](scala-style.md)；新增要求与样例差异见 [来源表](sources-and-conflicts.md)。下面是实现模式，不擅自改变条文强度。只提取任务需要的部分。

## 1. 目录与依赖

```text
src/main/scala/services/
  system/
    api/                  # 消息抽象、注册和分发
    objects/              # 系统错误等
    routes/               # 总路由
    utils/                # 系统内部会话和资源工具
  user/
    api/                  # 身份和权限能力
    objects/
    routes/UserRoutes.scala
    tables/
    utils/
  books/
    api/
    objects/
      apiTypes/
    routes/BooksRoutes.scala
    tables/book/
      BookTable.scala
      BookTableInitializer.scala
```

目录按需创建。`system` 是基础设施归属的示例名称，不强迫重命名已有、合规且含义明确的系统服务。不要把维护责任误解为禁止调用其他服务的公开表方法。

以下片段使用 Scala 3、Cats Effect、Circe、JDBC；SQL 中的 `returning` 仅演示已使用 PostgreSQL 的项目。接入其他数据库时使用现有方言，不为示例更换数据库。

示例不是完整服务器：基础 API 类型和注册机制接入现有项目。注册机制至少需要公开 `api`、`apiWithToken`、`noRequest` 三种相应能力；其名称不要求逐字相同。用户服务的令牌校验和权限 API 使用已有实现，不用始终成功的占位实现替代。

## 2. 对象与线格式（规则 13–19、24）

一文件一个类型及伴生对象。此示例**明确选择对象形态的 ID**，例如 `{"value":"b-1"}`，前端示例采用同一形态。既有项目若约定字符串 ID，保留其 codec 与前端类型，不机械套用这个形态。普通记录使用派生 codec；枚举在伴生对象转换。

`services/books/objects/BookId.scala`：

```scala
package services.books.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

final case class BookId(value: String)

object BookId:
  given Encoder[BookId] = deriveEncoder[BookId]
  given Decoder[BookId] = deriveDecoder[BookId]
```

`services/books/objects/BookRecord.scala`：

```scala
package services.books.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

final case class BookRecord(id: BookId, title: String)

object BookRecord:
  given Encoder[BookRecord] = deriveEncoder[BookRecord]
  given Decoder[BookRecord] = deriveDecoder[BookRecord]
```

`services/books/objects/apiTypes/BookListResponse.scala`：

```scala
package services.books.objects.apiTypes

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import services.books.objects.BookRecord

final case class BookListResponse(books: List[BookRecord])

object BookListResponse:
  given Encoder[BookListResponse] = deriveEncoder[BookListResponse]
  given Decoder[BookListResponse] = deriveDecoder[BookListResponse]
```

已有用户服务提供 `UserId` 和权限判断；不要为了本示例再造一套身份模型。有限状态使用枚举或封闭类型；枚举 codec 复用伴生对象的 `toString/fromString`，将规范化与非法输入处理集中在同处。

## 3. 表方法与初始化（规则 7–8、34–38）

`services/books/tables/book/BookTable.scala`：

```scala
package services.books.tables.book

import cats.effect.{IO, Resource}
import services.books.objects.{BookId, BookRecord}

import java.sql.{Connection, PreparedStatement, ResultSet}

object BookTable:
  private val findByIdSql: String =
    "select id, title from books where id = ?"

  def findById(connection: Connection, id: BookId): IO[Option[BookRecord]] =
    query(connection, findByIdSql)(_.setString(1, id.value))(readOptional)

  private val listAllSql: String =
    "select id, title from books order by id"

  def listAll(connection: Connection): IO[List[BookRecord]] =
    query(connection, listAllSql)(_ => ())(readAll)

  private val renameSql: String =
    "update books set title = ? where id = ? returning id, title"

  def rename(connection: Connection, id: BookId, title: String): IO[Option[BookRecord]] =
    query(connection, renameSql) { statement =>
      statement.setString(1, title)
      statement.setString(2, id.value)
    }(readOptional)

  private def query[A](connection: Connection, sql: String)(
    bind: PreparedStatement => Unit
  )(read: ResultSet => IO[A]): IO[A] =
    Resource.fromAutoCloseable(IO.blocking(connection.prepareStatement(sql))).use { statement =>
      IO.blocking(bind(statement)).flatMap { _ =>
        Resource.fromAutoCloseable(IO.blocking(statement.executeQuery())).use(read)
      }
    }

  private def readBook(rows: ResultSet): IO[BookRecord] =
    IO.blocking(BookRecord(BookId(rows.getString("id")), rows.getString("title")))

  private def readOptional(rows: ResultSet): IO[Option[BookRecord]] =
    IO.blocking(rows.next()).flatMap {
      case true => readBook(rows).map(Some(_))
      case false => IO.pure(None)
    }

  private def readAll(rows: ResultSet): IO[List[BookRecord]] =
    def remaining(accumulated: List[BookRecord]): IO[List[BookRecord]] =
      IO.blocking(rows.next()).flatMap {
        case true => readBook(rows).flatMap(book => remaining(book :: accumulated))
        case false => IO.pure(accumulated.reverse)
      }

    remaining(Nil)
```

公开方法只接业务参数和连接；任意 SQL 入口仅为对象内部的私有实现。上面选择 `Resource` 管理语句和结果集。原始 60 条不规定异常语法，但本次 V2 明确要求 Scala 不写传统 `try/catch/finally`。samples 表代码使用 finally、连接模块使用 Resource 的差异见来源表 C01；新代码采用这里的 Resource 或既有等价封装，不能省略释放，也不能把 Resource 声称为课件强制指定。

`services/books/tables/book/BookTableInitializer.scala`：

```scala
package services.books.tables.book

import cats.effect.{IO, Resource}

import java.sql.Connection

object BookTableInitializer:
  private val initializeSql: String =
    """
      |create table if not exists books (
      |  id text primary key,
      |  title text not null check (length(trim(title)) > 0)
      |)
      |""".stripMargin

  def initialize(connection: Connection): IO[Unit] =
    Resource.fromAutoCloseable(IO.blocking(connection.createStatement())).use { statement =>
      IO.blocking(statement.execute(initializeSql)).void
    }
```

启动模块组合各表的初始化方法，建表 SQL 留在各表文件中。表方法不自行提交、回滚或另开连接破坏上层事务。

## 4. 三类消息（规则 20–30）

沿用项目中下列抽象形态，每个抽象各在自己的文件中：

```scala
package services.system.api

import cats.effect.IO

import java.sql.Connection

trait APIMessage[Response]:
  def plan(connection: Connection): IO[Response]
```

```scala
package services.system.api

trait NoRequestMessage[Response] extends APIMessage[Response]
```

```scala
package services.system.api

trait APIWithTokenMessage[Response] extends APIMessage[Response]
```

`services/books/api/GetBookAPIMessage.scala`，普通公开查询：

```scala
package services.books.api

import cats.effect.IO
import services.books.objects.{BookId, BookRecord}
import services.books.tables.book.BookTable
import services.system.api.APIMessage

import java.sql.Connection

final case class GetBookAPIMessage(bookId: BookId) extends APIMessage[BookRecord]:
  override def plan(connection: Connection): IO[BookRecord] =
    BookTable.findById(connection, bookId).flatMap {
      case Some(book) => IO.pure(book)
      case None => IO.raiseError(new NoSuchElementException("图书不存在"))
    }
```

`services/books/api/ListBooksAPIMessage.scala`，无业务输入：

```scala
package services.books.api

import cats.effect.IO
import services.books.objects.apiTypes.BookListResponse
import services.books.tables.book.BookTable
import services.system.api.NoRequestMessage

import java.sql.Connection

final case class ListBooksAPIMessage() extends NoRequestMessage[BookListResponse]:
  override def plan(connection: Connection): IO[BookListResponse] =
    BookTable.listAll(connection).map(BookListResponse(_))
```

`services/books/api/RenameBookAPIMessage.scala`，令牌经路由校验后再检查权限：

```scala
package services.books.api

import cats.effect.IO
import services.books.objects.{BookId, BookRecord}
import services.books.tables.book.BookTable
import services.system.api.APIWithTokenMessage
import services.user.api.RequireAdminUserAPIMessage
import services.user.objects.UserId

import java.sql.Connection

final case class RenameBookAPIMessage(
  userId: UserId,
  bookId: BookId,
  title: String
) extends APIWithTokenMessage[BookRecord]:
  override def plan(connection: Connection): IO[BookRecord] =
    for
      _ <- RequireAdminUserAPIMessage(userId).plan(connection)
      cleanTitle <- IO.fromEither(
        Either.cond(title.trim.nonEmpty, title.trim, new IllegalArgumentException("书名不能为空"))
      )
      result <- BookTable.rename(connection, bookId, cleanTitle)
      book <- IO.fromOption(result)(new NoSuchElementException("图书不存在"))
    yield book
```

示例用标准异常表达两种失败，不指定 HTTP 状态码。实际接入时使用项目中已有的、被路由映射的业务错误类型，并验证不存在、非法输入和权限不足的 HTTP 响应；不要让业务失败意外落到统一 500。

这里复用已有 `RequireAdminUserAPIMessage`，它在用户服务内验证用户有效性与管理员权限。它可以调用用户服务公开表方法，或服务内部工具；若仅供后端调用，不要求注册路由或创建前端调用器。

消息不打开新事务、不运行 `unsafeRunSync`。对其他消息和表的调用都继续使用传入的 `connection`。校验可以是纯 `Either` 函数，进入 `IO` 时提升；不是所有小校验都需要新建 utils 文件。

## 5. 注册和信任边界（规则 28–33）

下面使用与本地模板相同的注册器接口：`api` 解码普通消息，`apiWithToken` 先解析令牌再解码，`noRequest` 构造无输入消息。注册器与 HTTP 分发器由系统服务维护，不在每个业务服务复制。

`services/books/routes/BooksRoutes.scala`：

```scala
package services.books.routes

import io.circe.generic.auto.*
import services.books.api.{GetBookAPIMessage, ListBooksAPIMessage, RenameBookAPIMessage}
import services.books.objects.BookRecord
import services.books.objects.apiTypes.BookListResponse
import services.system.api.RegisteredAPIMessage
import services.system.api.RegisteredAPIMessage.{api, apiWithToken, noRequest}

object BooksRoutes:
  val apiMessages: List[RegisteredAPIMessage] = List(
    api[GetBookAPIMessage, BookRecord],
    noRequest[ListBooksAPIMessage, BookListResponse](ListBooksAPIMessage()),
    apiWithToken[RenameBookAPIMessage, BookRecord]
  )
```

注册器可使用泛型派生的消息 Decoder；对象层响应记录仍使用同名伴生对象 codec。顶层按 `UserRoutes.apiMessages ++ BooksRoutes.apiMessages` 合并，不重复逐个列出消息。

对于 `RenameBookAPIMessage`，完整顺序是：

```text
收到 {bookId: {value: "b-1"}, title: "新书名", userToken: "..."}
  → 查到令牌消息注册信息
  → 在本次操作的连接中，通过用户服务校验令牌（失效即失败）
  → 删除 token，使用解析得到的身份覆盖任何自报 userId
  → 解码并构造 RenameBookAPIMessage(trustedUserId, bookId, title)
  → RequireAdminUserAPIMessage(trustedUserId).plan(connection)
  → 校验书名并调用公开 BookTable.rename
  → 在明确事务边界提交或回滚
```

身份替换是路由基础设施责任，不是业务逻辑。不能仅继承一个标记 trait 就假设已经安全；必须核对注册方式与分发器行为。传入合法 token 并同时伪造 `userId` 时，后端仍只能使用 token 对应身份。

## 6. 命名与前端契约（规则 29、31、48–53）

本组示例统一使用“去末尾 `Message` 再转小写”，实际项目沿用已选定的统一规则。

| 后端消息 | 前端类 | 本示例路由名 |
| --- | --- | --- |
| GetBookAPIMessage | GetBookAPI | getbookapi |
| ListBooksAPIMessage | ListBooksAPI | listbooksapi |
| RenameBookAPIMessage | RenameBookAPI | renamebookapi |

路由名从类型名推导，不在每个消息或调用器手写字符串。系统推导器需要正确处理后缀，不能仅支持 `APIMessage` 却错误处理普通 `SomeActionMessage`。

| 操作 | 外部请求 | 内部消息 | 响应 |
| --- | --- | --- | --- |
| 查询 | bookId 对象 | 相同 bookId | `{id: {value: "b-1"}, title: "书名"}` |
| 列表 | 无业务输入；按既有协议发送空对象或无体 | ListBooksAPIMessage() | `{books: [...]}` |
| 改名 | bookId、title、userToken | bookId、title、可信 UserId | 同查询响应结构 |

## 7. 内部工具与副作用（规则 8–12、22、27、37）

服务内部工具函数使用 `private[books] def` 等可见性。同一逻辑被复用或 plan 过长时再提取。其他服务需要业务能力时调用消息，需要持久化时调用公开表方法。

数据库、时间、随机值、文件和网络操作明确放入 `IO` 等已采用的执行模型，不把副作用藏进 objects 的纯外观方法。避免在 IO 构造之前执行 JDBC，也避免为一个业务操作另取连接。

本次 V2 使用 val，不用 var、命令式 for 和传统 try/catch/finally；Try[T] 与 IO 的 for/yield 保留，依据与待确认范围见 Scala 风格及来源表 C01–C03。不能把这组 Scala 约束扩散到 TypeScript/Python。取消时的回滚和连接释放尤其需要由实际事务工具保证。

## 8. 服务、领域与传输的检查路径（BE01–BE03）

一个服务围绕明确业务负责 API、对象和表，是维护与封装边界；API 是调用其能力的契约。示例 RenameBook 调用用户服务的权限消息，再调用图书表方法，体现高内聚与允许的公开协作，而非依赖用户服务私有 utils。

对象与序列化分三处检查：BookRecord 表达领域记录；BookListResponse 表达本 API 响应；BookTable.readBook 将 JDBC 行映射为领域记录。数据库列的 String 与领域 BookId 的转换只在表模块完成。前端读取的 JSON 必须与 codec 一致；反序列化后仍需校验业务约束。

例中 bookId 标识特定领域，title 是普通文本；不要因为避免基础类型滥用而自动包装所有字段。若项目已有更精确的 ISBN、金额等值类型，保留它们并显式处理边界。枚举在伴生对象集中转换；数据库和 API 表示相同则不创建两套不必要命名。

核心校验可用纯 Either 函数；plan 用 IO.fromEither 提升后组合权限、查询和写入。不要将数据库工作放到 Try 中提前执行。多表业务继续复用传入连接，表模块不决定业务权限或另行提交。索引、约束及初始化仍由所属表维护。
