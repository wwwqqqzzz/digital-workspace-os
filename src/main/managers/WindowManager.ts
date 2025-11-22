import { BrowserWindow, BrowserView, app } from "electron";
import path from "node:path";

const defaultSidebarWidth = 240;
const defaultTopBarHeight = 140;

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private topBarHeight: number = defaultTopBarHeight;
  private contentBounds?: { x: number; y: number; width: number; height: number };

  createMainWindow(): BrowserWindow {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1280,
      minHeight: 720,
      webPreferences: {
        preload: path.resolve(app.getAppPath(), "dist", "preload", "index.js"),
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
    if (this.contentBounds) {
      const { x, y, width, height } = this.contentBounds;
      view.setBounds({ x, y, width, height });
      return;
    }
    const x = defaultSidebarWidth;
    const y = this.topBarHeight;
    const width = Math.max(0, w - x);
    const height = Math.max(0, h - y);
    view.setBounds({ x, y, width, height });
  }

  attachResizeHandler() {
    if (!this.mainWindow) return;
    this.mainWindow.on("resize", () => {
      const view = this.mainWindow!.getBrowserView();
      if (view) this.layoutBrowserView(view);
    });
  }

  setTopBarHeight(height: number) {
    this.topBarHeight = Math.max(76, Math.min(height, 400));
    const view = this.mainWindow?.getBrowserView();
    if (view) this.layoutBrowserView(view);
  }

  setContentBounds(bounds: { x: number; y: number; width: number; height: number }) {
    this.contentBounds = bounds;
    const view = this.mainWindow?.getBrowserView();
    if (view) this.layoutBrowserView(view);
  }
}
