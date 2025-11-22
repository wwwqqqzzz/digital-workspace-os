import { EventEmitter } from 'events'
import { StorageManager } from './StorageManager'
import { Tab, Workspace } from '../models/Workspace'

function genId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2,8)}`
}

export class TabManager extends EventEmitter {
  private storage: StorageManager
  private workspaceTabs: Map<string, Tab[]> = new Map()
  private tabToWorkspace: Map<string, string> = new Map()

  constructor(storage: StorageManager) {
    super()
    this.storage = storage
  }

  getTabsForWorkspace(workspaceId: string): Tab[] {
    if (!this.workspaceTabs.has(workspaceId)) {
      const tabs = this.storage.loadTabs(workspaceId)
      this.workspaceTabs.set(workspaceId, tabs)
      for (const t of tabs) this.tabToWorkspace.set(t.id, workspaceId)
    }
    return this.workspaceTabs.get(workspaceId)!
  }

  create(workspace: Workspace, url: string): Tab {
    const tabs = this.getTabsForWorkspace(workspace.id)
    const now = Date.now()
    const id = genId('t')
    for (const t of tabs) t.active = false
    const tab: Tab = {
      id,
      workspaceId: workspace.id,
      url,
      active: true,
      suspended: false,
      createdAt: now,
      lastAccessedAt: now
    }
    tabs.push(tab)
    this.tabToWorkspace.set(id, workspace.id)
    this.storage.saveTabs(workspace.id, tabs)
    this.emit('tab-created', tab)
    return tab
  }

  close(tabId: string) {
    const wsId = this.tabToWorkspace.get(tabId)
    if (!wsId) return
    const tabs = this.getTabsForWorkspace(wsId)
    const idx = tabs.findIndex(t => t.id === tabId)
    if (idx === -1) return
    const wasActive = tabs[idx].active
    const removed = tabs.splice(idx, 1)[0]
    this.tabToWorkspace.delete(tabId)
    if (wasActive && tabs.length > 0) tabs[0].active = true
    this.storage.saveTabs(wsId, tabs)
    this.emit('tab-closed', removed)
  }

  activate(tabId: string) {
    const wsId = this.tabToWorkspace.get(tabId)
    if (!wsId) return
    const tabs = this.getTabsForWorkspace(wsId)
    for (const t of tabs) t.active = t.id === tabId
    const activeTab = tabs.find(t => t.id === tabId)!
    activeTab.lastAccessedAt = Date.now()
    this.storage.saveTabs(wsId, tabs)
    this.emit('tab-activated', activeTab)
  }

  update(tabId: string, updates: Partial<Tab>) {
    const wsId = this.tabToWorkspace.get(tabId)
    if (!wsId) return
    const tabs = this.getTabsForWorkspace(wsId)
    const idx = tabs.findIndex(t => t.id === tabId)
    if (idx === -1) return
    const next = { ...tabs[idx], ...updates, lastAccessedAt: Date.now() }
    tabs[idx] = next
    this.storage.saveTabs(wsId, tabs)
    this.emit('tab-updated', next)
  }

  reorder(workspaceId: string, tabIds: string[]) {
    const tabs = this.getTabsForWorkspace(workspaceId)
    const idToTab = new Map(tabs.map(t => [t.id, t]))
    const next: Tab[] = []
    for (const id of tabIds) {
      const t = idToTab.get(id)
      if (t) next.push(t)
    }
    for (const t of tabs) if (!idToTab.has(t.id)) next.push(t)
    this.workspaceTabs.set(workspaceId, next)
    this.storage.saveTabs(workspaceId, next)
    this.emit('tab-reordered', next)
  }
}