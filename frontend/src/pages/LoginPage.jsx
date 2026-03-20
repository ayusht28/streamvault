import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, AlertCircle, Zap, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return setError('Please fill in all fields')
    setLoading(true)
    setError('')
    try {
      const data = await login(form.email, form.password)
      if (data.success) navigate(from, { replace: true })
      else setError(data.message || 'Login failed')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Background glows */}
      <div className="absolute pointer-events-none">
        <div
          className="absolute w-[600px] h-[600px] rounded-full -top-48 -left-48 opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.4), transparent 70%)' }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full -bottom-32 -right-32 opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.3), transparent 70%)' }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', boxShadow: '0 0 24px rgba(139,92,246,0.5)' }}
            >
              <Zap size={22} className="text-white" fill="white" />
            </div>
            <span className="font-display font-extrabold text-2xl gradient-text">StreamVault</span>
          </Link>
          <h1 className="font-display font-bold text-3xl text-white mb-2">Welcome back</h1>
          <p className="text-slate-500 text-sm">Sign in to continue your journey</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl p-8"
          style={{
            background: 'rgba(8,12,24,0.9)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(24px)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <InputField
              id="email"
              label="Email address"
              type="email"
              value={form.email}
              onChange={(v) => setForm(p => ({ ...p, email: v }))}
              placeholder="you@example.com"
              icon={Mail}
              focused={focused === 'email'}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
            />

            {/* Password */}
            <InputField
              id="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(v) => setForm(p => ({ ...p, password: v }))}
              placeholder="Enter your password"
              icon={Lock}
              focused={focused === 'password'}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
              rightAction={
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm text-red-400"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)' }}
                >
                  <AlertCircle size={15} className="flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-2xl text-base font-display font-semibold text-white flex items-center justify-center gap-2 transition-all mt-2"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                boxShadow: '0 0 24px rgba(139,92,246,0.4)',
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Signing in…</>
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-slate-700">or</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
            >
              Create one free
            </Link>
          </p>
        </motion.div>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link to="/" className="text-xs text-slate-700 hover:text-slate-500 transition-colors">
            ← Back to StreamVault
          </Link>
        </div>
      </div>
    </div>
  )
}

function InputField({ id, label, type, value, onChange, placeholder, icon: Icon, focused, onFocus, onBlur, rightAction }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-display font-semibold uppercase tracking-wider mb-2"
        style={{ color: focused ? '#a78bfa' : 'var(--text-muted)' }}
      >
        {label}
      </label>
      <div
        className="relative flex items-center rounded-xl transition-all duration-200"
        style={{
          background: 'var(--bg-elevated)',
          border: `1px solid ${focused ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.06)'}`,
          boxShadow: focused ? '0 0 0 3px rgba(139,92,246,0.08)' : 'none',
        }}
      >
        <Icon size={15} className="absolute left-4 flex-shrink-0" style={{ color: focused ? '#a78bfa' : 'var(--text-muted)' }} />
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={onFocus}
          onBlur={onBlur}
          className="w-full bg-transparent py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-700 font-body"
        />
        {rightAction && (
          <div className="absolute right-4">{rightAction}</div>
        )}
      </div>
    </div>
  )
}
