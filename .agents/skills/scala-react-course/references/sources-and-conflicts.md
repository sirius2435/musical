# 规范来源映射与冲突记录（V2）

## 1. 已取得和未取得的材料

| 来源 ID | 材料 | 可确认范围 |
| --- | --- | --- |
| R | [rules.txt](rules.txt) | 60 条原文，SHA-256 为 `6a720d72b729f65e5cfbdda95d618d7c48ca3d356dc398efd3db2ff757c8713a`；V2 不修改 |
| H | [课程手册](course-handbook.md) | 用户在会话提供的 Lec3–Lec5 整理；不是原始课件 PDF |
| U | 用户任务“完善 scala-react-course Skill（V2）”，2026-11-01 | 本次明确要求的编码约束、来源标记、流程、测试与交付；是执行依据，不伪装为课件原句 |
| S | [样例证据快照](../tests/source-evidence.json) | 从本工作区 samples 实际读取的路径、行号、文件哈希及摘录；样例是实现事实，可能与规范冲突 |
| O | [安装说明中的官方来源](installation.md) | 仅用于 Codex 安装和启用，不作为课程风格依据 |
| L2–L5 | Lec2–Lec5 原始课件 | 当前未取得。Lec2 页码未知；Lec3–Lec5 页码只引用 H 的索引，均未核验原件 |

材料冲突时保持 R 原文不动；执行 U 的明确补充并标明来源。samples 可证明实际使用，不能把不同写法自动上升为允许覆盖规则。缺原件时不声称“课件确认禁止/允许”，也不为统一格式删改旧要求。

## 2. 新增与收紧规范的来源映射

SC、FE、BE、G 编号是 V2 的引用索引，不是给原始 60 条重新编号。下表列出 V2 新增或收紧的每组要求。

| ID | 新增/明确要求 | 原始规则 R | 对应课件位置 | 实际样例或其他证据 | 强度与结论 |
| --- | --- | --- | --- | --- | --- |
| SC01 | val；不用 var | 未直接规定 | Lec2 原件/页码缺失 | U §2.1；S 的 Scala API 使用 val/不可变输入 | U 明确禁令；不是从“样例无 var”推导 |
| SC02 | 优先 map/flatMap/filter | 22 为效果组合 | H §4.2–4.3；Lec3 12–20 页未核验 | U；S:BORROW 23 行、S:FRONT-HOOK 54–67 行 | 优先模式；不新建函数式框架 |
| SC03 | 禁命令式 for，区分 for/yield | 22 | Lec2 未取得；H 的 Lec3 17–25 页未核验 | U；S:BORROW 20–36 行、S:SESSION 16–20 行 | 禁令来自 U；IO comprehension 依据样例保留 |
| SC04 | Try[T] 可用 | 未禁止 Try | H §4.1，Lec3 2–5 页未核验 | U；S:BOOK-ID 6–13 行 | 明确允许同步结果建模 |
| SC05 | Scala 不用传统 try/catch/finally | R 未作该语法禁令 | Lec2/3 原文缺失，不能给禁令页码 | U；S:BOOK-TABLE 与此不同 | U 明确禁令；新代码按 U，记录历史差异 |
| SC06 | case class/trait/abstract class 按职责 | 13–15、20 | H §4.1，Lec3 6–11 页未核验 | U；S:API-BASE、S:BOOK-ID | 记录用 final case class；能力用 trait；不强制抽象父类 |
| SC07 | 避免业务身份/状态退化为基础类型 | 13、19 | H §4.1，Lec2具体要求未知 | U；S:BOOK-ID 与 S:BOOK-SAVE | 区分身份与状态；不包装所有文本/数量 |
| SC08 | Option/Either/Try 表达缺失或失败 | 19、22、36 | H §4.1 支持 Option/Try；Either 原课件位置未知 | U 明确列出 Either；S:BOOK-ID、S:BORROW | 允许结果类型；Try 不等于 IO 延迟 |
| SC09 | Monad/map/flatMap 与 IO 组合 | 20–22、27 | H §4.3；Lec3 17–25 页未核验 | U；S:BORROW、S:SESSION | 使用现有机制，不发明通用上下文 |
| SC10 | 纯核心、边缘副作用 | 13、22、37 | H §4.2–4.3；Lec3 12–20 页未核验 | U；S:BOOK-TABLE 在 IO.blocking 内访问 JDBC | 明确延迟和依赖，不隐藏外部工作 |
| FE01 | 常量/核心/展示数据区分，展示值随状态推导 | 42、60 | H §3.2；Lec5 4–6 页未核验 | U；S:FRONT-HOOK 30–33、54–67 行 | 不重复存储同源派生值 |
| FE02 | Hooks 管状态，纯函数转换，组件展示 | 40–44 | H §3；Lec5 4–10、13 页未核验 | U；S:FRONT-HOOK、S:FRONT-PAGE | 推荐职责组织，不强行拆每个小函数 |
| FE03 | 不用全局变量管理前端状态 | 未直接写此禁令 | Lec5 原文缺失 | U；S:ZUSTAND 为模块私有响应式 Store | 禁非响应式可变全局状态；不禁模块常量或合规 Store |
| FE04 | Zustand 定位跨页面共享的全局核心数据，不滥用 | 40、42 | H §3.1/3.3 说多个组件或页面；原件待核 | U 范围更具体；S:ZUSTAND 会话跨页 | 新功能优先按 U；同页共享优先页面 Hook，差异见 C04 |
| FE05 | 尽量私有 Store | 未明确 | H §3.3 未强制私有；Lec5 7–9 页待核 | U；S:ZUSTAND 16 行私有 const | 推荐，不把“尽量”写成所有公开 Hook 均违规 |
| FE06 | get/use/set 职责；渲染订阅、纯函数无 Hook | 42、58 | H §3.3；Lec5 7–9 页未核验 | U；S:ZUSTAND 23–29 行 | 职责明确，函数名/selector 签名可沿用项目 |
| FE07 | 长页面模块化，分清组件/hooks/functions/objects | 39–47 | H §3.5；Lec5 13 页未核验 | U；S:FRONT-PAGE、S:REAL-PAGE | 按业务区域，不固定行数阈值 |
| FE08 | 优先 TS+React，复杂状态显式表达 | 19、58、60 | H §3.1；Lec5 3–10 页未核验 | U；样例 package.json 与页面代码 | 课程前端选择，不迁移无关技术栈 |
| BE01 | 高内聚低耦合，服务职责与 API 分开 | 1–12、20–33 | H §4.4/5.1；Lec4 2–3 页未核验 | U；S:BORROW 跨用户服务 API | 不把模块化单体强制拆成网络微服务 |
| BE02 | 序列化、领域与数据库形态分清 | 13–19、24、29、34–38 | H §5.2/6；Lec4 4–7、11–12 页未核验 | U；S:BOOK-ID、S:BOOK-SAVE | 保持已有 wire contract；codec 不替代校验 |
| BE03 | JDBC 推荐 Resource，释放/事务明确 | 7、22、34–38 | 原课件未核验 Resource | U 要求检查差异；S:SESSION 已用 Resource | 推荐，非课件已证实的唯一工具 |
| G01 | 按语言/模块先加载，六阶段工作，不污染 Python/算法题 | 不改变 R | 不是课件规定 | U §2.7、§3 | Skill 执行约定 |
| G02 | Critical/Major/Minor，具体可检查项 | 不改变条文强度 | 不是课件规定 | U §2.5 | 审查输出策略；推荐未采纳不自动判违规 |
| G03 | 行为 prompts、结构测试、完整包与 ZIP | 不改变 R | 不是课件规定 | U §2.6、§4–5 | 验证/交付策略，不宣称脚本证明 Agent 合规 |

