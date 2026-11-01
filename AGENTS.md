# musical 项目开发约定

本项目采用 `scala-react-course` V2 课程规范。进行 Scala 后端、React/TypeScript 前端或混合开发前，先读取 `.agents/skills/scala-react-course/SKILL.md`，再按任务语言和模块读取对应 references。

- 原始 `references/rules.txt` 的 60 条规则保持原文含义；V2 补充要求、样例差异和课件未核验事项以 Skill 的来源与冲突记录为准。
- Scala 任务读取 `scala-style.md` 及适用的 `backend-patterns.md`；前端任务读取 `frontend-patterns.md`；混合任务同时读取两侧规范。
- 按任务分析、设计、编码、自查、验证、交付六阶段执行。编码前明确数据模型、服务与表归属、接口、可信身份和页面状态。
- 技术选型以本项目实际配置及用户任务为准；保留已确定的架构和数据契约，不因 Skill 示例擅自替换框架、数据库或协议。
- 普通 Python 脚本、独立算法题和无关语言任务不套用 Scala/React 专项限制。
- 验证命令从本项目真实配置读取；交付说明实际执行结果、未执行检查及尚未解决的问题。审查意见区分 Critical、Major、Minor，并附位置及规则来源。

Skill 已随项目保存在 `.agents/skills/scala-react-course/`，确保克隆仓库后可直接读取；更新该快照时须保留原始 60 条规范并重新验证。
