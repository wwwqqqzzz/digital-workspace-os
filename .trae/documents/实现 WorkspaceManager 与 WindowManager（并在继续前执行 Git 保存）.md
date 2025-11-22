## 目标
- 在不引入额外依赖的前提下，完成主进程两大管理器的首版：`WorkspaceManager` 与 `WindowManager`。
- 管理器遵循文档与项目规范，事件驱动，持久化委托 `StorageManager`；为阶段 2 的 IPC 层打基础。
- 在开始编码前执行一次 Git 保存（Conventional Commits），确保每个里程碑可回滚。

## 将创建/修改的文件
- 新增：`src/main/managers/WorkspaceManager.ts`
- 新增：`src/main/managers/WindowManager.ts`
- 修改：`src/main/index.ts`（用 `WindowManager` 重构创建与管理主窗口；预留后续将挂载 `BrowserView`）
- 如需：新增类型 `WorkspaceConfig`（在 `src/main/models/Workspace.ts` 内补充）

## WorkspaceManager 实现要点
- 依赖：`StorageManager`、Node `EventEmitter`。
- 方法：
  - `create(config: WorkspaceConfig): Workspace`（生成 `id/partition/createdAt`，持久化并触发 `workspace-created`）
  - `get(id: string): Workspace | null`
  - `list(): Workspace[]`
  - `update(id: string, updates: Partial<Workspace>): Workspace`（持久化并触发 `workspace-updated`）
  - `delete(id: string): void`（触发 `workspace-deleted`）
  - `activate(id: string): void`（保存当前会话必要信息的占位逻辑；更新 `activeWorkspaceId`；触发 `workspace-activated`）
  - `deactivate(): void`
  - `getActive(): Workspace | null`
- 事件：`workspace-created/updated/deleted/activated`（为阶段 2 的广播做准备）。
- 约束：幂等性优先、错误处理遵循错误码规范（返回层面待 IPC 封装）。

## WindowManager 实现要点
- 负责：创建与管理主窗口、统一 `BrowserView` 布局接口。
- 方法：
  - `createMainWindow(): BrowserWindow`（宽 1400×900，最小 1280×720，安全 `webPreferences`）
  - `getMainWindow(): BrowserWindow | null`
  - `setBrowserView(view: BrowserView): void`（计算内容区域，避免遮挡 Sidebar）
  - `attachResizeHandler(): void`（窗口 resize 时动态调整 `BrowserView`）
- 与现有 `src/main/index.ts` 集成：用 `WindowManager` 替换当前直接创建窗口逻辑（保留 preload/CSP）。

## 类型补充
- 在 `src/main/models/Workspace.ts` 添加：
  - `export interface WorkspaceConfig { name: string; icon?: string; color?: string; settings?: WorkspaceSettings }`
- `id/partition` 在创建时生成：`id: 'w_' + nanoid/uuid`（使用轻量本地实现：`Date.now()`+随机数，避免新增依赖）。

## 验证与运行
- 构建：`npm run build`
- 启动：`npm run start`
- 人工验证：
  - 创建 1-2 个 workspace 并激活（暂以开发时入口调用/占位），无异常退出。
  - 观察 `StorageManager` 持久化文件在 `app.getPath('userData')` 下生成。

## Git 提交与约束
- 在编码前：`git add -A; git commit -m "chore(workflow): save before continuing"`
- 完成 WorkspaceManager：`git add -A; git commit -m "feat(workspace): implement WorkspaceManager with events and persistence"`
- 完成 WindowManager：`git add -A; git commit -m "feat(window): add WindowManager and refactor main window creation"`

## 后续衔接（提示）
- 下一阶段将实现 `TabManager` 与 `WebViewPoolManager`，并开始 `src/main/ipc/IPCHandler.ts` 的通道处理映射（严格遵循 `doc/IPC_API_接口规范.md`）。

请确认上述计划，我将先执行一次 Git 保存，然后按顺序实现并验证两大管理器。