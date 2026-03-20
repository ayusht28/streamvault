import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Edit2, Trash2, Eye, Heart, MessageSquare,
  Upload, LayoutDashboard, TrendingUp, Video, X, Check, AlertTriangle
} from 'lucide-react'
import { videoAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { formatViews, timeAgo, formatSubscribers } from '../utils/helpers'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [stats, setStats] = useState({ totalViews: 0, totalLikes: 0, totalComments: 0 })

  useEffect(() => { fetchVideos() }, [])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const { data } = await videoAPI.getMyVideos()
      if (data.success) {
        setVideos(data.videos)
        const s = data.videos.reduce((acc, v) => ({
          totalViews: acc.totalViews + Number(v.views),
          totalLikes: acc.totalLikes + v.likes_count,
          totalComments: acc.totalComments + v.comments_count,
        }), { totalViews: 0, totalLikes: 0, totalComments: 0 })
        setStats(s)
      }
    } finally { setLoading(false) }
  }

  const handleEdit = async (id) => {
    if (!editTitle.trim()) return
    await videoAPI.update(id, { title: editTitle.trim() })
    setVideos(prev => prev.map(v => v.id === id ? { ...v, title: editTitle.trim() } : v))
    setEditingId(null)
  }

  const handleDelete = async (id) => {
    await videoAPI.delete(id)
    setVideos(prev => prev.filter(v => v.id !== id))
    setDeleteConfirm(null)
  }

  const STAT_CARDS = [
    { label: 'Total Views', value: formatViews(stats.totalViews), icon: Eye, color: '#22d3ee' },
    { label: 'Total Likes', value: formatViews(stats.totalLikes), icon: Heart, color: '#f472b6' },
    { label: 'Comments', value: formatViews(stats.totalComments), icon: MessageSquare, color: '#a78bfa' },
    { label: 'Subscribers', value: formatViews(user?.subscriber_count), icon: TrendingUp, color: '#34d399' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl gradient-text mb-1 flex items-center gap-3">
            <LayoutDashboard size={28} className="text-violet-400" />
            Creator Dashboard
          </h1>
          <p className="text-slate-500 text-sm">Manage your content and track performance</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/upload')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-body font-semibold"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            color: 'white',
            boxShadow: '0 0 20px rgba(139,92,246,0.3)',
          }}
        >
          <Upload size={15} /> Upload New
        </motion.button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {STAT_CARDS.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-2xl p-5"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-display text-slate-500 uppercase tracking-wider">{label}</p>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `${color}18` }}
              >
                <Icon size={15} style={{ color }} />
              </div>
            </div>
            <p className="font-display font-bold text-2xl text-white">{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Videos table */}
      <div
        className="rounded-3xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-display font-semibold text-white flex items-center gap-2">
            <Video size={17} className="text-violet-400" />
            Your Videos
            <span className="text-xs text-slate-600 font-body ml-1">({videos.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 skeleton rounded-xl" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Video size={40} className="text-slate-700 mb-4" />
            <p className="font-display font-semibold text-slate-400">No uploads yet</p>
            <p className="text-slate-600 text-sm mt-1 mb-6">Start sharing your content</p>
            <Link to="/upload"
              className="px-6 py-2.5 rounded-2xl text-sm font-body font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}
            >
              Upload first video
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            <AnimatePresence>
              {videos.map((video, i) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors group"
                >
                  {/* Thumbnail */}
                  <div className="w-28 flex-shrink-0 rounded-xl overflow-hidden"
                    style={{ aspectRatio: '16/9', background: 'var(--bg-elevated)' }}
                  >
                    {video.thumbnail_url ? (
                      <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play size={16} className="text-slate-700" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {editingId === video.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="flex-1 bg-transparent rounded-lg px-3 py-1.5 text-sm text-white font-body"
                          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-accent)' }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleEdit(video.id)
                            if (e.key === 'Escape') setEditingId(null)
                          }}
                          autoFocus
                        />
                        <button onClick={() => handleEdit(video.id)}
                          className="p-1.5 rounded-lg text-green-400 hover:bg-green-400/10 transition-colors">
                          <Check size={14} />
                        </button>
                        <button onClick={() => setEditingId(null)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-white/5 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <p className="font-display font-medium text-sm text-slate-200 line-clamp-1">
                        {video.title}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-600">
                      <span>{timeAgo(video.created_at)}</span>
                      <span className="flex items-center gap-1">
                        <Eye size={10} /> {formatViews(video.views)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart size={10} /> {video.likes_count}
                      </span>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-body hidden sm:block"
                    style={{
                      background: video.status === 'published' ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.1)',
                      color: video.status === 'published' ? '#34d399' : '#fbbf24',
                      border: `1px solid ${video.status === 'published' ? 'rgba(52,211,153,0.2)' : 'rgba(251,191,36,0.2)'}`,
                    }}
                  >
                    {video.status}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={`/watch/${video.id}`}
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all"
                      title="Watch"
                    >
                      <Play size={15} />
                    </Link>
                    <button
                      onClick={() => { setEditingId(video.id); setEditTitle(video.title) }}
                      className="p-2 rounded-xl text-slate-500 hover:text-violet-400 hover:bg-violet-400/10 transition-all"
                      title="Edit"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(video.id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="rounded-3xl p-6 max-w-sm w-full"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid rgba(239,68,68,0.2)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                  <AlertTriangle size={18} className="text-red-400" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-white">Delete video?</h3>
                  <p className="text-xs text-slate-500">This action cannot be undone</p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-body text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  style={{ border: '1px solid var(--border)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-body font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
