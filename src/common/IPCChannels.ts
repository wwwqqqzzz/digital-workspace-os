export const IPC_CHANNELS = {
  WORKSPACE_CREATE: 'workspace.create',
  WORKSPACE_LIST: 'workspace.list',
  WORKSPACE_UPDATE: 'workspace.update',
  WORKSPACE_DELETE: 'workspace.delete',
  WORKSPACE_ACTIVATE: 'workspace.activate',
  WORKSPACE_EVENT: 'workspace.event',
  TAB_CREATE: 'tab.create',
  TAB_CLOSE: 'tab.close',
  TAB_ACTIVATE: 'tab.activate',
  TAB_NAVIGATE: 'tab.navigate',
  TAB_REORDER: 'tab.reorder',
  TAB_EVENT: 'tab.event'
} as const

export type IPCChannel = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS]
