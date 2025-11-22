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
  const existing = storage.loadAllWorkspaces()
  if (existing.length === 0) {
    const defaults = [
      { name: 'Work', icon: '💼', color: '#3B82F6' },
      { name: 'Personal', icon: '🏠', color: '#10B981' },
      { name: 'Web3', icon: '🔗', color: '#8B5CF6' },
      { name: 'Study', icon: '📚', color: '#F59E0B' }
    ]
    const created = defaults.map(cfg => workspaceManager.create(cfg))
    workspaceManager.activate(created[0].id)
  }
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