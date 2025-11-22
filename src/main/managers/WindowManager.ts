import { BrowserWindow, BrowserView, app } from "electron";
import path from "node:path";

const defaultSidebarWidth = 240;

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;

  createMainWindow(): BrowserWindow {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1280,
      minHeight: 720,
      webPreferences: {
        preload: path.join(__dirname, "../preload/index.js"),
        contextIsolation: true,
        sandbox: true,
        nodeIntegration: false,
      },
    });
    const htmlPath = path.resolve(
      app.getAppPath(),
      "dist",
      "renderer",
      "index.html"
    );
    this.mainWindow.loadFile(htmlPath);
    this.attachResizeHandler();
    return this.mainWindow;
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  setBrowserView(view: BrowserView) {
    if (!this.mainWindow) return;
    this.mainWindow.setBrowserView(view);
    this.layoutBrowserView(view);
  }

  private layoutBrowserView(view: BrowserView) {
    if (!this.mainWindow) return;
    const [w, h] = this.mainWindow.getContentSize();
    const x = defaultSidebarWidth;
    const width = Math.max(0, w - x);
    const height = h;
    view.setBounds({ x, y: 0, width, height });
  }

  attachResizeHandler() {
    if (!this.mainWindow) return;
    this.mainWindow.on("resize", () => {
      const view = this.mainWindow!.getBrowserView();
      if (view) this.layoutBrowserView(view);
    });
  }
}
