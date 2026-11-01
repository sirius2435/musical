# 安装与启用 V2

这是 Codex 使用说明，不是课程规范。仅提供可选配置，不修改其他项目或全局配置。下列路径依据 2026-11-01 查阅的 [OpenAI 官方 Skills 文档](https://learn.chatgpt.com/docs/build-skills) 与 [AGENTS.md 文档](https://learn.chatgpt.com/docs/agent-configuration/agents-md)。

## 1. 从 ZIP 安装

ZIP 顶层是一个 `scala-react-course/` 目录，其中直接包含 SKILL.md。将它解压到目标项目的 `.agents/skills/` 下，最终结构为：

```text
目标项目/
  .agents/skills/scala-react-course/
    SKILL.md
    agents/openai.yaml
    references/
    scripts/
    tests/
    examples/
    CHANGELOG.md
```

例如在你选定的项目根目录手动执行：

```bash
mkdir -p .agents/skills
unzip /实际路径/scala-react-course-v2.zip -d .agents/skills
python3 .agents/skills/scala-react-course/scripts/validate_skill.py
```

已有同名 Skill 时先比较/备份，避免盲目覆盖。也可以将同一目录放到用户级 `~/.agents/skills/`；项目限定的课程规范更适合项目级位置。当前开发工作区的隐藏配置目录只读，因此本次只交付 ZIP 和示例，没有执行安装。

Codex 会检测 Skill 变更；没有显示时重启或重新打开对应项目，并检查是否在正确目录工作、是否存在同名版本或禁用配置。安装目录应直接包含本 Skill 文件夹，避免多嵌套一层 `scala-react-course/scala-react-course/`。

## 2. 显式使用与自动选择

在已发现 Skill 的 Codex 会话中，可以输入：

```text
使用 $scala-react-course，为这个课程项目新增一个图书查询 API。
编码前读取适用规范，按原有契约实现，并说明验证范围。
```

自动选择依赖 name、description 与当前任务，不是确定性保证。Scala 课程开发应加载语言风格；React/TypeScript 课程 UI 应加载前端模式；混合开发加载两侧。普通 Python、独立算法题或无关 TS 任务应被适用范围排除。不能以“包校验通过”宣称这些实际路由行为已经测试通过。

本包未设置禁止隐式使用的开关，保留正常自动发现。若需要在指定课程项目中持续执行，使用项目级约束，不能只依赖自动选择。

## 3. 可选项目级约束

将 [AGENTS.md.example](../examples/AGENTS.md.example) 的内容合并到**目标课程项目**已有的 AGENTS.md；没有时再创建。示例中的 Skill 相对路径对应上面的项目级安装位置。

示例不是本次工作区的实际 AGENTS.md，也不会修改任何现有项目。项目约束要求 Scala/React 开发先读取 Skill，对 Python 和算法题保留范围判断，避免把课程语言约束扩散。

AGENTS.md 在会话开始时形成指令链；修改后重开会话验证加载的文件。项目和子目录的覆盖文件可能影响实际生效内容，不能仅以文件存在认定生效。详细发现与优先关系以官方文档为准。

## 4. 确认安装是否有效

在新会话用 [tests/prompts.md](../tests/prompts.md) 的正向和反向任务测试，保存模型/版本、加载过的资料、生成文件、检查命令与输出。至少同时检查 Scala、React、混合和 Python 任务。Skill 能被列出只证明发现，不证明遵循。

开发者可以先运行包检查、结构单元测试和示例验证；这些检查不需要为用户安装 Skill，也不等于独立模型任务已运行。

在 Skill 目录中运行：

```bash
python3 scripts/validate_skill.py
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests -p 'test_*.py' -v
python3 scripts/verify_examples.py --node-modules /已有前端项目/node_modules
```

示例验证器只借用已有依赖，在临时目录编译运行，不下载依赖、不改源项目。可用 `--help` 查看 Scala 离线验证需要的 JDK、编译器 classpath 文件、运行依赖 classpath 文件和真实样例后端路径。Scala 样例依赖会复制到临时目录并适配系统命名空间；不视为原样例全部符合风格。具体运行范围见审查报告。
