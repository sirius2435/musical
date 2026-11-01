# V2 审查报告

升级日期：2026-11-01。结论：V2 文件、静态结构检查、前后端示例编译与限定运行验证已完成；**尚未实测独立 Codex 会话的自动触发和全部行为 Prompt，不宣称 Agent 已严格遵循全部规范。**

## 1. 交付目录

保留全部 8 个 V1 路径，新增 12 个文件，共 20 个文件。结构如下：

```text
scala-react-course/
  SKILL.md
  CHANGELOG.md
  agents/openai.yaml
  references/
    rules.txt
    course-handbook.md
    scala-style.md
    backend-patterns.md
    frontend-patterns.md
    review-checklist.md
    sources-and-conflicts.md
    installation.md
  scripts/
    validate_skill.py
    verify_examples.py
  tests/
    prompts.md
    source-evidence.json
    test_validate_skill.py
    frontend-contracts.cjs
    scala-example-check.scala
    review-report.md
  examples/AGENTS.md.example
```

归档名为 `scala-react-course-v2.zip`，仅包含顶层 `scala-react-course/`。ZIP 不包含依赖目录、工具缓存、临时编译产物或样例完整项目；原始规则和离线证据随包携带。

## 2. 已通过检查

| 检查 | 结果与实际范围 |
| --- | --- |
| V1 路径与原文 | 全部 8 个原路径保留；rules.txt 与 V1 快照及 samples 原件逐字节相同，60 条顺序和 SHA-256 保持一致 |
| 来源与冲突 | 24 组 V2 来源映射、9 项差异记录；11 个真实样例文件的哈希与摘录均和 samples 核对 |
| Markdown | 包内所有 Markdown 及 AGENTS 示例检查了代码围栏、内部文件引用和使用的标题锚点；人工复查规则强度与残留矛盾措辞 |
| YAML | 2 份 Markdown Frontmatter 和 agents/openai.yaml 经 PyYAML 解析；官方 quick_validate 通过；name/目录/default_prompt 对应 |
| 现有包校验脚本 | 已运行扩展后的 validate_skill.py，含原文、覆盖索引、来源表、Prompt 结构、证据及包引用检查 |
| 结构反例 | 12 个 unittest 通过：便携包、规则篡改、失效/越界引用、错误锚点、围栏、错误调用名、覆盖遗漏、来源遗漏、Prompt 字段、证据 ID、非法元数据 |
| 前端示例 | 21 个 TS/TSX 文件经严格 TypeScript 编译及 ESLint/React Hooks 规则检查 |
| 前端限定运行 | Mock fetch 检查 3 个 API 名称、ID 形态、token 载荷、没有自报 userId、取消信号与错误；纯筛选不变性；页面 4 状态及筛选空结果；Zustand setter/get 快照与初始 SSR |
| Scala 示例 | 9 个后端文件、3 个 API trait 和 4 组 Scala 风格代码经 Scala 3.3.3 编译；借用真实 samples 用户/系统模块并在临时副本适配注册器命名空间 |
| Scala 限定运行 | Codec 往返、注册名称、Try/Either 和 IO 组合；JDBC 代理确认构造 IO 不提前 prepareStatement、成功/映射失败都释放语句与结果集 |
| 归档验收 | ZIP CRC、逐文件内容一致性及临时解压后的包校验通过；校验值另附在交付 ZIP 旁 |

原文 SHA-256：`6a720d72b729f65e5cfbdda95d618d7c48ca3d356dc398efd3db2ff757c8713a`。

使用环境：Python 3.13.13（包/测试）、系统 Python 3.14.4 + PyYAML（完整 YAML/官方验证）；Node 24.16.0、TypeScript 5.9.3、React 19.3.1、Zustand 5.0.16、ESLint 9.39.5；JDK 17.0.21、Scala 3.3.3、Cats Effect 3.5.4、Circe 0.14.9。均借用现有本地工具和缓存，没有安装/下载依赖。

## 3. 可重复执行的检查

从本 Skill 目录执行包与结构测试：

```bash
python3 scripts/validate_skill.py
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests -p 'test_*.py' -v
```

仍有原资料时传 `--rules-source` 和 `--samples-root` 核对原件。只依赖标准库的包检查限定支持本包使用的简单 YAML 格式，不自称通用 YAML 解析器；本次另用 PyYAML 解析了实际全部 YAML 元数据。

