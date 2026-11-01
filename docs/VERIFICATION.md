# 实现与验证记录

日期：2026-11-01。项目：THE STAGE OF STORIES。

本轮已经实现前端、Scala API 与 PostgreSQL 持久化代码。下列结果区分结构检查、模拟数据测试、真实 SQL 测试和尚未执行的完整系统验收；不宣称所有验收标准已通过。

## 已执行

| 检查 | 结果与实际范围 |
| --- | --- |
| 前端 `npm run build` | TypeScript 工程检查与 Vite 生产构建通过，产物在 `frontend/dist/` |
| 前端 `npm run lint` | ESLint 与 Hooks 规则通过 |
| 前端 `npm test` | 12 类页面初始静态渲染、调用器与后端注册名称对应、搜索参数、token 传输、修改请求与错误响应、滑杆和管理表单结构通过；fetch 为 mock，未运行 effects 或浏览器点击 |
| `node scripts/verify-production-names.mjs` | 检查实际生产 JS 中全部 27 个打包 API 类的 constructor.name，保持消息路由协议；未使用的 GetCreator 被 tree shaking 去除，不算缺失 |
| `python3 scripts/backend.py --test` | 本地缓存工具链编译全部 Scala 主代码与测试；执行真实 http4s 路由和实际 Message/表方法，JDBC 使用进程内 fixture |
| 后端权限测试 | 注册、正确/错误密码、伪造 userId 覆盖、无效/缺失 token、普通用户对四类实体全部增改/删除及关系写入被拒绝、两用户收藏隔离、本人资料更新、注册/更新不能自授管理员、退出撤销令牌均通过 |
| PostgreSQL 单用户测试 | 使用真实 PostgreSQL 16.2，提取源码建表语句，在临时库加载实际 seed，验证四类实体 CRUD、收藏唯一性/隔离、外键拒绝、事务回滚、会话过期条件、创作者关联职能保留、实际时期检索 SQL，以及新数据库进程读取持久化结果；测试库结束删除 |
| `python3 scripts/verify-structure.py` | 消息独立文件与 plan/IO、每表 Table/Initializer、Scala 禁用语法筛查、seed ID/slug 唯一、来源 HTTPS、本地 WebP/PNG 可解码且逐张出现在 `IMAGE_ATTRIBUTIONS.md`、SVG 可解析、共享 Skill 链接和 60 条编号通过 |
| 图片与浏览器检查 | 35 张本地文件（34 张 WebP + 1 张 1672×670 PNG）。此前 35 次页面加载覆盖未改动的 34 张图片；本轮在 Home 复检 1440/1280/1024/768/375 五个视口，Hero PNG `complete`、`naturalWidth=1672`，无横向溢出、无控制台异常；截图保存在 `.runtime/spotlight/`。模型本身不能读取图像，因此该检查证明加载、尺寸、裁切框和布局指标，不替代人眼审美判断。 |
| 配置一致性 | 前端 package.json 与 lockfile 的根依赖一致；JSON 可解析；项目未修改共享 Skill 原始规则或其他项目配置 |
| Hero 聚光灯交互 | 1440×900 下初始 `--spot-x=316.8px`（`.72`），指针移左后 `-388.4px`、移右后 `460.3px`，离开后向初始位置回落至 `364.4px`（仍在缓慢趋近）；移动初期柔光为 `194.9px`、聚焦光为 `306.3px`，可见明显滞后中间态而非瞬跳。`--focus-x/focus-y` 比柔光更慢跟随。375×812 触屏下 `any-pointer: coarse`，触摸前后变量保持 `82.5px / -28.6px`，无横向溢出；768/1024 使用 `84%` 裁切、1280 使用 `60%`，标题/CTA/底部署名均在视口内。`prefers-reduced-motion: reduce` 下鼠标移动后变量保持 `316.8px / -31.7px`。混合输入设备触摸不移动光斑，鼠标仍可驱动；CTA 点击到 `/history`，滚轮可滚动 650px。 |

