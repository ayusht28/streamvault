import { formatDistanceToNow, format } from 'date-fns'

export const formatViews = (n) => {
  if (!n) return '0'
  n = Number(n)
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export const formatDuration = (seconds) => {
  if (!seconds) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export const timeAgo = (date) => {
  if (!date) return ''
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  } catch {
    return ''
  }
}

export const formatDate = (date) => {
  if (!date) return ''
  try {
    return format(new Date(date), 'MMM d, yyyy')
  } catch {
    return ''
  }
}

export const getAvatarUrl = (avatar, username) => {
  if (avatar) return avatar.startsWith('http') ? avatar : `${avatar}`
  const initials = (username || 'U').slice(0, 2).toUpperCase()
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=8b5cf6&color=fff&bold=true&size=128`
}

export const getThumbnailUrl = (url) => {
  if (!url) return null
  return url.startsWith('http') ? url : url
}

export const formatSubscribers = (n) => {
  if (!n) return '0 subscribers'
  n = Number(n)
  const count = n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M`
    : n >= 1_000 ? `${(n/1_000).toFixed(1)}K`
    : n.toString()
  return `${count} ${n === 1 ? 'subscriber' : 'subscribers'}`
}

export const clsx = (...classes) => classes.filter(Boolean).join(' ')
