import React from 'react'
import { TabBar } from './TabBar'
import { AddressBar } from './AddressBar'
import { BookmarkBar } from './BookmarkBar'
import { WebViewContainer } from './WebViewContainer'

export function MainContent() {
  return (
    <div className="flex-1 flex flex-col">
      <TabBar />
      <AddressBar />
      <BookmarkBar />
      <WebViewContainer />
    </div>
  )
}