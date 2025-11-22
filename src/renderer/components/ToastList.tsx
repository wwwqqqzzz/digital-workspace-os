import React, { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

export function ToastList() {
  const { toasts, removeToast } = useAppStore()
  useEffect(() => {
    const timers = toasts.map(t => setTimeout(() => removeToast(t.id), 3500))
    return () => { timers.forEach(clearTimeout) }
  }, [toasts])
  return (
    <div className="fixed right-4 top-4 space-y-2 z-50">
      {toasts.map(t => (
        <div key={t.id} className={`rounded px-3 py-2 shadow text-white ${t.type==='success'?'bg-green-600':t.type==='error'?'bg-red-600':'bg-gray-800'}`}>{t.message}</div>
      ))}
    </div>
  )
}