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
    activate: (id: string) => invoke<{ id: string }, any>(IPC_CHANNELS.WORKSPACE_ACTIVATE, { id })
  },
  tab: {
    create: (url: string) => invoke<{ url: string }, any>(IPC_CHANNELS.TAB_CREATE, { url }),
    close: (tabId: string) => invoke<{ tabId: string }, any>(IPC_CHANNELS.TAB_CLOSE, { tabId }),
    activate: (tabId: string) => invoke<{ tabId: string }, any>(IPC_CHANNELS.TAB_ACTIVATE, { tabId }),
    navigate: (tabId: string, url: string) => invoke<{ tabId: string; url: string }, any>(IPC_CHANNELS.TAB_NAVIGATE, { tabId, url })
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
      }
      tab: {
        create: (url: string) => Promise<IpcResponse<any>>
        close: (tabId: string) => Promise<IpcResponse<any>>
        activate: (tabId: string) => Promise<IpcResponse<any>>
        navigate: (tabId: string, url: string) => Promise<IpcResponse<any>>
      }
    }
  }
}
