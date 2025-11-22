import React, { useEffect, useRef } from 'react'

export function WebViewContainer() {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const sendBounds = () => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      window.electronAPI.ui?.setContentBounds?.({ x: Math.round(rect.left), y: Math.round(rect.top), width: Math.round(rect.width), height: Math.round(rect.height) })
    }
    sendBounds()
    const onResize = () => sendBounds()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return (
    <div ref={ref} id="webview-container" className="flex-1 flex items-center justify-center text-gray-500">WebView will be displayed here</div>
  )
}