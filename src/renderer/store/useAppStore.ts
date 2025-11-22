import { create } from 'zustand'

export interface WorkspaceItem {
  id: string
  name: string
  icon?: string
  color?: string
}

export interface TabItem {
  id: string
  workspaceId: string
  title?: string
  favicon?: string
  active: boolean
}

interface AppState {
  workspaces: WorkspaceItem[]
  activeWorkspaceId?: string
  tabs: TabItem[]
  activeTabId?: string
  setWorkspaces: (ws: WorkspaceItem[]) => void
  setActiveWorkspace: (id: string | undefined) => void
  setTabs: (tabs: TabItem[]) => void
  setActiveTab: (id: string | undefined) => void
}

export const useAppStore = create<AppState>((set) => ({
  workspaces: [],
  tabs: [],
  setWorkspaces: (ws) => set({ workspaces: ws }),
  setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),
  setTabs: (tabs) => set({ tabs }),
  setActiveTab: (id) => set({ activeTabId: id })
}))