结构检查不能证明所有课程规范都已满足。源码静态渲染不运行 Hook effects，路由测试中的 JDBC fixture 也不能证明真实 JDBC、数据库和 HTTP 三者已完成联调。

## 实现范围

- 12 类有用途的路由：`/`、`/history`、`/history/:slug`、`/productions`、`/productions/:slug`、`/music`、`/music/:slug`、`/stagecraft`、`/auth`、`/account`、`/admin`、`/about`，另有未知路径退路。
- 数据来自后端：精选作品、时期、作品检索/分类/排序、歌曲及分类定义、创作者、详情关系、当前用户和收藏。舞台示意与戏剧情节曲线为页面固定教学交互。
- 注册/登录/退出、展示名编辑、本人收藏增删；不透明 token 只在客户端保存，数据库存 token 摘要，密码使用带随机盐的 PBKDF2。
- 管理员对作品、歌曲、时期、创作者 CRUD，编辑作品与歌曲/创作者关联。公开注册只能创建 reader，管理员由启动环境配置初始化。
- 路由先解析 token 并覆盖外部 userId，然后消息执行业务权限；每次请求复用同一事务连接；JDBC 资源由 Resource 管理。
- 三个业务服务 catalog/user/favorites 与系统基础设施同进程运行；未为课程术语额外拆成独立部署。系统连接、错误类型位于 system 根目录，属于共享基础设施；系统消息与启动在 api，seed 标记表独立归属。
- API 专用组合响应位于 `objects/apiTypes`；档案共用 Entry 数据结构，实体仍分别存表。领域角色与歌曲功能为枚举，前端请求状态为可辨识联合类型。
- Tailwind、衬线/无衬线字体层次、深浅章节、不对称图片、本地历史照片与海报、响应式断点、sticky 导航、移动菜单、搜索与筛选、时间轴进度、歌曲展开、剧情滑杆、舞台部件/流程、收藏表单、滚动进入与 reduced-motion 均已实现。

## 图片替换记录（2026-11-01）

- **检查范围**：项目原有 18 个 `frontend/public/art/*.svg` 编辑插画、起始状态 Hero 中 1 张 Wikimedia 外链照片，以及 seed 中 31 个 `image` 字段（5 时期、8 作品、4 歌曲、14 创作者）和 Hero/Introduction/Auth 的硬编码图片引用。原作品图均为 AI/编辑插画，不是历史剧照或授权海报。
- **替换结果**：35 张本地图片（34 张 Wikimedia WebP + 1 张项目所有者提供的原始 PNG），位于 `frontend/public/images/`；seed 中不再有 `/art/` 图片引用。`/art/theatre.svg` 仅保留为图片加载失败时的退路；17 个不再引用的 SVG 已移至 `.runtime/legacy-art/`（可逆），`frontend/public/art/` 只剩该退路，正常页面不显示生成式占位图。
- **页面映射**：

| 页面/区域 | 本地图片 |
| --- | --- |
| Home Hero | 1 张项目所有者提供的舞台照 PNG（1672×670，未改写） |
| Home Introduction | 1 张 Elgin Theatre 内景 |
| Home Featured | Carousel、South Pacific、The King and I、West Side Story 各 1 张 |
| History 时间轴 | 5 个时期各 1 张 |
| Era Detail | 5 个时期主图 + Early American Entertainment 的 1926 年 minstrel 广告批评性上下文图 |
| Productions / Production Detail | 8 部作品海报或剧照；详情页另有 9 位创作者肖像 |
| Music | 4 张歌手、乐队、排练、舞台照 |
| Authentication | 1 张 Belasco 观众席侧栏照 |
| Stagecraft | 5 张布景、服装、灯光、音响、乐池照 |

