# V2 行为测试任务

本文件是可执行评估用的任务集，**编写测试任务不等于已经运行 Agent 测试**。状态与已运行验证见 [审查报告](review-report.md)。规则编号来自 [原文](../references/rules.txt)，SC/FE/BE 编号来自 [来源表](../references/sources-and-conflicts.md)，审查项来自 [清单](../references/review-checklist.md)。

## 准备与判定

每例使用独立临时副本/工作区和新 Codex 会话，保留项目技术栈。不得直接修改 samples 原件。用 evidence JSON 定位真实样例；样例不可获得时允许使用现有模式构建最小 fixture，记录替代，不能伪称使用了真实项目。

显式测试在 Prompt 前加“使用 $scala-react-course”；隐式测试不加名称，只提供说明该项目采用课程规范的 README/项目约束与下列任务。单独测试自动选择时不要提前塞入完整 Skill 或 AGENTS 强制加载指令，否则无法测隐式选择。

记录模型和工具版本、发现方式、实际读取的 references、原始输出、修改 diff、执行命令、结果和未决事项。禁止只匹配输出措辞就判通过；检查生成结构和运行行为。未执行记 Not run，不给假分数。

## P01：新增 Scala 后端 API

**Prompt**：在该课程图书系统新增按 ISBN 查询图书的 API。保持现有响应和错误约定，查询不到要明确返回不存在；实现必要后端文件，并更新服务注册。此任务先只做后端。

- 参考：S:BORROW 的消息组织、实际 GetBookAPIMessage 和 BookTable；复制 `samples/backend-sample` 后修正与目标有关的目录/可见性差异。
- 预期规范：R2–10、13–24、31–38；SC01–SC10。先读 rules、scala-style、backend-patterns，前端全文不应无条件加载。
- 禁止错误：var、命令式 for、传统 Scala try/catch/finally；双请求/响应泛型；plan 外再加无意义 execute；SQL 写进路由或对象；静默返回伪造记录。
- 预期结构：`services/books/api/FindBookByIsbnAPIMessage.scala`；公开 `BookTable.findByIsbn` 及前置私有 SQL；必要响应在 objects/apiTypes；BooksRoutes 注册，总路由按服务合并。
- 审查项目：SL01–SL04、FP01–FP03、BA01–BA03、DM01–DM03、AP01–AP04、VR01。
- 行为验收：已知 ISBN 返回正确记录，未知 ISBN 按既有错误约定失败；编译及契约检查通过。

## P02：新增表与初始化

**Prompt**：给课程图书系统增加图书备注记录，一条备注包含 ID、bookId、正文。新增表模块和初始化，在启动时组合初始化；暂不增加前端和 HTTP API。

- 参考：真实 BookTableInitializer/BookTable 和证据 S:BOOK-TABLE、S:SESSION。
- 预期规范：R7–8、13–19、34–38；SC01、SC05–SC10、BE02–BE03。
- 禁止错误：大型集中建表文件；initializer 混入 API；SQL 公开；任意 SQL 参数公开入口；返回裸 JDBC 结果；为消除 finally 而漏关资源；按参考新增 ORM 或更换数据库。
- 预期结构：`services/books/tables/booknote/BookNoteTable.scala` 与 `BookNoteTableInitializer.scala`；独立 objects/BookNote.scala 和必要 ID 文件；启动处仅组合调用。
- 审查项目：SL01、SL04、FP02、BA01、DM01–DM04、PO01、VR01–VR02。
- 行为验收：在隔离数据库初始化可重复执行；插入、查询、无结果、失败和资源释放按现有测试能力验证。

## P03：需要身份认证的 API

**Prompt**：给课程图书系统增加“管理员修改书名”的前后端调用。前端携带 token；不能信任请求中的 userId；非管理员不能修改。保留现有 ID JSON 形态。

- 参考：S:BORROW、真实 APIMessageRouter.preparePayload、用户权限消息、前端 API 调用器；不把样例的普通路由类别机械复制到受保护操作。
- 预期规范：R11、20–33、48–53；SC/BE、FE 相关项；编码前读取两侧规范。
- 禁止错误：仅继承 token trait 却注册成普通 API；自报管理员 userId；token 有效便绕过权限检查；将身份转换下放为前端职责；前后端 ID 一侧字符串一侧对象；手写重复路由字符串。
- 预期结构：独立 RenameBookAPIMessage、权限调用和公开表方法；BooksRoutes 受保护注册；`src/apis/books/RenameBookAPI.ts`；通用传输在服务外。
- 审查项目：BA02、DM02、AP01–AP04、PO02、VR02。
- 行为验收：合法管理员成功；缺失/过期 token、普通用户失败；普通用户 token 加伪造管理员 userId 仍失败；下游失败不留下部分写入。

## P04：复杂状态 React 页面

**Prompt**：为课程图书系统实现可搜索的目录页，处理首次加载、成功、空结果、错误、重试；跳转离开后旧请求不能更新页面。筛选由已有数据推导，不改后端。

