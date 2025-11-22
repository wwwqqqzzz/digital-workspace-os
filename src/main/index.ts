import { app, BrowserWindow } from "electron";
import { WindowManager } from "./managers/WindowManager";
import { StorageManager } from "./managers/StorageManager";
import { WorkspaceManager } from "./managers/WorkspaceManager";
import { TabManager } from "./managers/TabManager";
import { WebViewPoolManager } from "./managers/WebViewPoolManager";
import { IPCHandler } from "./ipc/IPCHandler";
import { EventBridge } from "./ipc/EventBridge";
import { ShortcutManager } from "./managers/ShortcutManager";

const windowManager = new WindowManager();
const storage = new StorageManager();
const workspaceManager = new WorkspaceManager(storage);
const tabManager = new TabManager(storage);
const webViewPool = new WebViewPoolManager(windowManager);
const ipcHandler = new IPCHandler(
  workspaceManager,
  tabManager,
  webViewPool,
  windowManager
);
const eventBridge = new EventBridge(
  workspaceManager,
  tabManager,
  windowManager
);
const shortcutManager = new ShortcutManager(workspaceManager, tabManager);

app.whenReady().then(() => {
  windowManager.createMainWindow();
  ipcHandler.register();
  eventBridge.register();
  shortcutManager.register();
  const existing = storage.loadAllWorkspaces();
  if (existing.length === 0) {
    const defaults = [
      { name: "Work", icon: "💼", color: "#3B82F6" },
      { name: "Personal", icon: "🏠", color: "#10B981" },
      { name: "Web3", icon: "🔗", color: "#8B5CF6" },
      { name: "Study", icon: "📚", color: "#F59E0B" },
    ];
    const created = defaults.map((cfg) => workspaceManager.create(cfg));
    workspaceManager.activate(created[0].id);
  } else {
    const activeWsId = storage.getSetting<string>("activeWorkspaceId");
    const ws = activeWsId ? workspaceManager.get(activeWsId) : existing[0];
    if (ws) {
      workspaceManager.activate(ws.id);
      const tabs = storage.loadTabs(ws.id);
      tabManager.setTabsForWorkspace(ws.id, tabs);
      for (const t of tabs) {
        const view = webViewPool.create(t, ws);
        if (t.active) windowManager.setBrowserView(view);
      }
    }
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    windowManager.createMainWindow();
  }
});

app.on("before-quit", () => {
  const activeWs = workspaceManager.getActive();
  if (activeWs) {
    storage.setSetting("activeWorkspaceId", activeWs.id);
    const tabs = tabManager.getTabsForWorkspace(activeWs.id);
    storage.saveTabs(activeWs.id, tabs);
  }
});