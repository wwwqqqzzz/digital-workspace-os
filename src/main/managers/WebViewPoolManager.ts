import { BrowserView } from "electron";
import path from "node:path";
import { Tab, Workspace } from "../models/Workspace";
import { WindowManager } from "./WindowManager";
import { IPC_CHANNELS } from "../../common/IPCChannels";

export class WebViewPoolManager {
  private views: Map<string, BrowserView> = new Map();
  private windowManager: WindowManager;

  constructor(windowManager: WindowManager) {
    this.windowManager = windowManager;
  }

  create(tab: Tab, workspace: Workspace): BrowserView {
    const view = new BrowserView({
      webPreferences: {
        preload: path.join(__dirname, "../preload/index.js"),
        contextIsolation: true,
        sandbox: true,
        nodeIntegration: false,
        partition: workspace.partition,
      },
    });
    this.views.set(tab.id, view);
    view.webContents.loadURL(tab.url);
    this.attachWebViewEvents(tab, view);
    return view;
  }

  destroy(tabId: string) {
    const v = this.views.get(tabId);
    if (!v) return;
    const win = this.windowManager.getMainWindow();
    if (win) win.removeBrowserView(v);
    this.views.delete(tabId);
  }

  getView(tabId: string): BrowserView | undefined {
    return this.views.get(tabId);
  }

  openDevTools(tabId: string) {
    const v = this.views.get(tabId);
    if (!v) return;
    try {
      v.webContents.openDevTools({ mode: "detach" as any });
    } catch {}
  }

  private attachWebViewEvents(tab: Tab, view: BrowserView) {
    const win = this.windowManager.getMainWindow();
    view.webContents.on("render-process-gone", (_e, details: any) => {
      win?.webContents.send(IPC_CHANNELS.TAB_EVENT, {
        type: "error",
        payload: { id: tab.id, code: "WEBVIEW_CRASH", reason: details?.reason },
      });
      try {
        view.webContents.reload();
      } catch {}
    });
    view.webContents.on(
      "did-fail-load",
      (_e, errorCode: number, errorDesc: string) => {
        win?.webContents.send(IPC_CHANNELS.TAB_EVENT, {
          type: "error",
          payload: {
            id: tab.id,
            code: "WEBVIEW_LOAD_FAIL",
            reason: `${errorCode}:${errorDesc}`,
          },
        });
      }
    );
  }
}
