import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <Navbar onToggleSidebar={() => setSidebarOpen(p => !p)} sidebarOpen={sidebarOpen} />
      <div className="flex flex-1 pt-16">
        <Sidebar open={sidebarOpen} />
        <main
          className="flex-1 transition-all duration-300"
          style={{ marginLeft: sidebarOpen ? '240px' : '0' }}
        >
          <div className="min-h-screen p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
