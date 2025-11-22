import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  appInfo: {
    name: 'Digital Workspace OS',
    version: '0.1.0'
  }
})