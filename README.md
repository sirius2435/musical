# THE STAGE OF STORIES

*Where Music Meets Drama.*

音乐剧交互档案馆与全栈课程项目。采用已确认的课程技术体系：Scala 3 / Cats Effect / http4s / Circe / PostgreSQL，React / TypeScript / Vite / Tailwind / Zustand。开发约定见 [AGENTS.md](AGENTS.md)，随仓库附带 `scala-react-course` V2 规范快照。

已实现 12 类页面：Home、History、Era Detail、Productions、Production Detail、Music、Song Detail、Stagecraft、Authentication、User Center、Admin、About。三个详情路由按实际 ID/slug 读取不同记录。

档案、搜索、账户、收藏与管理写入走后端 API。浏览器只保存不透明会话 token，不用 localStorage 存储用户资料、作品或收藏。数据库含用户、会话、时期、作品、歌曲、创作者、收藏和两张关联表；初始档案为 5 个时期、8 部作品、4 篇歌曲分析、14 位创作者。

## 当前工作区一键启动

在自己的终端执行（使用本工作区已有的 PostgreSQL、Java 和前端依赖缓存）：

```bash
cd /home/ryansubuntn/no-code/musical
python3 scripts/dev.py
```

脚本创建缺失的本地应用数据库、启动 PostgreSQL/后端/前端，并请求实际 API 确认就绪。成功后访问 **http://127.0.0.1:5175**；保持终端运行，按 Ctrl+C 停止本次启动的服务。日志在 `.runtime/`。已有数据库不会清空；已有数据库进程不会被脚本关闭。脚本适用于本工作区默认数据库配置，独立机器使用下方标准启动步骤。

当前工作区已有前端（5175）、后端（8082）和 PostgreSQL（55432）进程在运行；本轮已用 Chrome 实际加载页面和 35 张本地图片。Agent 不能自行新起监听端口或重启这些宿主进程，因此完整重启验收仍需在可控制的终端执行。

## 启动

需要 JDK 17+、sbt 1.10.2、Node 22.12+（或兼容的 Node 20.19+）、npm、Docker Compose。也可使用已有 PostgreSQL 16，并相应修改连接配置。

在 `musical/` 下：

```bash
cp .env.example .env
```

编辑 `.env`。开发数据库默认端口为 `55432`，与其他项目隔离。要使用管理后台，取消注释 `STAGE_ADMIN_EMAIL`、`STAGE_ADMIN_PASSWORD`，填入自己选定的邮箱和至少 10 位密码。此初始化仅为尚不存在的邮箱创建管理员；不会把已注册普通账户自动提升为管理员。

```bash
docker compose up -d db
set -a
source .env
set +a
cd backend
sbt run
```

后端启动时在同一事务内建表并 Seed；Seed 有版本标记，重启不会覆盖管理修改或把删除的内容重新补回。版本 2 只迁移图片路径，不覆盖正文、标题或管理修改。PostgreSQL 数据保存在 Compose 命名卷中。

另开终端，在 `musical/frontend/` 下：

```bash
npm ci
npm run dev
```

打开 **http://127.0.0.1:5175**。Vite 将 `/api` 代理到 **127.0.0.1:8082**。可直接进入 `/productions/carousel` 等深链。如修改后端端口，前端启动进程也需导出对应 `VITE_BACKEND_PROXY_TARGET`；默认配置不需要额外设置。

当前工作区已复用相邻 `homework2` 的依赖缓存：`frontend/node_modules` 是符号链接，`python3 scripts/backend.py` 可用本地缓存编译并启动后端。该缓存仅是此工作区便利措施，复制项目到别处时使用上述标准安装方式。

## 使用核心流程

