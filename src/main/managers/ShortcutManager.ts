import { globalShortcut } from 'electron'
import { WorkspaceManager } from './WorkspaceManager'
import { TabManager } from './TabManager'

export class ShortcutManager {
  constructor(private workspace: WorkspaceManager, private tabs: TabManager) {}

  register() {
    const reg = (accel: string, fn: () => void) => { try { globalShortcut.register(accel, fn) } catch {} }
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
  }

  unregisterAll() {
    try { globalShortcut.unregisterAll() } catch {}
  }
}