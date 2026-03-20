import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Bell, BellOff, Calendar, Video } from 'lucide-react'
import { authAPI, videoAPI, subscriptionAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import VideoGrid from '../components/VideoGrid'
import { getAvatarUrl, formatSubscribers, formatDate, formatViews } from '../utils/helpers'

export default function ChannelPage() {
  const { userId } = useParams()
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const [channel, setChannel] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [videosLoading, setVideosLoading] = useState(true)
  const [subscribed, setSubscribed] = useState(false)
  const [subLoading, setSubLoading] = useState(false)
  const isOwnChannel = currentUser?.id === userId

  useEffect(() => {
    fetchChannel()
    fetchVideos()
    if (currentUser && !isOwnChannel) checkSub()
  }, [userId])

  const fetchChannel = async () => {
    try {
      const { data } = await authAPI.getChannel(userId)
      if (data.success) setChannel(data.channel)
      else navigate('/')
    } catch { navigate('/') }
    finally { setLoading(false) }
  }

  const fetchVideos = async () => {
    try {
      setVideosLoading(true)
      const { data } = await videoAPI.getUserVideos(userId)
      if (data.success) setVideos(data.videos)
    } catch { /* silent */ }
    finally { setVideosLoading(false) }
  }

  const checkSub = async () => {
    try {
      const { data } = await subscriptionAPI.getStatus(userId)
      if (data.success) setSubscribed(data.subscribed)
    } catch { /* silent */ }
  }

  const handleSubscribe = async () => {
    if (!currentUser) return navigate('/login')
    setSubLoading(true)
    try {
      const { data } = await subscriptionAPI.toggle(userId)
      if (data.success) {
        setSubscribed(data.subscribed)
        setChannel(prev => ({
          ...prev,
          subscriber_count: prev.subscriber_count + (data.subscribed ? 1 : -1),
        }))
      }
    } finally { setSubLoading(false) }
  }

  if (loading) return <ChannelSkeleton />
  if (!channel) return null

  const totalViews = videos.reduce((sum, v) => sum + Number(v.views || 0), 0)

  return (
    <div>
      {/* Channel banner */}
      <div
        className="relative w-full rounded-3xl overflow-hidden mb-0"
        style={{ height: 200 }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.25) 0%, rgba(99,102,241,0.18) 40%, rgba(34,211,238,0.12) 100%)',
          }}
        />
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #22d3ee, transparent)' }} />
      </div>

      {/* Channel info card */}
      <div
        className="relative mx-4 -mt-16 rounded-3xl px-6 py-5 mb-8 flex flex-wrap items-end gap-5"
        style={{
          background: 'rgba(8,12,24,0.95)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative flex-shrink-0"
        >
          <img
            src={getAvatarUrl(channel.avatar, channel.username)}
            alt={channel.username}
            className="w-24 h-24 rounded-2xl object-cover ring-4"
            style={{ ringColor: 'rgba(139,92,246,0.3)' }}
          />
          <div
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}
          >
            <CheckCircle size={12} className="text-white" />
          </div>
        </motion.div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-display font-bold text-2xl text-white flex items-center gap-2"
          >
            {channel.username}
          </motion.h1>
          <div className="flex flex-wrap items-center gap-4 mt-1.5 text-sm text-slate-500">
            <span>{formatSubscribers(channel.subscriber_count)}</span>
            <span className="flex items-center gap-1.5">
              <Video size={12} />
              {videos.length} video{videos.length !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              Joined {formatDate(channel.created_at)}
            </span>
          </div>
          {channel.bio && (
            <p className="text-sm text-slate-400 mt-2 line-clamp-2 max-w-xl">{channel.bio}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {isOwnChannel ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 rounded-2xl text-sm font-body font-medium text-slate-300 hover:text-white transition-colors"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
            >
              Edit Channel
            </button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubscribe}
              disabled={subLoading}
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
              {subscribed ? <><BellOff size={15} /> Unsubscribe</> : <><Bell size={15} /> Subscribe</>}
            </motion.button>
          )}
        </div>
      </div>

      {/* Channel stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Views', value: formatViews(totalViews) },
          { label: 'Videos', value: videos.length },
          { label: 'Subscribers', value: formatViews(channel.subscriber_count) },
        ].map(({ label, value }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl px-5 py-4 text-center"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <p className="font-display font-bold text-2xl text-white">{value}</p>
            <p className="text-xs text-slate-600 mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Videos section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-semibold text-xl text-white">
          {isOwnChannel ? 'Your Videos' : `Videos by ${channel.username}`}
        </h2>
      </div>

      <VideoGrid videos={videos} loading={videosLoading} />
    </div>
  )
}

function ChannelSkeleton() {
  return (
    <div>
      <div className="w-full rounded-3xl skeleton" style={{ height: 200 }} />
      <div className="mx-4 -mt-16 rounded-3xl p-6 flex gap-5"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
      >
        <div className="w-24 h-24 rounded-2xl skeleton flex-shrink-0" />
        <div className="flex-1 space-y-3 pt-2">
          <div className="skeleton h-7 rounded w-48" />
          <div className="skeleton h-4 rounded w-72" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 my-8">
        {[...Array(3)].map((_, i) => <div key={i} className="h-20 skeleton rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i}>
            <div className="aspect-video-thumb skeleton rounded-2xl" />
            <div className="flex gap-3 mt-3">
              <div className="w-9 h-9 skeleton rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 rounded" />
                <div className="skeleton h-3 rounded w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