- 参考：S:FRONT-HOOK、S:FRONT-PAGE，配合现有前端示例。真实样例使用独立布尔值，不能因此忽略 R60。
- 预期规范：R19、39–47、55、58、60；FE01–FE03、FE07–FE08。只加载前端及相关规范，不强加 Scala 限制。
- 禁止错误：非响应式全局 let 管数据；将 filteredBooks 同步成另一份 state；effect 只用来复制派生值；把所有区域藏进万能 Layout；永久 loading；把 TypeScript catch 当作 Scala 违规。
- 预期结构：`pages/BookList/index.tsx`；可见工具栏/结果区域；共享 Hook、状态对象、纯筛选函数在页面附近；通用 UI 留 components/ui。
- 审查项目：RC01–RC02、HS01–HS04、PO01、VR01–VR02。
- 行为验收：各状态分支、重试、过滤空结果和请求取消；实际交互验证与静态渲染验证分别记录。

## P05：修改 Zustand 全局核心数据

**Prompt**：课程系统多个页面共享当前登录用户。增加私有 Store，并提供清晰的 getCurrentUser、useCurrentUser、setCurrentUser；页面显示用户名且更新后自动刷新，退出后显示未登录。纯格式化函数通过参数获取用户。

- 参考：真实 S:ZUSTAND 的私有 Store、useStore 和公开 setter。
- 预期规范：R40、42、57–58、60；FE01、FE03–FE06。get 快照、use 订阅、set 更新；私有是优先模式，不要求重写现有 selector API。
- 禁止错误：组件渲染只调 getCurrentUser；纯函数调 useCurrentUser；存 welcomeText 副本；导出可随意写的全局 let；同页每个局部开关也放全局 Store；客户端角色充当后端授权。
- 预期结构：归属明确的跨页面 Store 文件、页面共享用户对象、订阅组件；小格式化函数就近保留，不过度分层。
- 审查项目：RC01、HS01–HS04、PO01–PO02、VR02。
- 行为验收：set 后订阅渲染更新，get 返回快照，退出清空，现有会话调用没有被破坏。

## P06：重构较长前端页面

**Prompt**：在真实课程房源详情页副本中，按用户可见区域重构 index.tsx，使入口明确显示概览、设施、消息和预约等区域。保持路由、数据契约和现有功能，不修改后端。

- 参考：S:REAL-PAGE 与 `samples/20_2026403036_陈柏聪_3998/Ts_project/frontend/src/pages/ListingDetailPage/`。该入口把内容藏在 ListingDetailRegion，作为需检查的实际差异，不预设其已合规。
- 预期规范：R39–47、54–58、60；FE01–FE08 适用项。
- 禁止错误：把同一个巨型入口简单改名为 Layout；切成大量只有转发的目录；将页面专用类型移到全局；顺手重写鉴权或 UI 产品流程；强行更换框架。
- 预期结构：保留页面目录，index 展示主要业务区域；页面 Hook 协调共享状态，functions 保存纯转换，复杂区域才递归拆分。
- 审查项目：RC01–RC02、HS01–HS04、PO01–PO03、VR01–VR02。
- 行为验收：类型检查/lint/构建与原有关键交互对比；对未能访问外部地图或消息服务明确记录限制。

## P07：普通 Python 脚本（反向测试）

**Prompt**：写一个 Python 脚本读取 CSV，按 category 汇总 amount 输出 JSON。输入非法金额时输出清楚的错误。只使用标准库，并提供一份小样例验证。

- 参考：空白 Python 临时目录，**不要**预加载课程原文或前端示例；另测即使 Skill 被误选也能在范围阶段退出。
- 预期规范：G01；普通 Python 习惯、用户功能要求。无需 Scala/React 专项 references。
- 禁止错误：创建 services/api/Message；要求 IO/Monad/Tailwind；禁止 Python for/try/except；为满足课程要求改用 Scala；加载全部课程规范。
- 预期结构：一个 `.py` 文件及必要样例，不创建课程目录树或新依赖。
- 审查项目：PO03、VR01–VR02。
- 行为验收：合法与非法金额、空文件、JSON 输出；记录 Skill 是否误触发及是否正确退出。

## P08：独立算法题（反向测试）

**Prompt**：用 Scala 实现二分查找，给出复杂度和几个输入输出例子。这是一道独立算法题，不是课程项目。

- 预期规范：G01；不加载整套 API、SQL 和 React 规范。语言自身语义仍正确。
- 禁止错误：强迫构造 APIMessage、数据库连接、课程服务目录；因有 Scala 关键词而加载全部课程项目参考。
- 预期结构：一个算法实现和必要说明。
- 审查项目：PO03、VR01。
- 行为验收：边界和未命中结果；检查实际 references 加载记录。

## P09：无关 TypeScript 任务（反向测试）

**Prompt**：在一个不采用课程规范的 Node.js 工具中修复配置 JSON 读取，不涉及 React 页面，也不迁移项目结构。

- 预期规范：G01；沿用项目约定，description 不因 TypeScript 单词误加载前端课程规范。
- 禁止错误：添加 Zustand、Tailwind、pages 目录或 Scala 约束。
- 预期结构：现有配置模块与适当测试。
- 审查项目：PO03、VR01。
- 行为验收：有效/无效配置和原有调用；独立会话验证是否错误触发。
