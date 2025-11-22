import React from 'react'
import { TabBar } from './TabBar'
import { WebViewContainer } from './WebViewContainer'

export function MainContent() {
  return (
    <div className="flex-1 flex flex-col">
      <TabBar />
      <WebViewContainer />
    </div>
  )
}