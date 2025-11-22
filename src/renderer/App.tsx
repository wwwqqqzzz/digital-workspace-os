import React, { useEffect } from 'react'
import { useAppStore } from './store/useAppStore'
import { Sidebar } from './components/Sidebar'
import { MainContent } from './components/MainContent'

export function App() {
  const { setWorkspaces, setActiveWorkspace, setTabs, setActiveTab, addTab, updateTab, removeTab, reorderTabs } = useAppStore()

  useEffect(() => {
    if (window.electronAPI?.workspace?.list) {
      window.electronAPI.workspace.list().then(res => {
        if (res.ok && Array.isArray(res.data)) {
          const ws = res.data.map((w: any) => ({ id: w.id, name: w.name, icon: w.icon, color: w.color }))
        setWorkspaces(ws)
        if (ws.length > 0) {
          setActiveWorkspace(ws[0].id)
          window.electronAPI.tab.list(ws[0].id).then(tres => {
            if (tres.ok && Array.isArray(tres.data)) {
              const tabs = tres.data.map((t: any) => ({ id: t.id, workspaceId: t.workspaceId, title: t.title, favicon: t.favicon, active: t.active }))
              setTabs(tabs)
              const active = tabs.find(x => x.active)
              if (active) setActiveTab(active.id)
            }
          })
        }
      }
    })
  }
  window.electronAPI?.onWorkspaceEvent?.(e => {
    if (e.type === 'activated') setActiveWorkspace(e.payload.id)
    window.electronAPI.tab.list(e.payload.id).then(tres => {
      if (tres.ok && Array.isArray(tres.data)) {
        const tabs = tres.data.map((t: any) => ({ id: t.id, workspaceId: t.workspaceId, title: t.title, favicon: t.favicon, active: t.active }))
        setTabs(tabs)
        const active = tabs.find(x => x.active)
        setActiveTab(active?.id)
      }
    })
  })
  window.electronAPI?.onTabEvent?.(e => {
      if (e.type === 'created') addTab({ id: e.payload.id, workspaceId: e.payload.workspaceId, title: e.payload.title, favicon: e.payload.favicon, active: e.payload.active })
      if (e.type === 'updated') updateTab({ id: e.payload.id, workspaceId: e.payload.workspaceId, title: e.payload.title, favicon: e.payload.favicon, active: e.payload.active })
      if (e.type === 'reordered') reorderTabs(e.payload.map((t: any) => t.id))
      if (e.type === 'activated') setActiveTab(e.payload.id)
      if (e.type === 'closed') removeTab(e.payload.id)
  })
  }, [])

  return (
    <div className="flex h-screen">
      <Sidebar />
      <MainContent />
    </div>
  )
}