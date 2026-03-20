import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, Lock, Eye, EyeOff, User, AlertCircle,
  Zap, ArrowRight, Loader2, CheckCircle2
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const PASSWORD_RULES = [
  { id: 'length', label: 'At least 6 characters', test: (p) => p.length >= 6 },
  { id: 'uppercase', label: 'Contains uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { id: 'number', label: 'Contains a number', test: (p) => /\d/.test(p) },
]

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState(null)

  const passwordStrength = PASSWORD_RULES.filter(r => r.test(form.password)).length
  const strengthColors = ['', '#ef4444', '#f97316', '#22d3ee', '#10b981']
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.email || !form.password) return setError('Please fill in all fields')
    if (form.username.length < 3) return setError('Username must be at least 3 characters')
    if (form.password.length < 6) return setError('Password must be at least 6 characters')
    if (form.password !== form.confirmPassword) return setError('Passwords do not match')

    setLoading(true)
    setError('')
    try {
      const data = await register(form.username, form.email, form.password)
      if (data.success) navigate('/')
      else setError(data.message || 'Registration failed')
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
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-[500px] h-[500px] rounded-full -top-32 -right-32 opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.5), transparent 70%)' }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full -bottom-24 -left-24 opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.5), transparent 70%)' }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center gap-3 mb-5">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', boxShadow: '0 0 20px rgba(139,92,246,0.5)' }}
            >
              <Zap size={20} className="text-white" fill="white" />
            </div>
            <span className="font-display font-extrabold text-xl gradient-text">StreamVault</span>
          </Link>
          <h1 className="font-display font-bold text-3xl text-white mb-1.5">Create your account</h1>
          <p className="text-slate-500 text-sm">Join thousands of creators and viewers</p>
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <Field
              label="Username"
              type="text"
              value={form.username}
              onChange={(v) => setForm(p => ({ ...p, username: v }))}
              placeholder="your_username"
              icon={User}
              focused={focused === 'username'}
              onFocus={() => setFocused('username')}
              onBlur={() => setFocused(null)}
              hint={form.username && form.username.length < 3 ? 'At least 3 characters' : ''}
            />

            {/* Email */}
            <Field
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
            <div>
              <Field
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(v) => setForm(p => ({ ...p, password: v }))}
                placeholder="Create a strong password"
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
              {/* Strength bar */}
              {form.password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2.5"
                >
                  <div className="flex gap-1 mb-1.5">
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{
                          background: i <= passwordStrength
                            ? strengthColors[passwordStrength]
                            : 'var(--bg-elevated)',
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {PASSWORD_RULES.map(rule => (
                        <span
                          key={rule.id}
                          className="text-xs flex items-center gap-1 transition-colors"
                          style={{ color: rule.test(form.password) ? '#10b981' : 'var(--text-muted)' }}
                        >
                          <CheckCircle2 size={10} />
                          {rule.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Confirm password */}
            <Field
              label="Confirm password"
              type={showPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={(v) => setForm(p => ({ ...p, confirmPassword: v }))}
              placeholder="Repeat your password"
              icon={Lock}
              focused={focused === 'confirm'}
              onFocus={() => setFocused('confirm')}
              onBlur={() => setFocused(null)}
              valid={form.confirmPassword && form.password === form.confirmPassword}
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
              className="w-full py-3.5 rounded-2xl text-base font-display font-semibold text-white flex items-center justify-center gap-2 mt-2"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                boxShadow: '0 0 24px rgba(139,92,246,0.4)',
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Creating account…</>
              ) : (
                <>Create Account <ArrowRight size={16} /></>
              )}
            </motion.button>
          </form>

          {/* Terms */}
          <p className="text-xs text-slate-700 text-center mt-4">
            By creating an account, you agree to our{' '}
            <span className="text-slate-600 cursor-pointer hover:text-slate-500">Terms of Service</span>
            {' '}and{' '}
            <span className="text-slate-600 cursor-pointer hover:text-slate-500">Privacy Policy</span>
          </p>

          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-slate-700">or</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>

        <div className="text-center mt-6">
          <Link to="/" className="text-xs text-slate-700 hover:text-slate-500 transition-colors">
            ← Back to StreamVault
          </Link>
        </div>
      </div>
    </div>
  )
}

function Field({ label, type, value, onChange, placeholder, icon: Icon, focused, onFocus, onBlur, rightAction, hint, valid }) {
  return (
    <div>
      <label
        className="block text-xs font-display font-semibold uppercase tracking-wider mb-2"
        style={{ color: focused ? '#a78bfa' : 'var(--text-muted)' }}
      >
        {label}
      </label>
      <div
        className="relative flex items-center rounded-xl transition-all duration-200"
        style={{
          background: 'var(--bg-elevated)',
          border: `1px solid ${focused ? 'rgba(139,92,246,0.5)' : valid ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.06)'}`,
          boxShadow: focused ? '0 0 0 3px rgba(139,92,246,0.08)' : valid ? '0 0 0 3px rgba(16,185,129,0.05)' : 'none',
        }}
      >
        <Icon size={15} className="absolute left-4" style={{ color: focused ? '#a78bfa' : valid ? '#10b981' : 'var(--text-muted)' }} />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={onFocus}
          onBlur={onBlur}
          className="w-full bg-transparent py-3.5 pl-11 pr-10 text-sm text-white placeholder-slate-700 font-body"
        />
        <div className="absolute right-4 flex items-center gap-2">
          {valid && <CheckCircle2 size={15} className="text-emerald-400" />}
          {rightAction}
        </div>
      </div>
      {hint && <p className="text-xs text-slate-600 mt-1 pl-1">{hint}</p>}
    </div>
  )
}
