import Database from 'better-sqlite3'
import path from 'node:path'
import { app } from 'electron'
import { Workspace, Tab } from '../models/Workspace'

export class StorageManager {
  private db: Database.Database

  constructor() {
    const dbPath = path.join(app.getPath('userData'), 'workspace.db')
    this.db = new Database(dbPath)
    this.initDatabase()
  }

  initDatabase() {
    this.db.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS workspaces (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT,
        color TEXT,
        partition TEXT NOT NULL,
        settings_json TEXT,
        created_at INTEGER NOT NULL,
        last_accessed_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_workspaces_last_accessed_at ON workspaces(last_accessed_at);

      CREATE TABLE IF NOT EXISTS tabs (
        id TEXT PRIMARY KEY,
        workspace_id TEXT NOT NULL,
        url TEXT NOT NULL,
        title TEXT,
        favicon TEXT,
        active INTEGER NOT NULL,
        suspended INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        last_accessed_at INTEGER NOT NULL,
        FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_tabs_workspace_id ON tabs(workspace_id);
      CREATE INDEX IF NOT EXISTS idx_tabs_active ON tabs(active);

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `)
  }

  saveWorkspace(workspace: Workspace) {
    const stmt = this.db.prepare(`
      INSERT INTO workspaces(id,name,icon,color,partition,settings_json,created_at,last_accessed_at)
      VALUES(@id,@name,@icon,@color,@partition,@settings_json,@created_at,@last_accessed_at)
      ON CONFLICT(id) DO UPDATE SET
        name=excluded.name,
        icon=excluded.icon,
        color=excluded.color,
        partition=excluded.partition,
        settings_json=excluded.settings_json,
        created_at=excluded.created_at,
        last_accessed_at=excluded.last_accessed_at
    `)
    stmt.run({
      id: workspace.id,
      name: workspace.name,
      icon: workspace.icon ?? null,
      color: workspace.color ?? null,
      partition: workspace.partition,
      settings_json: workspace.settings ? JSON.stringify(workspace.settings) : null,
      created_at: workspace.createdAt,
      last_accessed_at: workspace.lastAccessedAt
    })
  }

  setSetting(key: string, value: unknown) {
    const stmt = this.db.prepare(`INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`)
    stmt.run(key, JSON.stringify(value))
  }

  getSetting<T = unknown>(key: string): T | undefined {
    const row = this.db.prepare(`SELECT value FROM settings WHERE key = ?`).get(key) as any
    if (!row) return undefined
    try { return JSON.parse(row.value) as T } catch { return undefined }
  }

  listBookmarks(workspaceId: string): string[] {
    const key = `bookmarks:${workspaceId}`
    return (this.getSetting<string[]>(key) ?? [])
  }

  addBookmark(workspaceId: string, url: string) {
    const key = `bookmarks:${workspaceId}`
    const list = this.listBookmarks(workspaceId).filter(u => u !== url)
    list.unshift(url)
    this.setSetting(key, list.slice(0, 100))
  }

  removeBookmark(workspaceId: string, url: string) {
    const key = `bookmarks:${workspaceId}`
    const list = this.listBookmarks(workspaceId).filter(u => u !== url)
    this.setSetting(key, list)
  }

  loadWorkspace(id: string): Workspace | null {
    const row: any = this.db.prepare(`SELECT * FROM workspaces WHERE id = ?`).get(id)
    if (!row) return null
    return {
      id: row.id,
      name: row.name,
      icon: row.icon ?? undefined,
      color: row.color ?? undefined,
      partition: row.partition,
      settings: row.settings_json ? JSON.parse(row.settings_json) : undefined,
      createdAt: row.created_at,
      lastAccessedAt: row.last_accessed_at
    }
  }

  loadAllWorkspaces(): Workspace[] {
    const rows = this.db.prepare(`SELECT * FROM workspaces ORDER BY last_accessed_at DESC`).all()
    return rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      icon: row.icon ?? undefined,
      color: row.color ?? undefined,
      partition: row.partition,
      settings: row.settings_json ? JSON.parse(row.settings_json) : undefined,
      createdAt: row.created_at,
      lastAccessedAt: row.last_accessed_at
    }))
  }

  deleteWorkspace(id: string) {
    this.db.prepare(`DELETE FROM workspaces WHERE id = ?`).run(id)
  }

  saveTabs(workspaceId: string, tabs: Tab[]) {
    const insert = this.db.prepare(`
      INSERT INTO tabs(id,workspace_id,url,title,favicon,active,suspended,created_at,last_accessed_at)
      VALUES(@id,@workspace_id,@url,@title,@favicon,@active,@suspended,@created_at,@last_accessed_at)
      ON CONFLICT(id) DO UPDATE SET
        workspace_id=excluded.workspace_id,
        url=excluded.url,
        title=excluded.title,
        favicon=excluded.favicon,
        active=excluded.active,
        suspended=excluded.suspended,
        created_at=excluded.created_at,
        last_accessed_at=excluded.last_accessed_at
    `)
    const delOthers = this.db.prepare(`DELETE FROM tabs WHERE workspace_id = ? AND id NOT IN (${tabs.map(() => '?').join(',') || "''"})`)
    const trx = this.db.transaction(() => {
      for (const t of tabs) {
        insert.run({
          id: t.id,
          workspace_id: workspaceId,
          url: t.url,
          title: t.title ?? null,
          favicon: t.favicon ?? null,
          active: t.active ? 1 : 0,
          suspended: t.suspended ? 1 : 0,
          created_at: t.createdAt,
          last_accessed_at: t.lastAccessedAt
        })
      }
      if (tabs.length > 0) {
        delOthers.run(workspaceId, ...tabs.map(t => t.id))
      } else {
        this.db.prepare(`DELETE FROM tabs WHERE workspace_id = ?`).run(workspaceId)
      }
    })
    trx()
  }

  loadTabs(workspaceId: string): Tab[] {
    const rows = this.db.prepare(`SELECT * FROM tabs WHERE workspace_id = ? ORDER BY last_accessed_at DESC`).all(workspaceId)
    return rows.map((row: any) => ({
      id: row.id,
      workspaceId: row.workspace_id,
      url: row.url,
      title: row.title ?? undefined,
      favicon: row.favicon ?? undefined,
      active: !!row.active,
      suspended: !!row.suspended,
      createdAt: row.created_at,
      lastAccessedAt: row.last_accessed_at
    }))
  }
}