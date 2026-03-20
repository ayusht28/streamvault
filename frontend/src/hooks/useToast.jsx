import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

// Singleton store
let toastQueue = []
let setToastsExternal = null

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}
const COLORS = {
  success: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', icon: '#10b981' },
  error:   { bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)',  icon: '#ef4444' },
  info:    { bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)', icon: '#8b5cf6' },
}

export function toast(message, type = 'info') {
  const id = Date.now()
  const newToast = { id, message, type }
  toastQueue = [...toastQueue, newToast]
  if (setToastsExternal) setToastsExternal([...toastQueue])
  setTimeout(() => {
    toastQueue = toastQueue.filter(t => t.id !== id)
    if (setToastsExternal) setToastsExternal([...toastQueue])
  }, 4000)
}
toast.success = (msg) => toast(msg, 'success')
toast.error   = (msg) => toast(msg, 'error')
toast.info    = (msg) => toast(msg, 'info')

export function ToastContainer() {
  const [toasts, setToasts] = useState([])
  setToastsExternal = setToasts

  const remove = (id) => {
    toastQueue = toastQueue.filter(t => t.id !== id)
    setToasts([...toastQueue])
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence>
        {toasts.map(({ id, message, type }) => {
          const Icon = ICONS[type]
          const c = COLORS[type]
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, x: 40, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl max-w-sm shadow-card-hover"
              style={{
                background: c.bg,
                border: `1px solid ${c.border}`,
                backdropFilter: 'blur(20px)',
              }}
            >
              <Icon size={16} style={{ color: c.icon, flexShrink: 0 }} />
              <p className="text-sm text-slate-200 font-body">{message}</p>
              <button
                onClick={() => remove(id)}
                className="ml-1 text-slate-500 hover:text-white transition-colors flex-shrink-0"
              >
                <X size={14} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export function useToast() {
  return toast
}