- 公开浏览作品；作品页点击 **Save to your archive**，未登录会跳转注册/登录，成功后回到原页面。
- `/account` 编辑展示名、查看与取消本人收藏。退出会撤销该用户的所有现有会话。
- 使用初始化管理员登录，进入 `/admin`，切换作品、歌曲、时期、创作者进行新增、编辑、删除。
- 编辑已有作品时可修改歌曲与创作者关联；已有创作者职能保留，新关联记为 Contributor。主体资料与关联有独立保存按钮，各自作为事务保存；新增作品先保存主体再编辑关联。
- 删除被引用的时期、歌曲或创作者会提示关联冲突。删除作品会清理其收藏与关联，但保留歌曲和创作者。
- 歌曲分类为 narration / character / wish / love；分类用于教学浏览，一首歌可能有多种戏剧功能。

## 验证

```bash
cd frontend
npm run build
npm run lint
npm test
```

后端：

```bash
cd backend
sbt "Test / runMain services.user.api.SecurityChecks"
```

本工作区也可在 `musical/` 执行：

```bash
python3 scripts/backend.py --test
python3 scripts/verify-structure.py
node scripts/verify-production-names.mjs
python3 scripts/verify-database.py --postgres ../homework2/.dsh-runtime/pg/bin/postgres --data .runtime/pgdata
```

最后一条使用本工作区已初始化、未运行的专用 PostgreSQL 集群，以单用户模式创建和删除临时测试库；**不要指向正在运行的数据库集群**。它检验实际 SQL 持久化，但不代替 JDBC/HTTP 联调。

本轮编译、前端静态渲染/API mock、真实消息路由权限测试、PostgreSQL 单用户 SQL 与图片迁移测试，以及 Chrome 1440/1280/768/375 页面与 35 张图片加载检查已执行。管理员写路径的完整 HTTP→JDBC、1280/768 截图、注册/收藏端到端和重启全系统复验尚未完成。完整边界与待验收项见 [验证报告](docs/VERIFICATION.md)。

## 设计与资料

黑暗舞台、暖纸色阅读区域、少量金色章节标记与酒红强调，配合 Cormorant Garamond / Inter、非对称版式、历史海报与剧照、克制的滚动过渡与 reduced-motion 支持。首页 Hero 使用项目所有者提供的舞台照，并在暗场舞台上叠加跟随精确指针平滑移动的双层暖金聚光灯；触屏设备保持固定柔光，不拦截滚动或点击。时间轴阅读进度、搜索筛选排序、歌曲展开、戏剧情节滑杆、舞台解剖和制作流程均有交互实现。

项目目录未发现音乐剧原始课程文件。目前内容依据用户题纲与记录的一手外部来源，仍需老师课件核对。年份统一为原始百老汇开演年份；历史分类不宣称互斥。Minstrelsy 以批判性的种族主义历史语境呈现，不作娱乐宣传。

项目内置 35 张本地图片：34 张来自 Wikimedia Commons 的 WebP 历史照片/海报/肖像，外加首页 Hero 由项目所有者提供的原始 PNG（未改写内容，仅由界面做裁切、明暗和聚光灯叠加）。每张图逐张记录作者、来源、许可与修改；Hero 为项目所有者供图，Introduction 为 Elgin Theatre（Canmenwalker，CC BY 4.0），其余覆盖 5 个历史时期、8 部作品、音乐页、舞台工艺页、认证页侧栏和 9 位创作者。完整清单见 [IMAGE_ATTRIBUTIONS.md](IMAGE_ATTRIBUTIONS.md)，About 页也列出全部署名。图片不再热链第三方站点；仅 Google Fonts 仍需网络，离线有系统字体与 `/art/theatre.svg` 退路。Carousel 的 1945 年原版剧照分辨率较低（815×520），Grease 使用 2014 年 The Muny 制作照并在界面注明，不冒充 1972 年原版。未复制歌词或嵌入版权不明录音。

- [产品与页面设计](docs/PRODUCT-DESIGN.md)
- [数据模型和验收矩阵](docs/DATA-AND-ACCEPTANCE.md)
- [内容来源](docs/content-sources.json)
- [素材许可记录](docs/media-credits.json)
- [验证报告与待验收步骤](docs/VERIFICATION.md)

生产部署需将前端静态文件交由支持 SPA fallback 的服务器托管，并把 `/api` 代理到后端，确保 HTTPS 和环境凭据配置。本轮交付为本地课程系统，未部署公网。
