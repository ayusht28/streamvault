import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, X, TrendingUp, Clock, Eye } from 'lucide-react'
import { videoAPI } from '../services/api'
import VideoCard, { VideoCardSkeleton } from '../components/VideoCard'

const SORT_OPTIONS = [
  { id: 'views', label: 'Most Viewed', icon: Eye },
  { id: 'latest', label: 'Latest', icon: Clock },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
]

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [sort, setSort] = useState('views')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [inputValue, setInputValue] = useState(query)

  useEffect(() => {
    setInputValue(query)
    if (query) {
      setPage(1)
      fetchResults(query, sort, 1, true)
    } else {
      setResults([])
    }
  }, [query])

  const fetchResults = useCallback(async (q, s, pg, reset = false) => {
    if (!q.trim()) return
    setLoading(true)
    try {
      const { data } = await videoAPI.search({ q, page: pg, limit: 20 })
      if (data.success) {
        setResults(prev => reset ? data.videos : [...prev, ...data.videos])
        setPagination(data.pagination)
        setPage(pg)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (inputValue.trim()) setSearchParams({ q: inputValue.trim() })
  }

  const sortedResults = [...results].sort((a, b) => {
    if (sort === 'views') return Number(b.views) - Number(a.views)
    if (sort === 'latest') return new Date(b.created_at) - new Date(a.created_at)
    if (sort === 'trending') return b.likes_count - a.likes_count
    return 0
  })

  return (
    <div>
      <div className="mb-8 max-w-2xl">
        <form onSubmit={handleSearch} className="relative flex items-center rounded-2xl overflow-hidden ring-1 ring-violet-500/30" style={{ background: 'var(--bg-card)' }}>
          <Search size={18} className="absolute left-5 text-violet-400 pointer-events-none" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search for anything..."
            className="w-full bg-transparent py-4 pl-12 pr-4 text-base text-slate-200 placeholder-slate-600 font-body"
          />
          {inputValue && (
            <button type="button" onClick={() => { setInputValue(''); setResults([]) }} className="px-3 text-slate-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          )}
          <button type="submit" className="px-5 py-4 font-body font-semibold text-white text-sm flex-shrink-0" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
            Search
          </button>
        </form>
      </div>

      {query && (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="font-display font-semibold text-white text-lg">
            {loading ? 'Searching...' : pagination ? (
              <span><span className="text-violet-400">{pagination.total}</span> results for <span className="gradient-text">"{query}"</span></span>
            ) : 'No results'}
          </h2>
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal size={14} className="text-slate-600 mr-1" />
            {SORT_OPTIONS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setSort(id)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-body font-medium transition-all"
                style={sort === id ? { background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', color: '#c4b5fd' } : { background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              >
                <Icon size={12} />{label}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && results.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <VideoCardSkeleton key={i} />)}
        </div>
      ) : sortedResults.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedResults.map((video, i) => <VideoCard key={video.id} video={video} index={i} />)}
          </div>
          {pagination && page < pagination.pages && (
            <div className="flex justify-center mt-10">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => fetchResults(query, sort, page + 1)}
                className="px-8 py-3 rounded-2xl text-sm font-body font-medium text-slate-300"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >Load more</motion.button>
            </div>
          )}
        </>
      ) : query && !loading ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-28 text-center">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <Search size={36} className="text-slate-700" />
          </div>
          <h3 className="font-display font-bold text-xl text-slate-400 mb-2">No results found</h3>
          <p className="text-slate-600 text-sm max-w-sm">Nothing for <span className="text-slate-400">"{query}"</span>. Try different keywords.</p>
          <Link to="/" className="mt-6 px-6 py-2.5 rounded-2xl text-sm font-body font-semibold text-white" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
            Browse videos
          </Link>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-28 text-center">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.10))', border: '1px solid rgba(139,92,246,0.2)' }}>
            <Search size={36} className="text-violet-400" />
          </div>
          <h3 className="font-display font-bold text-xl text-white mb-2">Search StreamVault</h3>
          <p className="text-slate-600 text-sm">Find videos, channels, and creators</p>
        </motion.div>
      )}
    </div>
  )
}
