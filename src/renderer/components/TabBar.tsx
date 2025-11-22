import React from 'react'
import { useAppStore } from '../store/useAppStore'

export function TabBar() {
  const { tabs, activeTabId } = useAppStore()
  return (
    <div className="flex items-center h-10 border-b border-gray-200 px-2 space-x-2">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => window.electronAPI.tab.activate(t.id)}
          className={`px-2 py-1 rounded ${activeTabId===t.id?'bg-blue-100':'hover:bg-gray-100'}`}
        >
          <span className="mr-2">{t.favicon ? <img src={t.favicon} className="w-4 h-4"/> : '🌐'}</span>
          <span>{t.title ?? 'Tab'}</span>
        </button>
      ))}
      <button className="ml-auto bg-blue-600 text-white px-2 py-1 rounded" onClick={() => window.electronAPI.tab.create('https://example.com')}>+ New Tab</button>
    </div>
  )
}