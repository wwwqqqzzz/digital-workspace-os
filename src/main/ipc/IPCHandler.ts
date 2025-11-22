import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../common/IPCChannels'
import { IpcRequest, IpcResponse } from '../../common/ipcSchema'
import { WorkspaceManager } from '../managers/WorkspaceManager'
import { TabManager } from '../managers/TabManager'
import { WebViewPoolManager } from '../managers/WebViewPoolManager'
import { WindowManager } from '../managers/WindowManager'
import { ensureString, ensureArrayOfStrings } from '../../common/validation'

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
        const id = ensureString(req.payload.id)
        this.workspaceManager.activate(id)
        return { ok: true, data: { active: true }, correlationId: req.correlationId }
      } catch (err: any) {
        const code = String(err?.message) === 'NOT_FOUND' ? 'NOT_FOUND' : 'INTERNAL_ERROR'
        return { ok: false, error: { code, message: String(err?.message || err) }, correlationId: req.correlationId }
      }
    })

    ipcMain.handle(IPC_CHANNELS.WORKSPACE_UPDATE, async (_e, req: IpcRequest<{ id: string; name?: string; icon?: string; color?: string }>): Promise<IpcResponse<any>> => {
      try {
        const id = ensureString(req.payload.id)
        const updates: any = {}
        if (req.payload.name !== undefined) updates.name = ensureString(req.payload.name)
        if (req.payload.icon !== undefined) updates.icon = ensureString(req.payload.icon)
        if (req.payload.color !== undefined) updates.color = ensureString(req.payload.color)
        const ws = this.workspaceManager.update(id, updates)
        return { ok: true, data: ws, correlationId: req.correlationId }
      } catch (err: any) {
        const msg = String(err?.message || err)
        const code = msg === 'NOT_FOUND' ? 'NOT_FOUND' : msg === 'VALIDATION_ERROR' ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR'
        return { ok: false, error: { code, message: msg }, correlationId: req.correlationId }
      }
    })

    ipcMain.handle(IPC_CHANNELS.WORKSPACE_DELETE, async (_e, req: IpcRequest<{ id: string }>): Promise<IpcResponse<any>> => {
      try {
        const id = ensureString(req.payload.id)
        const ws = this.workspaceManager.get(id)
        if (!ws) return { ok: false, error: { code: 'NOT_FOUND', message: 'workspace not found' }, correlationId: req.correlationId }
        this.workspaceManager.delete(id)
        return { ok: true, data: { deleted: true }, correlationId: req.correlationId }
      } catch (err: any) {
        const msg = String(err?.message || err)
        const code = msg === 'VALIDATION_ERROR' ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR'
        return { ok: false, error: { code, message: msg }, correlationId: req.correlationId }
      }
    })

    ipcMain.handle(IPC_CHANNELS.TAB_CREATE, async (_e, req: IpcRequest<{ url: string }>): Promise<IpcResponse<any>> => {
      try {
        const ws = this.workspaceManager.getActive()
        if (!ws) return { ok: false, error: { code: 'STATE_CONFLICT', message: 'no active workspace' }, correlationId: req.correlationId }
        const url = ensureString(req.payload.url)
        const tab = this.tabManager.create(ws, url)
        const view = this.webViewPool.create(tab, ws)
        this.windowManager.setBrowserView(view)
        return { ok: true, data: tab, correlationId: req.correlationId }
      } catch (err: any) {
        const msg = String(err?.message || err)
        const code = msg === 'VALIDATION_ERROR' ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR'
        return { ok: false, error: { code, message: msg }, correlationId: req.correlationId }
      }
    })

    ipcMain.handle(IPC_CHANNELS.TAB_ACTIVATE, async (_e, req: IpcRequest<{ tabId: string }>): Promise<IpcResponse<any>> => {
      try {
        const tabId = ensureString(req.payload.tabId)
        this.tabManager.activate(tabId)
        const view = this.webViewPool.getView(tabId)
        if (view) this.windowManager.setBrowserView(view)
        return { ok: true, data: { active: true }, correlationId: req.correlationId }
      } catch (err: any) {
        return { ok: false, error: { code: 'INTERNAL_ERROR', message: String(err?.message || err) }, correlationId: req.correlationId }
      }
    })

    ipcMain.handle(IPC_CHANNELS.TAB_CLOSE, async (_e, req: IpcRequest<{ tabId: string }>): Promise<IpcResponse<any>> => {
      try {
        const tabId = ensureString(req.payload.tabId)
        this.webViewPool.destroy(tabId)
        this.tabManager.close(tabId)
        return { ok: true, data: { closed: true }, correlationId: req.correlationId }
      } catch (err: any) {
        return { ok: false, error: { code: 'INTERNAL_ERROR', message: String(err?.message || err) }, correlationId: req.correlationId }
      }
    })

    ipcMain.handle(IPC_CHANNELS.TAB_NAVIGATE, async (_e, req: IpcRequest<{ tabId: string; url: string }>): Promise<IpcResponse<any>> => {
      try {
        const tabId = ensureString(req.payload.tabId)
        const url = ensureString(req.payload.url)
        this.tabManager.update(tabId, { url })
        const view = this.webViewPool.getView(tabId)
        if (view) view.webContents.loadURL(url)
        return { ok: true, data: { navigated: true }, correlationId: req.correlationId }
      } catch (err: any) {
        return { ok: false, error: { code: 'INTERNAL_ERROR', message: String(err?.message || err) }, correlationId: req.correlationId }
      }
    })

    ipcMain.handle(IPC_CHANNELS.TAB_REORDER, async (_e, req: IpcRequest<{ workspaceId: string; tabIds: string[] }>): Promise<IpcResponse<any>> => {
      try {
        const workspaceId = ensureString(req.payload.workspaceId)
        const tabIds = ensureArrayOfStrings(req.payload.tabIds)
        this.tabManager.reorder(workspaceId, tabIds)
        return { ok: true, data: { reordered: true }, correlationId: req.correlationId }
      } catch (err: any) {
        const msg = String(err?.message || err)
        const code = msg === 'VALIDATION_ERROR' ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR'
        return { ok: false, error: { code, message: msg }, correlationId: req.correlationId }
      }
    })

    ipcMain.handle(IPC_CHANNELS.TAB_LIST, async (_e, req: IpcRequest<{ workspaceId: string }>): Promise<IpcResponse<any>> => {
      try {
        const workspaceId = ensureString(req.payload.workspaceId)
        const tabs = this.tabManager.getTabsForWorkspace(workspaceId)
        return { ok: true, data: tabs, correlationId: req.correlationId }
      } catch (err: any) {
        const msg = String(err?.message || err)
        return { ok: false, error: { code: 'INTERNAL_ERROR', message: msg }, correlationId: req.correlationId }
      }
    })
  }
}