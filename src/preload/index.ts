import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../common/IPCChannels'
import type { IpcRequest, IpcResponse } from '../common/ipcSchema'

function cid() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2,8)}`
}

async function invoke<TReq, TRes>(channel: string, payload: TReq): Promise<IpcResponse<TRes>> {
  const req: IpcRequest<TReq> = { apiVersion: '1.0', correlationId: cid(), payload }
  const res = await ipcRenderer.invoke(channel, req)
  return res as IpcResponse<TRes>
}

contextBridge.exposeInMainWorld('electronAPI', {
  appInfo: { name: 'Digital Workspace OS', version: '0.1.0' },
  workspace: {
    create: (config: { name: string; icon?: string; color?: string }) => invoke<typeof config, any>(IPC_CHANNELS.WORKSPACE_CREATE, config),
    list: () => invoke<{}, any>(IPC_CHANNELS.WORKSPACE_LIST, {}),
    activate: (id: string) => invoke<{ id: string }, any>(IPC_CHANNELS.WORKSPACE_ACTIVATE, { id }),
    update: (id: string, updates: { name?: string; icon?: string; color?: string }) => invoke<{ id: string; name?: string; icon?: string; color?: string }, any>(IPC_CHANNELS.WORKSPACE_UPDATE, { id, ...updates }),
    delete: (id: string) => invoke<{ id: string }, any>(IPC_CHANNELS.WORKSPACE_DELETE, { id })
  },
  tab: {
    create: (url: string) => invoke<{ url: string }, any>(IPC_CHANNELS.TAB_CREATE, { url }),
    close: (tabId: string) => invoke<{ tabId: string }, any>(IPC_CHANNELS.TAB_CLOSE, { tabId }),
    activate: (tabId: string) => invoke<{ tabId: string }, any>(IPC_CHANNELS.TAB_ACTIVATE, { tabId }),
    navigate: (tabId: string, url: string) => invoke<{ tabId: string; url: string }, any>(IPC_CHANNELS.TAB_NAVIGATE, { tabId, url }),
    reorder: (workspaceId: string, tabIds: string[]) => invoke<{ workspaceId: string; tabIds: string[] }, any>(IPC_CHANNELS.TAB_REORDER, { workspaceId, tabIds })
  },
  onWorkspaceEvent: (handler: (event: { type: string; payload: any }) => void) => {
    ipcRenderer.on(IPC_CHANNELS.WORKSPACE_EVENT, (_e, data) => handler(data))
  },
  onTabEvent: (handler: (event: { type: string; payload: any }) => void) => {
    ipcRenderer.on(IPC_CHANNELS.TAB_EVENT, (_e, data) => handler(data))
  }
})

declare global {
  interface Window {
    electronAPI: {
      appInfo: { name: string; version: string }
      workspace: {
        create: (config: { name: string; icon?: string; color?: string }) => Promise<IpcResponse<any>>
        list: () => Promise<IpcResponse<any>>
        activate: (id: string) => Promise<IpcResponse<any>>
        update: (id: string, updates: { name?: string; icon?: string; color?: string }) => Promise<IpcResponse<any>>
        delete: (id: string) => Promise<IpcResponse<any>>
      }
      tab: {
        create: (url: string) => Promise<IpcResponse<any>>
        close: (tabId: string) => Promise<IpcResponse<any>>
        activate: (tabId: string) => Promise<IpcResponse<any>>
        navigate: (tabId: string, url: string) => Promise<IpcResponse<any>>
        reorder: (workspaceId: string, tabIds: string[]) => Promise<IpcResponse<any>>
      }
      onWorkspaceEvent?: (handler: (event: { type: string; payload: any }) => void) => void
      onTabEvent?: (handler: (event: { type: string; payload: any }) => void) => void
    }
  }
}