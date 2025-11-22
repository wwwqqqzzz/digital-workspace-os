import { globalShortcut, Menu, MenuItem } from 'electron'
import { WorkspaceManager } from './WorkspaceManager'
import { TabManager } from './TabManager'
import { WindowManager } from './WindowManager'
import { WebViewPoolManager } from './WebViewPoolManager'
import { IPC_CHANNELS } from '../../common/IPCChannels'

export class ShortcutManager {
  constructor(
    private workspace: WorkspaceManager,
    private tabs: TabManager,
    private windows: WindowManager,
    private views: WebViewPoolManager
  ) {}

  register() {
    const reg = (accel: string, fn: () => void) => {
      let ok = false
      try { ok = globalShortcut.register(accel, fn) } catch {}
      if (!ok) {
        const menu = Menu.getApplicationMenu() || new Menu()
        menu.append(new MenuItem({ label: accel, accelerator: accel, click: fn }))
        Menu.setApplicationMenu(menu)
      }
    }
    const key = (k: string) => process.platform === 'darwin' ? `CommandOrControl+${k}` : `Control+${k}`

    reg(key('T'), () => {
      const ws = this.workspace.getActive()
      if (ws) this.tabs.create(ws, 'https://example.com')
    })
    reg(key('W'), () => {
      const ws = this.workspace.getActive()
      if (!ws) return
      const active = this.tabs.getTabsForWorkspace(ws.id).find(t => t.active)
      if (active) this.tabs.close(active.id)
    })
    reg(key('Tab'), () => {
      const ws = this.workspace.getActive()
      if (!ws) return
      this.tabs.activateNext(ws.id)
    })
    reg(key('Shift+Tab'), () => {
      const ws = this.workspace.getActive()
      if (!ws) return
      this.tabs.activatePrev(ws.id)
    })
    for (let i = 1; i <= 9; i++) {
      reg(key(String(i)), () => {
        const list = this.workspace.list()
        const target = list[i - 1]
        if (target) this.workspace.activate(target.id)
      })
    }

    reg(key('L'), () => {
      this.windows.getMainWindow()?.webContents.send(IPC_CHANNELS.UI_EVENT, { type: 'focus-addressbar' })
    })

    reg('F12', () => {
      const ws = this.workspace.getActive()
      if (!ws) return
      const active = this.tabs.getTabsForWorkspace(ws.id).find(t => t.active)
      if (active) this.views.openDevTools(active.id)
    })
  }

  unregisterAll() {
    try { globalShortcut.unregisterAll() } catch {}
  }
}