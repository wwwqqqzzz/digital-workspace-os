## 目标
- 扩展 IPC 通道（workspace.update/delete、tab.reorder），增加严格参数校验与错误码映射。
- 集成前端开发栈（React + Webpack + Tailwind + Zustand），替换静态 `index.html`，实现 Sidebar/TabBar 基础 UI 与事件驱动状态。
- 全流程保持安全基线与“继续前保存”Git 约定。

## 更改与新增文件清单
- 主进程 IPC：
  - 新增/修改 `src/main/ipc/IPCHandler.ts`（添加 update/delete/reorder 通道与校验）
  - 新增 `src/common/validation.ts`（轻量参数校验工具；返回 `VALIDATION_ERROR`）
- Preload：
  - 修改 `src/preload/index.ts`（暴露新的 `workspace.update/delete` 与 `tab.reorder`）
- 渲染层基础：
  - 新增 `webpack.config.js`、`.babelrc`、`tailwind.config.js`、`postcss.config.js`
  - 新增 `src/renderer/index.tsx`、`src/renderer/App.tsx`
  - 新增 `src/renderer/styles/globals.css`
  - 新增 Zustand Store：`src/renderer/store/useAppStore.ts`
  - 新增组件：`src/renderer/components/{Sidebar.tsx, WorkspaceItem.tsx, TabBar.tsx, TabItem.tsx, MainContent.tsx, WebViewContainer.tsx}`
- 运行脚本：
  - 更新 `package.json` scripts：`dev: webpack --config webpack.config.js --watch && electron .`（或分离 dev-server 与 Electron 运行）

## 技术实现要点
- IPC/校验：
  - `workspace.update`：校验 `id/name/icon/color` 类型与长度，找不到返回 `NOT_FOUND`，非法返回 `VALIDATION_ERROR`。
  - `workspace.delete`：校验 `id`；删除对应 tabs（由 FK 约束与 StorageManager 处理）。
  - `tab.reorder`：校验 `workspaceId` 与 `tabIds: string[]`；若顺序不一致返回 `STATE_CONFLICT`（可选）。
  - 错误码映射：遵循 `doc/IPC_API_接口规范.md`，统一包络。
- 前端：
  - Webpack：入口 `src/renderer/index.tsx`，输出到 `dist/renderer`；`babel-loader` 处理 TSX。
  - Tailwind：`globals.css` 引入 Tailwind 指令，`content` 指向 `src/renderer/**/*.{ts,tsx,html}`。
  - Zustand：Store 内集中维护 `workspaces/tabs/activeWorkspace/activeTab` 与 actions，订阅 `onWorkspaceEvent/onTabEvent` 更新状态。
  - 组件：
    - `Sidebar` 渲染 Workspace 列表、调用 `workspace.activate`；
    - `TabBar` 渲染 tabs、调用 `tab.create/activate/close/reorder`；
    - `MainContent` + `WebViewContainer` 作为视图占位，实际由 Main 侧 `BrowserView` 控制。
  - CSP/安全：保持不使用内联脚本；通过打包产物在主窗口加载。

## 验证
- 构建前端：`npm install` 所需依赖（react/react-dom/@types、webpack/babel-loader/@babel/preset-react/@babel/preset-typescript、tailwindcss/postcss/autoprefixer、zustand）。
- 运行：`npm run build`（TS）→ Webpack 构建 → `npm run start`。
- 手动验证：
  - 首次加载时可创建默认 Workspaces（可在 App `useEffect` 触发）；
  - Sidebar 点击切换 Workspace；TabBar 新建与关闭标签；地址栏导航触发 IPC。

## Git 约定
- 每个里程碑前执行保存：
  - `chore(workflow): save before continuing (ipc validation)`
  - `feat(ipc): add workspace.update/delete and tab.reorder with validation`
  - `chore(frontend): scaffold webpack/tailwind/zustand`
  - `feat(ui): implement Sidebar/TabBar and event-driven state`

## 后续扩展
- 事件持久化与恢复：应用启动恢复上次活动 Workspace 与 Tabs。
- 错误提示：在 Renderer 增加轻量 Toast 通知组件（阶段 11）。

确认后我将按上述文件清单与步骤逐项实现、构建并验证运行，且在每一步前执行 Git 保存。