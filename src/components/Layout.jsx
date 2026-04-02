import React from 'react'
import Sidebar from './Sidebar'
import TimelineBar from './TimelineBar'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-stadium">
      <Sidebar />
      <div className="flex-1 ml-[220px]">
        <TimelineBar />
        <main className="pt-0 px-8 pb-8 max-w-[960px]">
          {children}
        </main>
      </div>
    </div>
  )
}
