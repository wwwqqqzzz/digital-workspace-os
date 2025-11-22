import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../common/IPCChannels'
import { IpcRequest, IpcResponse } from '../../common/ipcSchema'
import { WorkspaceManager } from '../managers/WorkspaceManager'
import { TabManager } from '../managers/TabManager'
import { WebViewPoolManager } from '../managers/WebViewPoolManager'
import { WindowManager } from '../managers/WindowManager'

export class IPCHandler {
  constructor(
    private workspaceManager: WorkspaceManager,
    private tabManager: TabManager,
    private webViewPool: WebViewPoolManager,
    private windowManager: WindowManager
  ) {}

  register() {
    ipcMain.handle(IPC_CHANNELS.WORKSPACE_CREATE, async (_e, req: IpcRequest<{ name: string; icon?: string; color?: string }>): Promise<IpcResponse<any>> => {
      try {
        const ws = this.workspaceManager.create({ name: req.payload.name, icon: req.payload.icon, color: req.payload.color })
        return { ok: true, data: ws, correlationId: req.correlationId }
      } catch (err: any) {
        return { ok: false, error: { code: 'INTERNAL_ERROR', message: String(err?.message || err) }, correlationId: req.correlationId }
      }
    })

    ipcMain.handle(IPC_CHANNELS.WORKSPACE_LIST, async (_e, req: IpcRequest<{}>): Promise<IpcResponse<any>> => {
      try {
        const data = this.workspaceManager.list()
        return { ok: true, data, correlationId: req.correlationId }
      } catch (err: any) {
        return { ok: false, error: { code: 'INTERNAL_ERROR', message: String(err?.message || err) }, correlationId: req.correlationId }
      }
    })

    ipcMain.handle(IPC_CHANNELS.WORKSPACE_ACTIVATE, async (_e, req: IpcRequest<{ id: string }>): Promise<IpcResponse<any>> => {
      try {
        this.workspaceManager.activate(req.payload.id)
        return { ok: true, data: { active: true }, correlationId: req.correlationId }
      } catch (err: any) {
        const code = String(err?.message) === 'NOT_FOUND' ? 'NOT_FOUND' : 'INTERNAL_ERROR'
        return { ok: false, error: { code, message: String(err?.message || err) }, correlationId: req.correlationId }
      }
    })

    ipcMain.handle(IPC_CHANNELS.TAB_CREATE, async (_e, req: IpcRequest<{ url: string }>): Promise<IpcResponse<any>> => {
      try {
        const ws = this.workspaceManager.getActive()
        if (!ws) return { ok: false, error: { code: 'STATE_CONFLICT', message: 'no active workspace' }, correlationId: req.correlationId }
        const tab = this.tabManager.create(ws, req.payload.url)
        const view = this.webViewPool.create(tab, ws)
        this.windowManager.setBrowserView(view)
        return { ok: true, data: tab, correlationId: req.correlationId }
      } catch (err: any) {
        return { ok: false, error: { code: 'INTERNAL_ERROR', message: String(err?.message || err) }, correlationId: req.correlationId }
      }
    })

    ipcMain.handle(IPC_CHANNELS.TAB_ACTIVATE, async (_e, req: IpcRequest<{ tabId: string }>): Promise<IpcResponse<any>> => {
      try {
        this.tabManager.activate(req.payload.tabId)
        const view = this.webViewPool.getView(req.payload.tabId)
        if (view) this.windowManager.setBrowserView(view)
        return { ok: true, data: { active: true }, correlationId: req.correlationId }
      } catch (err: any) {
        return { ok: false, error: { code: 'INTERNAL_ERROR', message: String(err?.message || err) }, correlationId: req.correlationId }
      }
    })

    ipcMain.handle(IPC_CHANNELS.TAB_CLOSE, async (_e, req: IpcRequest<{ tabId: string }>): Promise<IpcResponse<any>> => {
      try {
        this.webViewPool.destroy(req.payload.tabId)
        this.tabManager.close(req.payload.tabId)
        return { ok: true, data: { closed: true }, correlationId: req.correlationId }
      } catch (err: any) {
        return { ok: false, error: { code: 'INTERNAL_ERROR', message: String(err?.message || err) }, correlationId: req.correlationId }
      }
    })

    ipcMain.handle(IPC_CHANNELS.TAB_NAVIGATE, async (_e, req: IpcRequest<{ tabId: string; url: string }>): Promise<IpcResponse<any>> => {
      try {
        this.tabManager.update(req.payload.tabId, { url: req.payload.url })
        const view = this.webViewPool.getView(req.payload.tabId)
        if (view) view.webContents.loadURL(req.payload.url)
        return { ok: true, data: { navigated: true }, correlationId: req.correlationId }
      } catch (err: any) {
        return { ok: false, error: { code: 'INTERNAL_ERROR', message: String(err?.message || err) }, correlationId: req.correlationId }
      }
    })
  }
}