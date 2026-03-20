import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ThumbsUp, ThumbsDown, Share2, Bell, CheckCircle,
  Eye, Calendar, ChevronDown, ChevronUp, Play
} from 'lucide-react'
import { videoAPI, subscriptionAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import CommentSection from '../components/CommentSection'
import VideoCard from '../components/VideoCard'
import { formatViews, formatDate, getAvatarUrl, formatSubscribers } from '../utils/helpers'

export default function WatchPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [video, setVideo] = useState(null)
  const [suggested, setSuggested] = useState([])
  const [loading, setLoading] = useState(true)
  const [subscribed, setSubscribed] = useState(false)
  const [likeState, setLikeState] = useState(null)
  const [descExpanded, setDescExpanded] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    fetchVideo()
    window.scrollTo(0, 0)
  }, [id])

  const fetchVideo = async () => {
    try {
      setLoading(true)
      const { data } = await videoAPI.getById(id)
      if (data.success) {
        setVideo(data.video)
        setSuggested(data.suggested || [])
        setLikeState(data.video.userLike)
        if (user && data.video.uploader?.id) {
          checkSubscription(data.video.uploader.id)
        }
      }
    } catch { navigate('/') }
    finally { setLoading(false) }
  }

  const checkSubscription = async (channelId) => {
    try {
      const { data } = await subscriptionAPI.getStatus(channelId)
      if (data.success) setSubscribed(data.subscribed)
    } catch { /* silent */ }
  }

  const handleLike = async (type) => {
    if (!user) return navigate('/login')
    const { data } = await videoAPI.toggleLike(id, type)
    if (data.success) {
      setLikeState(data.action === 'removed' ? null : data.type)
      if (type === 'like') {
        setVideo(prev => ({
          ...prev,
          likes_count: prev.likes_count + (data.action === 'removed' ? -1 : 1)
        }))
      }
    }
  }

  const handleSubscribe = async () => {
    if (!user) return navigate('/login')
    const { data } = await subscriptionAPI.toggle(video.uploader.id)
    if (data.success) {
      setSubscribed(data.subscribed)
      setVideo(prev => ({
        ...prev,
        uploader: {
          ...prev.uploader,
          subscriber_count: prev.uploader.subscriber_count + (data.subscribed ? 1 : -1),
        }
      }))
    }
  }

  const handleShare = () => {
    navigator.share?.({ title: video?.title, url: window.location.href })
      || navigator.clipboard.writeText(window.location.href)
  }

  if (loading) return <WatchSkeleton />
  if (!video) return null

  const uploader = video.uploader || {}

  return (
    <div className="flex gap-6 max-w-screen-2xl">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Video Player */}
        <div
          className="relative rounded-2xl overflow-hidden w-full"
          style={{
            aspectRatio: '16/9',
            background: '#000',
            boxShadow: '0 8px 40px rgba(0,0,0,0.8)',
          }}
        >
          <video
            ref={videoRef}
            src={video.video_url}
            controls
            autoPlay
            className="w-full h-full"
            style={{ background: '#000' }}
          />
        </div>

        {/* Title + Meta */}
        <div className="mt-4">
          <h1 className="font-display font-bold text-xl text-white leading-tight mb-3">
            {video.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <Eye size={14} />
                {formatViews(video.views)} views
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {formatDate(video.created_at)}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <div
                className="flex rounded-2xl overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <ActionBtn
                  onClick={() => handleLike('like')}
                  active={likeState === 'like'}
                  icon={ThumbsUp}
                  label={formatViews(video.likes_count)}
                  activeColor="text-violet-400"
                />
                <div className="w-px bg-white/5" />
                <ActionBtn
                  onClick={() => handleLike('dislike')}
                  active={likeState === 'dislike'}
                  icon={ThumbsDown}
                  label=""
                  activeColor="text-red-400"
                />
              </div>
              <ActionBtn2 icon={Share2} label="Share" onClick={handleShare} />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/5 my-4" />

        {/* Channel + Subscribe */}
        <div className="flex items-center justify-between gap-4">
          <Link to={`/channel/${uploader.id}`} className="flex items-center gap-3 group">
            <img
              src={getAvatarUrl(uploader.avatar, uploader.username)}
              alt={uploader.username}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/10 group-hover:ring-violet-400/50 transition-all"
            />
            <div>
              <p className="font-display font-semibold text-white group-hover:text-violet-300 transition-colors flex items-center gap-1.5">
                {uploader.username}
                <CheckCircle size={14} className="text-violet-400" />
              </p>
              <p className="text-xs text-slate-500">
                {formatSubscribers(uploader.subscriber_count)}
              </p>
            </div>
          </Link>

          <motion.button
            onClick={handleSubscribe}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-body font-semibold transition-all"
            style={subscribed ? {
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            } : {
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              color: 'white',
              boxShadow: '0 0 20px rgba(139,92,246,0.35)',
            }}
          >
            {subscribed ? (
              <><Bell size={15} /> Subscribed</>
            ) : (
              <>Subscribe</>
            )}
          </motion.button>
        </div>

        {/* Description */}
        {video.description && (
          <div
            className="mt-4 rounded-2xl p-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div
              className={`text-sm text-slate-400 leading-relaxed whitespace-pre-wrap overflow-hidden transition-all duration-300 ${
                descExpanded ? '' : 'line-clamp-3'
              }`}
            >
              {video.description}
            </div>
            {video.description.length > 200 && (
              <button
                onClick={() => setDescExpanded(p => !p)}
                className="mt-2 text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
              >
                {descExpanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Show more</>}
              </button>
            )}
          </div>
        )}

        {/* Tags */}
        {video.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {video.tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs font-mono"
                style={{
                  background: 'rgba(139,92,246,0.1)',
                  border: '1px solid rgba(139,92,246,0.2)',
                  color: '#a78bfa',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Comments */}
        <div className="mt-8 border-t border-white/5 pt-8">
          <CommentSection videoId={id} commentsCount={video.comments_count} />
        </div>
      </div>

      {/* Suggested */}
      <div className="w-80 xl:w-96 flex-shrink-0 hidden lg:block">
        <p className="font-display font-semibold text-slate-400 text-sm mb-4 uppercase tracking-wider">
          Up Next
        </p>
        <div className="flex flex-col gap-4">
          {suggested.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <SuggestedCard video={v} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ActionBtn({ icon: Icon, label, onClick, active, activeColor }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-body hover:bg-white/5 transition-colors ${
        active ? activeColor : 'text-slate-400'
      }`}
    >
      <Icon size={16} fill={active ? 'currentColor' : 'none'} />
      {label}
    </button>
  )
}

function ActionBtn2({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-body text-slate-400 hover:text-white hover:bg-white/5 transition-all"
      style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}
    >
      <Icon size={16} />
      {label}
    </button>
  )
}

function SuggestedCard({ video }) {
  const uploader = video.uploader || {}
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      to={`/watch/${video.id}`}
      className="flex gap-3 group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative w-40 flex-shrink-0 rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
        {video.thumbnail_url ? (
          <motion.img
            src={video.thumbnail_url}
            alt={video.title}
            className="w-full h-full object-cover"
            animate={{ scale: hovered ? 1.05 : 1 }}
            transition={{ duration: 0.3 }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: 'var(--bg-elevated)' }}
          >
            <Play size={16} className="text-slate-600" />
          </div>
        )}
        {hovered && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Play size={18} className="text-white" fill="white" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-display font-semibold text-slate-300 group-hover:text-white line-clamp-2 transition-colors">
          {video.title}
        </p>
        <p className="text-xs text-slate-600 mt-1">{uploader.username}</p>
        <p className="text-xs text-slate-700 mt-0.5">{formatViews(video.views)} views</p>
      </div>
    </Link>
  )
}

function WatchSkeleton() {
  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <div className="skeleton rounded-2xl w-full" style={{ aspectRatio: '16/9' }} />
        <div className="mt-4 space-y-3">
          <div className="skeleton h-7 rounded w-3/4" />
          <div className="skeleton h-4 rounded w-1/3" />
        </div>
      </div>
      <div className="w-80 hidden lg:block space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="skeleton rounded-xl flex-shrink-0" style={{ width: 160, aspectRatio: '16/9' }} />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3 rounded w-full" />
              <div className="skeleton h-3 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
