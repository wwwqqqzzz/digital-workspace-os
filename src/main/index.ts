import { app, BrowserWindow } from 'electron'
import { WindowManager } from './managers/WindowManager'
import { StorageManager } from './managers/StorageManager'
import { WorkspaceManager } from './managers/WorkspaceManager'
import { TabManager } from './managers/TabManager'
import { WebViewPoolManager } from './managers/WebViewPoolManager'
import { IPCHandler } from './ipc/IPCHandler'
import { EventBridge } from './ipc/EventBridge'

const windowManager = new WindowManager()
const storage = new StorageManager()
const workspaceManager = new WorkspaceManager(storage)
const tabManager = new TabManager(storage)
const webViewPool = new WebViewPoolManager(windowManager)
const ipcHandler = new IPCHandler(workspaceManager, tabManager, webViewPool, windowManager)
const eventBridge = new EventBridge(workspaceManager, tabManager, windowManager)

app.whenReady().then(() => {
  windowManager.createMainWindow()
  ipcHandler.register()
  eventBridge.register()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    windowManager.createMainWindow()
  }
})