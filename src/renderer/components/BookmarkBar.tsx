import React from 'react'
import { useAppStore } from '../store/useAppStore'

export function BookmarkBar() {
  const { bookmarks, addToast, activeTabId } = useAppStore((s) => ({ bookmarks: s.bookmarks, addToast: s.addToast, activeTabId: s.activeTabId }))
  if (!bookmarks.length) return null
  return (
    <div className="h-8 flex items-center px-2 border-b border-gray-200 overflow-x-auto space-x-2">
      {bookmarks.map((b) => (
        <button
          key={b}
          className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 whitespace-nowrap"
          title={b}
          onClick={() => {
            if (!activeTabId) return
            window.electronAPI.tab.navigate(activeTabId, b).then(res => {
              if(res.ok) addToast('success','Opened bookmark'); else addToast('error', res.error?.message || 'Open failed')
            })
          }}
        >{b.replace(/^https?:\/\//,'')}</button>
      ))}
    </div>
  )
}