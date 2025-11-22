import { BrowserView } from 'electron'
import path from 'node:path'
import { Tab, Workspace } from '../models/Workspace'
import { WindowManager } from './WindowManager'

export class WebViewPoolManager {
  private views: Map<string, BrowserView> = new Map()
  private windowManager: WindowManager

  constructor(windowManager: WindowManager) {
    this.windowManager = windowManager
  }

  create(tab: Tab, workspace: Workspace): BrowserView {
    const view = new BrowserView({
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        contextIsolation: true,
        sandbox: true,
        nodeIntegration: false,
        partition: workspace.partition
      }
    })
    this.views.set(tab.id, view)
    view.webContents.loadURL(tab.url)
    return view
  }

  destroy(tabId: string) {
    const v = this.views.get(tabId)
    if (!v) return
    const win = this.windowManager.getMainWindow()
    if (win) win.removeBrowserView(v)
    this.views.delete(tabId)
  }

  getView(tabId: string): BrowserView | undefined {
    return this.views.get(tabId)
  }
}