import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Flame, PlaySquare, Users, Heart, History, Settings, TrendingUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { icon: Home, label: 'Home', to: '/', end: true },
  { icon: Flame, label: 'Trending', to: '/?sort=trending' },
  { icon: TrendingUp, label: 'Popular', to: '/?sort=popular' },
]

const USER_ITEMS = [
  { icon: PlaySquare, label: 'Your Videos', to: '/dashboard' },
  { icon: Users, label: 'Subscriptions', to: '/subscriptions' },
  { icon: Heart, label: 'Liked Videos', to: '/?liked=true' },
  { icon: History, label: 'History', to: '/?history=true' },
]

export default function Sidebar({ open }) {
  const { user } = useAuth()

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: -240, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -240, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed left-0 top-16 bottom-0 w-60 z-40 overflow-y-auto py-4 px-3 flex flex-col gap-1"
          style={{
            background: 'rgba(3,4,10,0.9)',
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <Section label="Discover">
            {NAV_ITEMS.map((item) => (
              <SidebarLink key={item.to} {...item} />
            ))}
          </Section>

          {user && (
            <Section label="Library">
              {USER_ITEMS.map((item) => (
                <SidebarLink key={item.to} {...item} />
              ))}
            </Section>
          )}

          {/* Bottom */}
          <div className="mt-auto pt-4 border-t border-white/5">
            <p className="text-xs text-slate-700 px-3 mb-2 font-mono">StreamVault v1.0</p>
            <p className="text-xs text-slate-800 px-3">© 2025 StreamVault</p>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

function Section({ label, children }) {
  return (
    <div className="mb-2">
      <p className="text-xs font-display font-semibold text-slate-600 uppercase tracking-widest px-3 mb-1.5">
        {label}
      </p>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  )
}

function SidebarLink({ icon: Icon, label, to, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body transition-all duration-200 ${
          isActive
            ? 'text-white font-medium'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
        }`
      }
      style={({ isActive }) => isActive ? {
        background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.10))',
        boxShadow: 'inset 0 0 0 1px rgba(139,92,246,0.2)',
      } : {}}
    >
      {({ isActive }) => (
        <>
          <Icon
            size={17}
            className={isActive ? 'text-violet-400' : 'text-slate-600'}
          />
          {label}
          {isActive && (
            <motion.div
              layoutId="sidebar-indicator"
              className="ml-auto w-1 h-4 rounded-full bg-violet-500"
            />
          )}
        </>
      )}
    </NavLink>
  )
}