示例验证使用 [verify_examples.py](../scripts/verify_examples.py)：

```bash
python3 scripts/verify_examples.py --node-modules /已有前端项目/node_modules
python3 scripts/verify_examples.py --java /已有JDK/bin/java --compiler-classpath /已有编译器classpath文件 --scala-classpath /已有依赖classpath文件 --sample-backend /原samples/backend-sample
```

两个 classpath 文件为已有 jar 绝对路径以冒号分隔的文本；本次取旧项目编译依赖导出并加入缓存中的 Scala 编译器 jar。验证器不会自行下载或改写用户项目。测试输出会明确 Mock/JDBC 代理的范围。

## 4. 来源不足与人工确认

原始 Lec2–Lec5 文件未取得；仅有用户提供的 Lec3–Lec5 整理和本次明确指令。新增禁令按本次用户要求执行，不宣称已经查到课件原句。详见 [来源映射与冲突记录](../references/sources-and-conflicts.md)。

需补课件确认：

1. Lec2 中 val/var、命令式 for、传统异常语法的原句及页码；资源桥接是否存在例外。
2. for/yield 在纯集合、Option、Either 场景的精确范围；目前 IO 组合依据真实样例保留。
3. Lec5 是否绝对排除同页多组件 Store，以及私有 Store 的适用例外；当前按本次跨页核心数据定位执行。
4. “避免基础类型滥用”的精确范围；不能从现有材料推出所有 String/Int 都要包装。
5. R14 派生 codec 对标量值包装的精确适用范围；实际样例使用标量 ID codec，既有 wire contract 不应静默改变。

这些是明确记录的证据缺口，不是本次擅自删改原始要求的理由。原始 60 条完全保留。

## 5. 未执行与未证明事项

| 测试 | 状态与限制 |
| --- | --- |
| P01–P06 的独立 Codex 代码生成任务 | Not run；已设计真实样例任务，未启动独立模型会话，无生成 diff 或行为得分 |
| P07 Python、P08 算法、P09 无关 TS 的模型反向测试 | Not run；适用范围与 description 已明确，但误触发率未实测 |
| 显式/隐式自动触发、真实安装后发现 | Not run；配置说明不代替会话日志；本次未安装到其他项目/全局目录 |
| 真实 HTTP 鉴权与伪造身份拦截 | Not run；编译了注册及权限依赖，前端测试了 token 载荷，但没有运行真实服务器会话验证 |
| 真实数据库初始化/事务/取消 | Not run；代理只测查询资源的成功与映射失败路径，不证明 DDL、数据库回滚或取消安全 |
| 浏览器挂载后的 Store 订阅更新与请求竞态 | Not run；当前是快照/SSR 和传输单元检查，不是真实浏览器交互 |
| 生产构建的类名保持与路由调用 | Not run；当前 CommonJS 编译未覆盖压缩后的名称推导 |
| 外部地图、消息、对象存储等 | Not run；本次 Skill 示例验证没有连接真实业务服务 |

Zustand 的服务端快照是初始状态；不能用再次静态渲染读取到何值来声称已经测试了挂载组件的响应式更新。该限制已在测试中明确。

## 6. 规范一致性审查

已移除 V1 对 Scala 传统异常语法不作限制的运行指令，改为 U 的明确禁令；Try 仍允许。旧手册的较宽 Store 描述保留为历史来源，并用 V2 注记和 C04 明确本次执行方式。

未新增“所有 for/yield 禁止”“所有基础字段包装”“Resource 是课件指定唯一方式”“所有语言禁止 try”“必须拆为独立部署服务”等规则。原文 R52 的 class+send 继续为推荐；Severity 也不把推荐项变为强制项。新增来源表的 G 类是用户要求的 Skill 工作流程，不伪装为课件规则。

## 7. 启用方式

将 ZIP 解压到选定课程项目 `.agents/skills/`，确认出现 `scala-react-course/SKILL.md`，再在新会话显式使用 `$scala-react-course`。项目级持续约束可合并 [AGENTS 示例](../examples/AGENTS.md.example)，不要覆盖已有文件。

按 [安装说明](../references/installation.md) 检查发现、重启和作用域。路径依据 [官方 Skills 文档](https://learn.chatgpt.com/docs/build-skills)，项目指令依据 [官方 AGENTS.md 文档](https://learn.chatgpt.com/docs/agent-configuration/agents-md)。本次只交付文件、示例和 ZIP，没有修改其他项目配置。