## 3. 规范差异及暂行决策

| 冲突 ID | 原始要求/课件位置 | samples 不同写法 | V2 采用方式 | 尚待确认 |
| --- | --- | --- | --- | --- |
| C01 | R 不禁传统异常语法；U 明确不使用；Lec2/3 原文缺失 | S:BOOK-TABLE 22–37 行用 try/finally，Initializer 也有 | 新代码不用传统语法；已有历史实现只在本次涉及范围内按 Resource 等模式修正，保留来源记录 | 课件对库桥接/资源释放是否允许例外 |
| C02 | U 禁命令式 for；R22 要求显式组合；Lec2 未取得 | S:BORROW 与 S:SESSION 使用 for/yield 组合 IO/Resource | 保留 effect comprehension；不把它当作可变累加循环 | 原课件对纯集合/Option/Either comprehension 的精确范围 |
| C03 | U 允许 Try；H Lec3 2–5 页介绍 Try，页码未核 | S:BOOK-ID 用 Try(UUID.fromString) | 允许同步解析 Try；不与 try 关键字混淆，不用 Try 代替 IO | 无已知实质冲突；原件待核 |
| C04 | H 说多个组件或页面可共享；U 指定跨页面全局核心数据 | S:ZUSTAND 是跨页会话，部分学生样例同页/跨组件也有 Store | 新增全局 Store 按跨页核心数据定位；同页共享优先 Hook，既有同页 Store 不自动全局改写；私有/get-use-set 为推荐职责形态 | Lec5 是否绝对排除同页多组件 Store；“尽量”例外边界 |
| C05 | U 避免基础类型滥用；R13/19 要领域值与有限状态 | S:BOOK-ID 包装 UUID，而 S:BOOK-SAVE 标题/库存为 String/Int | 身份与有限状态明确类型，普通文本和数值不强制包裹 | Lec2“基础类型”原句与精确适用范围 |
| C06 | U 不用全局变量管理状态 | S:ZUSTAND 使用模块作用域 const Store | 模块私有 Store 是响应式机制，不等于随意可变全局变量；不禁止常量、API 类、静态配置 | 原课件术语边界待核 |
| C07 | R14 对记录要求派生 codec，R29 允许边界差异 | S:BOOK-ID 使用标量 codec；V1 示例为派生对象 ID | 记录保持派生 codec；沿用已有 ID 形态，不为示例改变 wire contract；值类型的标量 codec 差异明确记录 | R14 是否对所有值包装也要求派生，而非记录模板；需人工确认 |
| C08 | R2/4 要服务归属；R6/36 要公开表函数 | 模板顶层 system；部分 Table def 为 private[books] | 按原始规则组织新文件和公开方法，不把模板原样视为合规 | 不需另造规范；未要求本次修复 samples |
| C09 | R52 说一种推荐 class+send 风格 | S:FRONT-API 只有字段，统一 sendAPI 负责发送 | 新示例按推荐风格；等价已有实现不自动列强制失败 | 如用户另要求 class+send 唯一模式才收紧 |

## 4. 如何更新证据

原始课件到位后，逐项核验 SC/FE/BE 的原句、课件版本和 PDF 页码，将“未核验”改为有文件与页码的证据。保留不同来源及冲突结论的历史说明；不重新生成或翻译 rules.txt。若原件仍与 U 不同，标记两者并由用户决定项目要求，不能自行删除本次明确要求。

证据快照用于离线复查，完整样例不随 ZIP 复制。通过快照中的工作区相对路径和哈希可核对原文件；缺少 samples 的安装环境仍能读取快照，不能把原路径缺失当成 Skill 包引用失效。