- **许可分布**：Public domain 24；CC0 2；CC BY 4.0 2；CC BY 2.0 1；CC BY-SA 4.0 4；CC BY-SA 2.0 1；另有 1 张项目所有者供图（非 Wikimedia）。CC BY/SA 图片均在 About 页和 `IMAGE_ATTRIBUTIONS.md` 中给出作者、来源、许可链接和修改说明；CC BY-SA 衍生文件按相同许可共享。
- **无合适授权材料**：未找到明确许可的 1972 年原版 Grease 剧照，改用 2014 年 The Muny 制作照并明确标注；Carousel 只有 815×520 的 1945 年原版剧照，未过度放大；Joshua Logan、Gerome Ragni、James Rado、Jim Jacobs、Warren Casey 无明确许可肖像，保持纯文字。
- **下载与显示故障**：Wikimedia `upload.wikimedia.org` 对原图多次返回 429；改用 `commons.wikimedia.org/w/thumb.php` 获取 960px Heather MacRae 等图片，未使用损坏响应。34 张 WebP 通过魔数与 Pillow 解码检查；Hero PNG 与源文件 SHA-256 一致（`7235079f…`），Chrome 实际加载尺寸 1672×670；无 404、无空白图、无横向溢出。
- **数据库迁移**：新增 seed 版本 2，仅更新四类实体的 `image` 字段并保留正文/标题/管理修改；`scripts/verify-database.py` 在真实 PostgreSQL 16.2 单用户模式中模拟并断言“图片更新、标题编辑保留、version 1/2 同时存在”。本机运行中的数据库也已应用同一图片路径，API 返回新图片。

## Hero 聚光灯交互（2026-11-01）

- **本地背景**：首页 Hero 现使用项目所有者提供的 `stage-local-2026-11-01.png`，原始尺寸 1672×670，复制到 `frontend/public/images/hero/` 后与源文件 SHA-256 完全一致；没有 AI 重绘、内容修改或网络替换。旧 Dogfight WebP 已移至 `.runtime/legacy-hero/`。界面只通过 CSS 做裁切、亮度/对比度/饱和度和暗色/聚光灯叠加。
- **三层环境处理**：`z-0` 原图；`z-10` 深色氛围 + 左侧文字保护 + 底部署名保护；`z-20` 柔光与聚焦光；`z-30` 标题/描述/CTA；`z-40` 底部署名。所有光层 `pointer-events-none`，不拦截文字、按钮或滚动，不覆盖导航和其他页面。
- **图片裁切**：`object-fit: cover`；桌面 `object-position: 60% 50%`，≤1279px 使用 `84% 50%`，≤767px 使用 `88% 50%`。根据照片右侧舞台主体的位置保留关键区域，同时让左侧文字区保持暗场。图片只应用 `brightness(1.08) contrast(1.05) saturate(1.03)`，保留原始质感和自然色彩。
- **光照层**：A 层为大范围暖金柔光（1900px 上限，渐变到透明，`screen` 混合、24px 模糊）；B 层为更小、更亮的椭形聚焦光（820px 上限、中心高光、15px 模糊，渐变到 62% 透明）。两层都没有硬圆形边界，聚光中心明显高于环境亮度。旧的独立光束层已移除，避免形成第三层或生硬的光锥。
- **交互**：`useHeroSpotlight` 使用 `requestAnimationFrame` 直接写 CSS 变量，不触发 React state。初始位置为 Hero 的 72% / 46%；柔光缓动 `0.085`，聚焦光以更慢的 `0.058` 跟随，产生真实追光的轻微滞后。离开后按 `0.035` / `0.024` 缓慢回到初始位置，不会突然消失；鼠标停止后循环自然结束。
- **输入策略**：`any-pointer: fine` 才挂载指针监听，`pointerType === "touch"` 被忽略；触摸/无精确指针设备保持固定光照，不依赖鼠标；`prefers-reduced-motion: reduce` 下不运行跟随循环。
- **验证边界**：无头 Chrome 默认没有 fine pointer，测试时注入 `any-pointer: fine` 匹配器；无头环境的 rAF 会被节流，因此上述收敛数值只证明“有中间态、能到目标、能返回”，不代表真实桌面帧率。模型不能读取图片做审美判断；最终裁切与光斑观感需要人工在 5175 页面确认。

## 尚未执行的验收与原因

本轮通过工作区中已运行的前端（127.0.0.1:5175）、后端（127.0.0.1:8082）和 PostgreSQL（127.0.0.1:55432）完成了实际页面、API 与图片加载检查。Agent 不能自行新起监听端口或重启这些宿主进程，也没有执行管理员写路径的完整 HTTP→JDBC 验收；以下项目仍不能宣称通过。

