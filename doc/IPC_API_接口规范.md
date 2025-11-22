# Digital Workspace OS — IPC/API 接口规范

> 规范 Electron 多进程下的 IPC 通道、请求/响应结构、错误码与安全约束，指导 Renderer/Preload/Main 的一致协作。

---

## 一、背景与范围

- 适用进程：`Main`（主进程）、`Renderer`（渲染进程）、`Preload`（桥脚本）
- 通讯方式：`ipcMain`/`ipcRenderer` + `contextBridge` 暴露 API（只读白名单）
- 覆盖对象：Workspace、Tab、Session、WebView、Plugin 相关的接口

---

## 二、约定与版本策略

- 命名规则：`<domain>.<action>`，如 `workspace.create`、`tab.activate`
- 版本策略：SemVer（主版本变更可能引入破坏性改动），通过 `apiVersion` 维持兼容
- 兼容与弃用：弃用通道需在两个小版本周期内保留并标注 `deprecated: true`
- 幂等要求：除 `create`/`delete` 外，所有 `update`/`activate` 等应尽量设计为幂等

---

## 三、通道枚举（核心子集）

- Workspace
  - `workspace.create`、`workspace.list`、`workspace.update`、`workspace.delete`、`workspace.activate`
- Tab
  - `tab.create`、`tab.close`、`tab.activate`、`tab.navigate`、`tab.reorder`
- Session
  - `session.get`、`session.clear`、`session.exportCookies`、`session.importCookies`
- WebView
  - `webview.create`、`webview.destroy`、`webview.suspend`、`webview.resume`
- Plugin
  - `plugin.enable`、`plugin.disable`、`plugin.invoke`

---

## 四、请求/响应 Schema

### 4.1 通用包络

```json
// Request
{
  "apiVersion": "1.0",
  "correlationId": "uuid-...",
  "payload": { /* 具体参数 */ }
}

// Response（成功）
{
  "ok": true,
  "data": { /* 具体返回 */ },
  "correlationId": "uuid-..."
}

// Response（失败）
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "name is required",
    "details": { "field": "name" }
  },
  "correlationId": "uuid-..."
}
```

### 4.2 示例：创建 Workspace（`workspace.create`）

```json
// payload
{
  "name": "Web3",
  "icon": "🔗",
  "color": "#3B82F6",
  "settings": {
    "autoSuspendTabs": true,
    "suspendAfterMinutes": 30
  }
}

// 成功返回
{
  "id": "w_abc123",
  "name": "Web3",
  "icon": "🔗",
  "color": "#3B82F6",
  "partition": "persist:workspace-xyz",
  "createdAt": 1730000000000
}
```

### 4.3 示例：激活 Workspace（`workspace.activate`）

```json
// payload
{ "id": "w_abc123" }

// 成功返回
{ "active": true, "activatedAt": 1730000001000 }
```

### 4.4 示例：创建 Tab（`tab.create`）

```json
// payload
{ "workspaceId": "w_abc123", "url": "https://mail.google.com" }

// 成功返回
{ "id": "t_def456", "title": "Gmail", "favicon": "...", "active": true }
```

### 4.5 示例：导航 Tab（`tab.navigate`）

```json
// payload
{ "tabId": "t_def456", "url": "https://notion.so" }

// 成功返回
{ "navigated": true, "title": "Notion" }
```

---

## 五、错误码与重试策略

- 错误码（建议）
  - `VALIDATION_ERROR`（参数非法）
  - `NOT_FOUND`（目标不存在）
  - `PERMISSION_DENIED`（越权或未授权）
  - `IPC_TIMEOUT`（进程通信超时）
  - `STATE_CONFLICT`（状态冲突/不一致）
  - `INTERNAL_ERROR`（未知异常）
- 重试策略
  - `IPC_TIMEOUT`：允许重试 1-2 次，指数退避（50ms/200ms）
  - `STATE_CONFLICT`：读取最新状态后重放（需保证幂等）
  - 其他错误：直接返回并提示用户，记录日志与关联 ID

---

## 六、安全约束

- 仅通过 `preload` 暴露受限 API，所有入参在 `preload` 层先做校验/序列化
- 禁止在 Renderer 中直接调用 `ipcRenderer` 非白名单通道
- WebView 相关操作必须携带所属 Workspace/Tab 校验，阻断跨 Workspace 操作
- 插件调用走插件宿主桥，严格权限检查与隔离（见 `doc/插件系统设计文档.md`）

---

## 七、交互序列（示例）

- 切换 Workspace：
  1）Renderer 调用 `workspace.activate`
  2）Main 保存当前 Workspace Tabs 状态（事务）
  3）Main 恢复目标 Workspace 的 Tabs 与 BrowserView
  4）返回 `active: true` 并广播事件到 Renderer

---

## 八、参考与交叉引用

- `doc/技术架构设计文档.md`（模块职责与进程布局）
- `doc/MVP 开发计划.md`（IPC 通道实现任务）
- `doc/插件系统设计文档.md`（插件 API 与权限）