# Scala 编码风格（V2）

编码前阅读。本文件补充语言风格，不改写 [60 条原文](rules.txt)。规范编号 SCxx 的证据与冲突见 [来源表](sources-and-conflicts.md)。**Lec2 原始课件缺失；Lec3 页码仅来自用户整理，未核验原始课件。** 明确禁令以本次 V2 用户要求为依据，不能描述为已查到课件原句。

## 1. 不可变绑定与集合转换（SC01、SC02、SC03）

- Scala 新代码使用 `val`，不使用 `var`。`val` 只保证绑定不变，不能借可变集合和累加器绕过本次函数式要求。
- 对集合优先使用 map、flatMap、filter 等表达变换。不使用“逐次修改累加器”的命令式 for；已有样例使用 builder/while 是差异证据，不是直接复制的依据。
- 不从这条要求自行推导所有 while、Java 库内部可变实现或其他语言的 for 都被课程禁止。需要改写的循环按真实数据流转为集合操作或递归，不以 foreach 隐藏同样的副作用累加。

```scala
def normalizedTitles(values: List[String]): List[String] =
  values.map(_.trim).filter(_.nonEmpty)

def parsePositiveCounts(values: List[String]): List[Int] =
  values.flatMap(_.toIntOption).filter(_ > 0)
```

## 2. for 与 for/yield 分别判断（SC03、SC09）

检查生成器所在类型、最终返回值、是否修改外部状态，不能以关键词 `for` 判违规。

- 命令式 for：为重复副作用或更新累加器服务，本次要求不使用。
- IO 的 for/yield：组合有依赖的 effect，不是命令式循环。`BorrowBookAPIMessage.scala` 20–36 行有直接样例，规则 22 要求显式组合副作用；V2 保留这种写法。
- Option、Either 或集合上的 for/yield：按 map/flatMap 组合表达理解。现有材料没有提供 Lec2 对其全部范围的原文，不能宣称课程全面禁用；有疑义时优先直接 map/flatMap，并记录需补核课件。

```scala
import cats.effect.IO

def combine[A, B](first: IO[A], next: A => IO[B]): IO[B] =
  for
    value <- first
    result <- next(value)
  yield result
```

该泛型函数只解释组合机制，不要求实际 API 增加通用转发层。

## 3. 缺失、失败与异常语法（SC04、SC05、SC08）

| 机制 | 用途 | 本次要求 |
| --- | --- | --- |
| Option[T] | 缺失或存在 | 使用明确分支表达查询无结果等情况 |
| Either[E, T] | 带业务原因的失败或成功 | 用于纯校验等；进入 IO 时提升 |
| Try[T] | 捕获同步计算可能抛出的异常，产生结果值 | 允许；不可与 try 关键字混淆 |
| try/catch/finally | 传统异常控制语法 | Scala 课程新代码不使用，依据本次 V2 明确要求 |
| IO[T] 及错误通道 | 描述和组合外部操作 | 用 attempt、handleErrorWith、IO.fromEither 等已有机制处理结果 |

```scala
import scala.util.Try

def parseCount(raw: String): Either[String, Int] =
  Try(raw.toInt).toEither.left.map(_ => "数量必须是整数").flatMap { count =>
    Either.cond(count > 0, count, "数量必须大于零")
  }

def findTitle(titles: Map[String, String], id: String): Option[String] =
  titles.get(id)
```

上面保留 String/Int 作为解析边界和文本表示，不代表不同业务身份都使用 String。不要用未经处理的 `.get` 假设结果必然成功；根据业务选择 match、fold、map/flatMap 或转换为明确失败。

`Try` 的计算在构造 Try 时发生，它不是延迟执行的 IO，不能把 JDBC/网络工作放进 Try 就认为满足 IO 副作用边界。已有样例的 Try(UUID.fromString(...)) 是同步解析，不是数据库工作。

## 4. 数据模型与类型选择（SC06、SC07）

| 类型 | 场景 | 边界 |
| --- | --- | --- |
| final case class + 同名伴生对象 codec | 领域记录、请求响应数据、业务值 | 遵守规则 13–15；一文件一个有意义的对象 |
| trait | 共享能力或协议，例如 APIMessage[Response] | 避免让类型层级替代简单业务输入 |
| abstract class | 需要共享构造参数或基础实现的抽象父类 | 只在已有模型需要时采用，不要求所有对象继承一个基类 |
| enum / sealed 类型 | 有限状态、角色、分类、结果分支 | 遵守规则 17–19，转换与编解码集中 |

领域中容易混淆的身份应明确区分，例如 BookId 与 UserId；具有有限取值的角色不使用任意 String。普通书名、数量、序列化与数据库边界仍可使用合适的基础类型。samples 中 BookId 是包装类型，而 BookSaveData 使用 String/Int，不能据“避免滥用”推出包装所有字段。

领域对象不放时钟、随机 ID、数据库访问、权限和工作流。数据库行映射在表模块，API 传输对象在 objects/apiTypes。此处是规则 13–24 的应用，没有新增领域驱动设计框架要求。

## 5. 纯计算、Monad 与 IO（SC09、SC10）

map 转换内部值；flatMap 串联返回同类计算上下文的下一步。Monad 是可组合结构，不要求为每个业务创建自己的 Monad 实现。

纯函数只依赖输入并返回结果。时间、随机、日志、数据库、文件和网络等外部依赖用已采用的 Cats Effect IO 组织，在边界运行；业务消息不自行调用运行时。

```scala
import cats.effect.IO

def validateTitle(raw: String): Either[String, String] =
  Either.cond(raw.trim.nonEmpty, raw.trim, "书名不能为空")

def normalizeForSave(raw: String): IO[String] =
  IO.fromEither(validateTitle(raw).left.map(new IllegalArgumentException(_)))
```

具体 API 仍实现 plan(connection): IO[Response]，不能用上面的解释性函数替代 API 架构。数据库调用使用 IO.blocking 等项目已有机制；详细表与消息示例见 [后端模式](backend-patterns.md)。

## 6. JDBC 资源差异（SC05、BE03）

样例 BookTable 使用 IO.blocking 内的 try/finally，DatabaseSession 同时使用 Resource 管理连接。这证明样例有多种资源写法，不能断言所有样例已符合本次语言禁令。

新写或本次重构的 Scala JDBC 代码，推荐 Resource.fromAutoCloseable/use 管理 Statement 和 ResultSet，复用传入 Connection；这与 IO 架构及本次不写 finally 的要求兼容。**Resource 是推荐方案，不是已核验的课件强制指定工具。** 可用现有等价且符合要求的封装，不能为了不用关键字而遗漏 close，也不把任务扩为替换全部历史代码。

取消、错误和正常完成时的释放与回滚仍需实际验证。连接池返回连接不自动证明业务事务已正确回滚；samples 的事务代码不是取消安全已经验证的证据。
