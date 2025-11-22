import { EventEmitter } from 'events'
import { Workspace, WorkspaceConfig } from '../models/Workspace'
import { StorageManager } from './StorageManager'

function genId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2,8)}`
}

export class WorkspaceManager extends EventEmitter {
  private storage: StorageManager
  private activeWorkspaceId: string | null = null

  constructor(storage: StorageManager) {
    super()
    this.storage = storage
  }

  create(config: WorkspaceConfig): Workspace {
    const id = genId('w')
    const partition = `persist:workspace-${id}`
    const now = Date.now()
    const ws: Workspace = {
      id,
      name: config.name,
      icon: config.icon,
      color: config.color,
      partition,
      settings: config.settings,
      createdAt: now,
      lastAccessedAt: now
    }
    this.storage.saveWorkspace(ws)
    this.emit('workspace-created', ws)
    return ws
  }

  get(id: string): Workspace | null {
    return this.storage.loadWorkspace(id)
  }

  list(): Workspace[] {
    return this.storage.loadAllWorkspaces()
  }

  update(id: string, updates: Partial<Workspace>): Workspace {
    const current = this.get(id)
    if (!current) throw new Error('NOT_FOUND')
    const next: Workspace = {
      ...current,
      ...updates,
      lastAccessedAt: Date.now()
    }
    this.storage.saveWorkspace(next)
    this.emit('workspace-updated', next)
    return next
  }

  delete(id: string): void {
    this.storage.deleteWorkspace(id)
    if (this.activeWorkspaceId === id) this.activeWorkspaceId = null
    this.emit('workspace-deleted', id)
  }

  activate(id: string): void {
    const ws = this.get(id)
    if (!ws) throw new Error('NOT_FOUND')
    this.activeWorkspaceId = id
    const next = { ...ws, lastAccessedAt: Date.now() }
    this.storage.saveWorkspace(next)
    this.emit('workspace-activated', next)
  }

  deactivate(): void {
    this.activeWorkspaceId = null
  }

  getActive(): Workspace | null {
    if (!this.activeWorkspaceId) return null
    return this.get(this.activeWorkspaceId)
  }
}