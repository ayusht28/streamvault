import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Flame, TrendingUp, RefreshCw } from 'lucide-react'
import VideoGrid from '../components/VideoGrid'
import { videoAPI } from '../services/api'

const TABS = [
  { id: 'latest', label: 'Latest', icon: Sparkles },
  { id: 'trending', label: 'Trending', icon: Flame },
  { id: 'popular', label: 'Popular', icon: TrendingUp },
]

export default function HomePage() {
  const [searchParams] = useSearchParams()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [sort, setSort] = useState(searchParams.get('sort') || 'latest')

  const fetchVideos = useCallback(async (pg = 1, s = sort, reset = false) => {
    try {
      if (pg === 1) setLoading(true)
      const { data } = await videoAPI.getAll({ page: pg, limit: 20, sort: s })
      if (data.success) {
        setVideos(prev => reset || pg === 1 ? data.videos : [...prev, ...data.videos])
        setHasMore(pg < data.pagination.pages)
        setPage(pg)
      }
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [sort])

  useEffect(() => { fetchVideos(1, sort, true) }, [sort])

  const handleSortChange = (s) => {
    setSort(s)
    setPage(1)
  }

  return (
    <div>
      {/* Hero gradient strip */}
      <div
        className="relative rounded-3xl overflow-hidden mb-8 p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(99,102,241,0.08) 50%, rgba(34,211,238,0.06) 100%)',
          border: '1px solid rgba(139,92,246,0.15)',
        }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(139,92,246,0.15), transparent)',
          }}
        />
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display font-bold text-3xl gradient-text mb-1"
        >
          Discover Videos
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 text-sm"
        >
          Watch, upload, and connect with creators worldwide
        </motion.p>
      </div>

      {/* Sort Tabs */}
      <div className="flex items-center gap-2 mb-8 flex-wrap">
        {TABS.map(({ id, label, icon: Icon }) => (
          <motion.button
            key={id}
            onClick={() => handleSortChange(id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-2 rounded-2xl text-sm font-body font-medium transition-all"
            style={sort === id ? {
              background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(99,102,241,0.18))',
              border: '1px solid rgba(139,92,246,0.4)',
              color: '#c4b5fd',
            } : {
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            <Icon size={14} className={sort === id ? 'text-violet-400' : 'text-slate-600'} />
            {label}
          </motion.button>
        ))}
        <button
          onClick={() => fetchVideos(1, sort, true)}
          className="ml-auto p-2 rounded-xl text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-colors"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <VideoGrid videos={videos} loading={loading} />

      {/* Load more */}
      {hasMore && !loading && (
        <div className="flex justify-center mt-10">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => fetchVideos(page + 1, sort)}
            className="px-8 py-3 rounded-2xl text-sm font-body font-medium text-slate-300 transition-all"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
            }}
          >
            Load more videos
          </motion.button>
        </div>
      )}
    </div>
  )
}
