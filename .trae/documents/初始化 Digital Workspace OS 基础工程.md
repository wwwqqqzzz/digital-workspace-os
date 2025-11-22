## 目标
- 完成“阶段 0：项目初始化”并产出一个可运行的 Electron 窗口（Hello Digital Workspace OS）。
- 严格遵循项目规则：Electron 安全基线（contextIsolation/sandbox/nodeIntegration=false）、TypeScript 严格模式、目录结构 `src/main|renderer|preload`。
- 暂不接入 React/Webpack；先跑通主进程 + 预加载 + 基础渲染页，随后按文档在阶段 3 集成 React/Webpack。

## 将创建/修改的文件
- `package.json`：定义依赖与脚本（`dev/build/start`）。
- `tsconfig.json`：TypeScript 编译配置（target ES2020、module commonjs、strict true、outDir `dist`）。
- `src/main/index.ts`：主进程入口，创建主窗口并加载渲染页，应用安全配置。
- `src/preload/index.ts`：通过 `contextBridge` 暴露受限 API（示例：`appInfo`）。
- `src/renderer/index.html`：静态页面占位（显示 Hello Digital Workspace OS，禁止内联脚本）。
- `.gitignore`：忽略 `dist/`、`node_modules/`、打包输出等。
- `resources/`：预留资源目录（图标占位，不添加真实文件）。

## 依赖与版本
- 运行时：`electron@^28`。
- 开发：`typescript@^5`、`@types/node@^18`。
- 说明：不新增非必要依赖；ESLint/Prettier、打包器（electron-builder）在后续阶段配置。

## 脚本与配置
- `package.json:scripts`
  - `build`: `tsc`
  - `start`: `electron .`（`main` 指向 `dist/main/index.js`）
  - `dev`: `tsc --watch`（可选：先 watch，再手动 `start`）
- `tsconfig.json`
  - `compilerOptions`: `{ target: "ES2020", module: "commonjs", outDir: "dist", rootDir: "src", strict: true, moduleResolution: "node", esModuleInterop: true }`
  - `include`: `src/**/*`

## 主进程实现要点（`src/main/index.ts`）
- `app.whenReady()` 创建 `BrowserWindow(1400x900)`；`webPreferences`: `{ preload: path.resolve(dist/preload/index.js), contextIsolation: true, sandbox: true, nodeIntegration: false }`。
- 加载 `index.html`（通过 `loadFile`）；处理 `window-all-closed`、`activate` 生命周期。
- 保留最小日志；不输出敏感信息。

## 预加载层（`src/preload/index.ts`）
- `contextBridge.exposeInMainWorld('electronAPI', { appInfo: { name, version } })`。
- 仅示例 API，后续按 IPC 规范扩展；输入校验在此层执行。

## 渲染页（`src/renderer/index.html`）
- 仅展示文本与基本样式；无内联脚本（满足 CSP）。
- React 将在阶段 3 通过 Webpack 集成并替换为 `index.tsx` 构建产物。

## 验证与运行
- 步骤：`npm install` → `npm run build` → `npm run start`。
- 期望：启动一个窗口，显示“Hello Digital Workspace OS”；DevTools 禁止内联脚本报错；主进程安全配置生效。

## 后续里程碑衔接
- 阶段 1：实现核心主进程管理器（Workspace/Storage/Tab/Window/WebView Pool）。
- 阶段 2：按 `doc/IPC_API_接口规范.md` 实现 IPC 通道与响应包络/错误码。
- 阶段 3：配置 React + Webpack + Tailwind + Zustand，并替换渲染层入口。

## 待确认项
- Node 版本与包管理器：是否按 `Node >= 18`、`npm` 默认执行？
- 是否接受先以静态 `index.html` 完成可运行原型，随后再集成 React/Webpack？
- Electron 版本锁定到 `28.x` 是否满足你的平台需求（Windows/macOS/Linux）？