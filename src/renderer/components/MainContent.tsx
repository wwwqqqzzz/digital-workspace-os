import React from 'react'
import { TabBar } from './TabBar'
import { AddressBar } from './AddressBar'
import { WebViewContainer } from './WebViewContainer'

export function MainContent() {
  return (
    <div className="flex-1 flex flex-col">
      <TabBar />
      <AddressBar />
      <WebViewContainer />
    </div>
  )
}