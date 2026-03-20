import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Upload, Bell, Menu, LogOut, User, LayoutDashboard, ChevronDown, Zap, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getAvatarUrl } from '../utils/helpers'

export default function Navbar({ onToggleSidebar, sidebarOpen }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const profileRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-4 gap-4"
      style={{
        background: 'rgba(3,4,10,0.85)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo + Burger */}
      <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors text-slate-400 hover:text-white"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center shadow-glow">
            <Zap size={16} className="text-white" fill="white" />
          </div>
          <span className="font-display font-800 text-lg tracking-tight gradient-text hidden sm:block">
            StreamVault
          </span>
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto">
        <div className={`relative flex items-center rounded-2xl transition-all duration-300 ${
          searchFocused
            ? 'ring-1 ring-violet-500/50 shadow-glow'
            : 'ring-1 ring-white/5'
        }`}
          style={{ background: 'rgba(13,18,37,0.9)' }}
        >
          <Search size={16} className="absolute left-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search videos, channels..."
            className="w-full bg-transparent py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 font-body"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 p-1 rounded-full hover:bg-white/10 text-slate-500"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </form>

      {/* Right actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {user ? (
          <>
            {/* Upload */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/upload')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-body font-medium transition-all"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                color: 'white',
                boxShadow: '0 0 16px rgba(139,92,246,0.3)',
              }}
            >
              <Upload size={15} />
              <span>Upload</span>
            </motion.button>

            {/* Notifications */}
            <button className="relative p-2.5 rounded-xl hover:bg-white/5 transition-colors text-slate-400 hover:text-white">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full" />
            </button>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(p => !p)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/5 transition-colors"
              >
                <img
                  src={getAvatarUrl(user.avatar, user.username)}
                  alt={user.username}
                  className="w-8 h-8 rounded-xl object-cover ring-2 ring-violet-500/30"
                />
                <ChevronDown size={14} className={`text-slate-400 transition-transform hidden sm:block ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 rounded-2xl overflow-hidden z-50"
                    style={{
                      background: 'rgba(8,12,24,0.98)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                      backdropFilter: 'blur(24px)',
                    }}
                  >
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="font-display font-semibold text-sm text-white">{user.username}</p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{user.email}</p>
                    </div>
                    <div className="p-1.5">
                      {[
                        { icon: LayoutDashboard, label: 'My Dashboard', to: '/dashboard' },
                        { icon: User, label: 'My Channel', to: `/channel/${user.id}` },
                        { icon: Upload, label: 'Upload Video', to: '/upload' },
                      ].map(({ icon: Icon, label, to }) => (
                        <Link
                          key={label}
                          to={to}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Icon size={15} className="text-slate-500" />
                          {label}
                        </Link>
                      ))}
                      <div className="border-t border-white/5 mt-1.5 pt-1.5">
                        <button
                          onClick={() => { logout(); setProfileOpen(false) }}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full transition-colors"
                        >
                          <LogOut size={15} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-sm font-body text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-xl text-sm font-body font-medium transition-all"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                color: 'white',
              }}
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
