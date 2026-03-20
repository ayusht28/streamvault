import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Eye, Clock } from 'lucide-react'
import { formatViews, formatDuration, timeAgo, getAvatarUrl } from '../utils/helpers'

export default function VideoCard({ video, index = 0 }) {
  const [imgError, setImgError] = useState(false)
  const [hovered, setHovered] = useState(false)

  const thumbnail = !imgError && video.thumbnail_url ? video.thumbnail_url : null
  const uploader = video.uploader || {}

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group cursor-pointer"
    >
      <Link to={`/watch/${video.id}`} className="block">
        {/* Thumbnail */}
        <div
          className="relative overflow-hidden rounded-2xl aspect-video-thumb w-full"
          style={{
            background: 'var(--bg-card)',
            boxShadow: hovered ? '0 16px 48px rgba(0,0,0,0.7)' : '0 4px 16px rgba(0,0,0,0.4)',
            transition: 'box-shadow 0.3s ease',
          }}
        >
          {thumbnail ? (
            <motion.img
              src={thumbnail}
              alt={video.title}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
              animate={{ scale: hovered ? 1.04 : 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-900/30 via-obsidian-800 to-electric-900/20">
              <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center">
                <Play size={20} className="text-violet-400 ml-1" fill="currentColor" />
              </div>
            </div>
          )}

          {/* Hover overlay */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              animate={{ scale: hovered ? 1 : 0.8 }}
              transition={{ duration: 0.2 }}
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(139,92,246,0.9)', backdropFilter: 'blur(8px)' }}
            >
              <Play size={20} className="text-white ml-1" fill="white" />
            </motion.div>
          </motion.div>

          {/* Duration badge */}
          {video.duration > 0 && (
            <div
              className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg text-xs font-mono text-white flex items-center gap-1"
              style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
            >
              <Clock size={10} />
              {formatDuration(video.duration)}
            </div>
          )}

          {/* Views badge (top left on hover) */}
          <motion.div
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : -4 }}
            transition={{ duration: 0.2 }}
            className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-xs text-slate-200 flex items-center gap-1"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          >
            <Eye size={10} />
            {formatViews(video.views)}
          </motion.div>
        </div>

        {/* Info */}
        <div className="flex gap-3 mt-3">
          {/* Channel avatar */}
          <Link
            to={`/channel/${uploader.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0"
          >
            <img
              src={getAvatarUrl(uploader.avatar, uploader.username)}
              alt={uploader.username}
              className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/10 hover:ring-violet-400/50 transition-all"
            />
          </Link>

          <div className="min-w-0 flex-1">
            <h3
              className="font-display font-semibold text-sm leading-snug text-slate-100 group-hover:text-white line-clamp-2 transition-colors"
              title={video.title}
            >
              {video.title}
            </h3>
            <Link
              to={`/channel/${uploader.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-slate-500 hover:text-violet-400 transition-colors mt-0.5 block"
            >
              {uploader.username || 'Unknown'}
            </Link>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-600">
              <span>{formatViews(video.views)} views</span>
              <span className="text-slate-700">·</span>
              <span>{timeAgo(video.created_at)}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// Skeleton loader version
export function VideoCardSkeleton() {
  return (
    <div className="cursor-pointer">
      <div className="aspect-video-thumb w-full rounded-2xl skeleton" />
      <div className="flex gap-3 mt-3">
        <div className="w-9 h-9 rounded-xl skeleton flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 rounded skeleton w-full" />
          <div className="h-3 rounded skeleton w-2/3" />
          <div className="h-3 rounded skeleton w-1/2" />
        </div>
      </div>
    </div>
  )
}
