import { WorkspaceManager } from '../managers/WorkspaceManager'
import { TabManager } from '../managers/TabManager'
import { WindowManager } from '../managers/WindowManager'
import { IPC_CHANNELS } from '../../common/IPCChannels'

export class EventBridge {
  constructor(
    private workspaceManager: WorkspaceManager,
    private tabManager: TabManager,
    private windowManager: WindowManager
  ) {}

  register() {
    this.workspaceManager.on('workspace-created', payload => {
      this.windowManager.getMainWindow()?.webContents.send(IPC_CHANNELS.WORKSPACE_EVENT, { type: 'created', payload })
    })
    this.workspaceManager.on('workspace-updated', payload => {
      this.windowManager.getMainWindow()?.webContents.send(IPC_CHANNELS.WORKSPACE_EVENT, { type: 'updated', payload })
    })
    this.workspaceManager.on('workspace-deleted', payload => {
      this.windowManager.getMainWindow()?.webContents.send(IPC_CHANNELS.WORKSPACE_EVENT, { type: 'deleted', payload })
    })
    this.workspaceManager.on('workspace-activated', payload => {
      this.windowManager.getMainWindow()?.webContents.send(IPC_CHANNELS.WORKSPACE_EVENT, { type: 'activated', payload })
    })

    this.tabManager.on('tab-created', payload => {
      this.windowManager.getMainWindow()?.webContents.send(IPC_CHANNELS.TAB_EVENT, { type: 'created', payload })
    })
    this.tabManager.on('tab-closed', payload => {
      this.windowManager.getMainWindow()?.webContents.send(IPC_CHANNELS.TAB_EVENT, { type: 'closed', payload })
    })
    this.tabManager.on('tab-activated', payload => {
      this.windowManager.getMainWindow()?.webContents.send(IPC_CHANNELS.TAB_EVENT, { type: 'activated', payload })
    })
    this.tabManager.on('tab-updated', payload => {
      this.windowManager.getMainWindow()?.webContents.send(IPC_CHANNELS.TAB_EVENT, { type: 'updated', payload })
    })
    this.tabManager.on('tab-reordered', payload => {
      this.windowManager.getMainWindow()?.webContents.send(IPC_CHANNELS.TAB_EVENT, { type: 'reordered', payload })
    })
  }
}