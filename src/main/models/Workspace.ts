export interface WorkspaceSettings {
  autoSuspendTabs: boolean
  suspendAfterMinutes: number
}

export interface TabState {
  suspended: boolean
}

export interface Tab {
  id: string
  workspaceId: string
  url: string
  title?: string
  favicon?: string
  active: boolean
  suspended: boolean
  createdAt: number
  lastAccessedAt: number
}

export interface Workspace {
  id: string
  name: string
  icon?: string
  color?: string
  partition: string
  tabs?: Tab[]
  settings?: WorkspaceSettings
  createdAt: number
  lastAccessedAt: number
}