import { create } from "zustand";

export interface WorkspaceItem {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface TabItem {
  id: string;
  workspaceId: string;
  url?: string;
  title?: string;
  favicon?: string;
  active: boolean;
}

interface AppState {
  workspaces: WorkspaceItem[];
  activeWorkspaceId?: string;
  tabs: TabItem[];
  activeTabId?: string;
  setWorkspaces: (
    ws: WorkspaceItem[] | ((prev: WorkspaceItem[]) => WorkspaceItem[])
  ) => void;
  setActiveWorkspace: (id: string | undefined) => void;
  setTabs: (tabs: TabItem[]) => void;
  setActiveTab: (id: string | undefined) => void;
  addTab: (t: TabItem) => void;
  updateTab: (t: TabItem) => void;
  removeTab: (id: string) => void;
  reorderTabs: (ids: string[]) => void;
  toasts: { id: string; type: 'success'|'error'|'info'; message: string }[];
  addToast: (type: 'success'|'error'|'info', message: string) => void;
  removeToast: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  workspaces: [],
  tabs: [],
  setWorkspaces: (ws) =>
    set((s) => ({
      workspaces:
        typeof ws === "function"
          ? (ws as (prev: WorkspaceItem[]) => WorkspaceItem[])(s.workspaces)
          : ws,
    })),
  setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),
  setTabs: (tabs) => set({ tabs }),
  setActiveTab: (id) => set({ activeTabId: id }),
  addTab: (t) => set((s) => ({ tabs: [...s.tabs, t] })),
  updateTab: (t) =>
    set((s) => ({ tabs: s.tabs.map((x) => (x.id === t.id ? t : x)) })),
  removeTab: (id) => set((s) => ({ tabs: s.tabs.filter((x) => x.id !== id) })),
  reorderTabs: (ids) =>
    set((s) => ({
      tabs: ids
        .map((id) => s.tabs.find((x) => x.id === id))
        .filter(Boolean) as TabItem[],
    })),
  toasts: [],
  addToast: (type, message) =>
    set((s) => ({ toasts: [...s.toasts, { id: `${Date.now()}-${Math.random()}`, type, message }] })),
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));
