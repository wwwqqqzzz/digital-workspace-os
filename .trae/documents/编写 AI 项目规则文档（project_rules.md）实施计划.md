## 目标
- 在 `e:\xiangmu\DigitalWorkspaceOS\.trae\rules\project_rules.md` 编写面向 AI 协作的项目规则文档，统一开发规范、工具使用与验收标准，提升自动化开发效率与一致性。

## 文档结构
- 项目简介与适用范围
- 技术栈与版本要求（Electron/TS/React/SQLite）
- 开发与代码规范（TS 严格模式、ESLint/Prettier、文件结构与 #region 折叠）
- IPC/API 约定（通道命名、请求/响应包络、错误码/重试、仅经 Preload 白名单调用），引用 `doc/IPC_API_接口规范.md`
- Electron 安全清单（contextIsolation/sandbox/nodeIntegration/CSP/WebView 导航拦截），引用 `doc/技术架构设计文档.md`
- 数据库规范（表命名、索引、事务、迁移/备份/脱敏），引用 `doc/数据库与数据模型设计.md`
- 日志与错误码（结构化字段、分层命名、CorrelationId），引用 `doc/技术架构设计文档.md`
- 性能门槛（启动/切换/内存预算与分位指标），引用 `doc/性能优化方案.md`
- 测试策略（Unit/Integration/E2E 比例、覆盖率阈值、运行命令），引用 `doc/测试策略文档.md`
- 版本与提交规范（分支/提交信息/PR 检查清单）
- AI 协作规则（搜索/计划/补丁/任务管理/验证/安全），结合当前 IDE 工具约定
- Windows 终端使用约定与注意事项
- 文档交叉引用与维护

## 交付方式
- 创建文件并写入完整首版内容；内容均为中文，结构清晰可直接使用。

确认后将立即创建该文档并完成首版内容。