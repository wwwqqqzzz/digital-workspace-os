# Digital Workspace OS — AI 项目规则（Trae IDE）

> 本规则用于指导 AI 在 Trae IDE 中协助开发 Digital Workspace OS，统一搜索、规划、补丁、验证与安全实践，确保一致性与可维护性。

---

## 1. 项目简介与适用范围
- 项目：Digital Workspace OS（桌面浏览器工作台）
- 平台：Windows/macOS/Linux（Electron）
- 技术栈：Electron 28+、TypeScript 5+、React 18、Zustand、TailwindCSS、SQLite（better-sqlite3）
- 适用对象：AI 助手、开发者在本仓库的开发协作

---

## 2. 语言与沟通
- 输出语言：默认中文
- 语气：简洁专业
- 复杂任务：先简要总结与确认范围，再实施

---

## 3. 开发与代码规范
- TypeScript：`strict: true`，为所有参数/返回值定义类型；减少 `any`
- 结构：遵循 `src/main|renderer|preload|common` 目录；大型文件使用 `#region/#endregion` 分组
- Lint/Format：ESLint + Prettier（统一风格）；提交前必须通过
- 命名：有意义的变量/函数名；IPC 通道 `domain.action`（如 `workspace.create`）
- 依赖：仅引入项目已用库；新增库需在设计文档说明与评估

---

## 4. IPC/API 约定（必须遵循）
- 通道命名：`<domain>.<action>`，版本策略 SemVer（主版本变更可能破坏兼容）
- 请求包络：必须包含 `apiVersion`、`correlationId` 与 `payload`
- 响应：`ok/data` 或 `ok/error{code,message,details}`，保留 `correlationId`
- 错误码：`VALIDATION_ERROR/NOT_FOUND/PERMISSION_DENIED/IPC_TIMEOUT/STATE_CONFLICT/INTERNAL_ERROR`
- 重试：`IPC_TIMEOUT` 指数退避重试 1-2 次；`STATE_CONFLICT` 读最新后重放
- 访问约束：仅通过 `preload` 暴露的白名单 API 调用；禁止在 Renderer 直接 `ipcRenderer` 任意通道
- 参考：`doc/IPC_API_接口规范.md`

---

## 5. Electron 安全清单
- 隔离：`contextIsolation: true`、`sandbox: true`、`nodeIntegration: false`
- 桥接：`preload` 层做入参校验与序列化，最小暴露
- CSP：默认 `default-src 'self'`，按站点白名单放行；阻断内联脚本
- WebView 导航拦截：校验 Workspace 所属与白/黑名单；禁止跨 Workspace 注入
- 协议限制：仅注册必要协议，禁止任意文件访问
- 插件沙箱：严格权限矩阵与隔离运行，详见 `doc/插件系统设计文档.md`
- 参考：`doc/技术架构设计文档.md`

---

## 6. 数据库规范（SQLite）
- 表命名：`workspaces/tabs/settings/plugin_state/schema_version`
- 索引：为 `last_accessed_at`、`workspace_id`、`active` 等关键字段建索引
- 事务：切换/保存/恢复采用单事务保证原子性
- 迁移：使用 `schema_version` 记录版本，增量迁移与回滚策略
- 备份恢复：文件级备份与 JSON 导入/导出；敏感数据不落库，必要时加密
- 参考：`doc/数据库与数据模型设计.md`

---

## 7. 日志与错误码规范
- 分层命名：`UI_* / IPC_* / MAIN_* / PLUGIN_*`
- 结构化字段：`timestamp/level/module/event|code/message/correlationId/payloadSummary`
- 隐私：不记录 Cookie/Token/PII；调试模式仍屏蔽
- 参考：`doc/技术架构设计文档.md`

---

## 8. 性能门槛与验证
- 目标：
  - 冷启动 `< 3s`
  - Workspace 切换 `< 500ms`
  - Tab 切换 `< 100ms`
  - 内存预算（4 WS × 5 Tab）`< 1.5GB`
- 验证：提供基准场景与采集方法（P50/P95）；新增功能避免突破预算
- 参考：`doc/性能优化方案.md`

---

## 9. 测试策略与运行
- 分层比例：Unit 60% / Integration 30% / E2E 10%
- 覆盖率门槛：全局 `≥70%`；核心模块 `≥80%`
- 框架：Jest（单元/集成）、Playwright（E2E）
- 参考命令：`npm run test`、`npm run e2e`
- 参考：`doc/测试策略文档.md`

---

## 10. 版本与提交规范
- 分支：`feat/*`、`fix/*`、`docs/*`
- 提交：遵循 Conventional Commits（如 `feat(workspace): add activation`）
- PR 检查清单：
  - 代码通过 Lint/Format/测试
  - 接口文档/类型声明同步更新
  - 安全与性能影响说明（必要时）

---

## 11. AI 协作规则（Trae 工具）
- 搜索：优先使用智能搜索；广义关键词（如“会话隔离”“插件权限”）
- 计划：复杂改动先输出计划；获得确认后实施
- 补丁：所有代码改动使用补丁格式（ApplyPatch），避免直接命令创建文件
- 任务管理：使用待办（TodoWrite）管理任务；每次只进行一个在途任务；完成即标记
- 验证：实现后进行验证（测试或可运行检查）；Web 项目可提供预览
- 安全：不引入泄露风险；不提交密钥；不在日志中输出敏感信息
- 提交：除非用户明确要求，不进行仓库提交；但可准备变更供审阅
- 继续前保存：当用户明确指令“继续下一步/继续”时，先执行 Git 保存（如未初始化则执行 `git init`，添加所有当前变更并创建原子提交），提交信息遵循 Conventional Commits，然后再继续后续实现。

---

## 12. Windows 终端约定
- 默认 PowerShell；命令需兼容 Windows
- 长输出命令限制行数或按需截取（如 `git log -n 20`）

---

## 13. 文档交叉引用与维护
- IPC/API：`doc/IPC_API_接口规范.md`
- 数据库：`doc/数据库与数据模型设计.md`
- 技术架构与安全：`doc/技术架构设计文档.md`
- 性能：`doc/性能优化方案.md`
- 测试：`doc/测试策略文档.md`
- 插件：`doc/插件系统设计文档.md`

---

## 14. 验收标准（新增改动）
- 接口符合规范（命名/包络/错误码）
- 安全清单项未被破坏（隔离/CSP/白名单）
- 性能目标不退化；必要时提供对比数据
- 测试通过并满足覆盖率；核心模块 ≥80%
- 文档同步更新并加交叉引用