| 待验收 | 当前边界 |
| --- | --- |
| HTTP → 实际 JDBC → PostgreSQL 读取 | 运行中的 8082 API 已读回数据库中的新图片字段，前端也实际取到；管理员写路径与事务全链路仍未验证 |
| 管理员通过真实 HTTP 完整 CRUD | 尚未执行；实际数据库 CRUD 与普通用户权限分别测试通过 |
| 浏览器注册、登录、收藏与刷新 | 尚未执行；不宣称端到端交互已验收 |
| 1280 / 768 布局截图 | 已检查 1280/1024/768 的布局、图片加载与横向溢出，并保存对应截图；实际触控设备与完整审美仍需人工复核 |
| 完整系统重启后会话/收藏/管理修改 | 尚未执行；仅真实 PostgreSQL 单用户进程重启持久化已测 |
| Google Fonts 的离线退路 | 本地图片已由 Chrome 加载；Google Fonts 仍依赖网络，未在断网浏览器中验证字体切换 |
| 独立机器安装 | 未执行 `npm ci`、联网 sbt 依赖下载或 Docker pull；使用现有本地依赖缓存完成编译测试 |

## 内容与素材待补

1. 原始音乐剧课程课件未在项目中找到。已使用用户题纲及一手来源建立有来源的起始内容，不能冒称完成课件逐页核验。正式交作业前应按课件核对分类、术语和分析方向。
2. 作品正文包含原创剧情概述和分析，事实对照官方/授权机构 show 页面；百老汇开演年份另保留 IBDB 来源记录。歌曲功能为编辑性教学分类，同曲可能有多个功能。
3. 图片已替换为 35 张本地文件（34 张 Wikimedia WebP + 1 张项目所有者供图 PNG），逐张记录在 `IMAGE_ATTRIBUTIONS.md`、About 页和 `docs/media-credits.json`。Carousel 的原版剧照只有 815×520；Grease 使用 2014 年 The Muny 制作照并明确标注，不冒充 1972 年原版；Joshua Logan、Gerome Ragni、James Rado、Jim Jacobs、Warren Casey 没有找到明确许可的肖像，相关条目保持纯文字。后台尚无独立媒体许可管理模块。
4. 不含商业音频播放器、歌词全文或演出录像。音乐页面提供原创分析和合法来源链接。
5. 本轮个人资料仅支持展示名，未包含找回密码或邮箱更换；主体与关联分别保存，关联未提供角色细分编辑或歌曲自定义顺序。

## 本机完整验收步骤

先按 README 启动 PostgreSQL、后端和前端，然后：

1. 打开全部 12 类页面；切换多个时期/作品/歌曲 slug，确认内容不同；访问未知 slug 和未知路径观察退路。
2. 在作品页分别检索标题、Rodgers、历史时期标题及类型，切换分类与排序，检查 Network 中 `/api/listproductions` 的参数和返回数据。
3. 注册两个普通用户 A/B；A 收藏 Carousel，B 收藏 South Pacific。刷新、退出重登与重启服务，确认各自列表独立且持久保留。
4. 在开发者工具中对带 token 的请求追加其他 userId，确认不能切换身份；普通用户调用管理写 API 应返回 403，数据库不变化。
5. 以初始化管理员登录，创建临时时期/创作者/歌曲/作品，关联后查看前台，再编辑、刷新与删除；受引用删除应返回 409，作品删除清理关联。
6. 测试错误密码、重复邮箱、过期/撤销令牌、断网、空搜索、无图片和接口失败反馈。
7. 在四种宽度逐页检查菜单、标题、表单、网格、时间轴、图像比例与页面横溢；键盘操作菜单、分类、滑杆、舞台按钮和管理表单。
8. 检查减少动态效果偏好、滚动动画、焦点和图片 `onError` 退路；确认合法来源和素材署名可访问。

完成这些实际步骤后，才能把对应验收项标记为通过。
