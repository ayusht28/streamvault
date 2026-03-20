import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Bell, BellOff, Rss } from 'lucide-react'
import { subscriptionAPI } from '../services/api'
import VideoGrid from '../components/VideoGrid'
import { getAvatarUrl, formatSubscribers } from '../utils/helpers'

export default function SubscriptionsPage() {
  const navigate = useNavigate()
  const [feed, setFeed] = useState([])
  const [subs, setSubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeChannel, setActiveChannel] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [feedRes, subsRes] = await Promise.all([
        subscriptionAPI.getFeed(),
        subscriptionAPI.getAll(),
      ])
      if (feedRes.data.success) setFeed(feedRes.data.videos)
      if (subsRes.data.success) setSubs(subsRes.data.subscriptions)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  const filteredFeed = activeChannel
    ? feed.filter(v => v.user_id === activeChannel)
    : feed

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl gradient-text mb-1 flex items-center gap-3">
          <Rss size={26} className="text-violet-400" />
          Subscriptions
        </h1>
        <p className="text-slate-500 text-sm">Latest from channels you follow</p>
      </div>

      {!loading && subs.length === 0 ? (
        <EmptySubscriptions onExplore={() => navigate('/')} />
      ) : (
        <>
          {/* Channel filter strip */}
          {subs.length > 0 && (
            <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveChannel(null)}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-body font-medium flex-shrink-0 transition-all"
                style={!activeChannel ? {
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(99,102,241,0.18))',
                  border: '1px solid rgba(139,92,246,0.4)',
                  color: '#c4b5fd',
                } : {
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                <Bell size={13} />
                All Channels
              </motion.button>

              {subs.map(({ channel }) => (
                <motion.button
                  key={channel.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveChannel(activeChannel === channel.id ? null : channel.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-body flex-shrink-0 transition-all"
                  style={activeChannel === channel.id ? {
                    background: 'rgba(139,92,246,0.15)',
                    border: '1px solid rgba(139,92,246,0.35)',
                    color: '#c4b5fd',
                  } : {
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <img
                    src={getAvatarUrl(channel.avatar, channel.username)}
                    alt={channel.username}
                    className="w-6 h-6 rounded-lg object-cover flex-shrink-0"
                  />
                  <span className="hidden sm:block">{channel.username}</span>
                </motion.button>
              ))}
            </div>
          )}

          {/* Subscribed channels row */}
          {!loading && subs.length > 0 && (
            <div className="mb-8">
              <h2 className="font-display font-semibold text-slate-400 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users size={14} />
                {subs.length} Channel{subs.length !== 1 ? 's' : ''} you follow
              </h2>
              <div className="flex flex-wrap gap-3">
                {subs.map(({ channel }, i) => (
                  <motion.div
                    key={channel.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={`/channel/${channel.id}`}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div className="relative">
                        <img
                          src={getAvatarUrl(channel.avatar, channel.username)}
                          alt={channel.username}
                          className="w-14 h-14 rounded-2xl object-cover ring-2 ring-transparent group-hover:ring-violet-400/50 transition-all"
                        />
                        <div
                          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: '#8b5cf6' }}
                        >
                          <Bell size={8} className="text-white" />
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 group-hover:text-violet-300 transition-colors max-w-16 truncate">
                        {channel.username}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div
            className="flex items-center gap-4 mb-8"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <p className="font-display font-semibold text-slate-400 text-sm uppercase tracking-wider pt-4">
              Latest Videos
              {activeChannel && subs.find(s => s.channel.id === activeChannel) && (
                <span className="text-violet-400 ml-2">
                  from {subs.find(s => s.channel.id === activeChannel).channel.username}
                </span>
              )}
            </p>
          </div>

          <VideoGrid videos={filteredFeed} loading={loading} />

          {!loading && filteredFeed.length === 0 && subs.length > 0 && (
            <div className="text-center py-16 text-slate-600">
              <Bell size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-display font-semibold text-slate-400">No new videos yet</p>
              <p className="text-sm mt-1">The channels you follow haven't uploaded recently.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function EmptySubscriptions({ onExplore }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center py-24 text-center max-w-sm mx-auto"
    >
      <div
        className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(99,102,241,0.08))',
          border: '1px solid rgba(139,92,246,0.2)',
        }}
      >
        <Users size={40} className="text-violet-400/50" />
      </div>
      <h3 className="font-display font-bold text-xl text-white mb-2">No subscriptions yet</h3>
      <p className="text-slate-500 text-sm mb-8">
        Subscribe to your favorite channels and never miss new content
      </p>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onExplore}
        className="px-8 py-3 rounded-2xl text-sm font-body font-semibold text-white"
        style={{
          background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
          boxShadow: '0 0 24px rgba(139,92,246,0.35)',
        }}
      >
        Explore Videos
      </motion.button>
    </motion.div>
  )
}
