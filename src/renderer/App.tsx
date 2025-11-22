import React, { useEffect } from 'react'
import { useAppStore } from './store/useAppStore'
import { Sidebar } from './components/Sidebar'
import { MainContent } from './components/MainContent'

export function App() {
  const { setWorkspaces, setActiveWorkspace, setTabs, setActiveTab } = useAppStore()

  useEffect(() => {
    window.electronAPI.workspace.list().then(res => {
      if (res.ok && Array.isArray(res.data)) {
        const ws = res.data.map((w: any) => ({ id: w.id, name: w.name, icon: w.icon, color: w.color }))
        setWorkspaces(ws)
        if (ws.length > 0) setActiveWorkspace(ws[0].id)
      }
    })
    window.electronAPI.onWorkspaceEvent?.(e => {
      if (e.type === 'activated') setActiveWorkspace(e.payload.id)
    })
    window.electronAPI.onTabEvent?.(e => {
      if (e.type === 'created' || e.type === 'updated' || e.type === 'reordered') {
        // Renderer状态为展示用途，真实数据由主进程维护
      }
      if (e.type === 'activated') setActiveTab(e.payload.id)
      if (e.type === 'closed') setActiveTab(undefined)
    })
  }, [])

  return (
    <div className="flex h-screen">
      <Sidebar />
      <MainContent />
    </div>
  )
}