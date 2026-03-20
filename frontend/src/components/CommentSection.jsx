import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Trash2, MessageSquare } from 'lucide-react'
import { commentAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { getAvatarUrl, timeAgo } from '../utils/helpers'

export default function CommentSection({ videoId, commentsCount }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [videoId])

  const fetchComments = async () => {
    try {
      setLoading(true)
      const { data } = await commentAPI.getByVideo(videoId)
      if (data.success) setComments(data.comments)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim() || submitting) return
    setSubmitting(true)
    try {
      const { data } = await commentAPI.create(videoId, text.trim())
      if (data.success) {
        setComments(prev => [data.comment, ...prev])
        setText('')
      }
    } catch { /* silent */ }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    try {
      await commentAPI.delete(id)
      setComments(prev => prev.filter(c => c.id !== id))
    } catch { /* silent */ }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare size={18} className="text-violet-400" />
        <h3 className="font-display font-semibold text-white">
          {commentsCount ?? comments.length} Comments
        </h3>
      </div>

      {/* Comment input */}
      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
          <img
            src={getAvatarUrl(user.avatar, user.username)}
            alt={user.username}
            className="w-9 h-9 rounded-xl object-cover flex-shrink-0 mt-0.5"
          />
          <div className="flex-1">
            <div
              className="flex items-end gap-2 rounded-2xl p-3"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
            >
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add a comment..."
                rows={1}
                className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 resize-none font-body"
                style={{ minHeight: '1.5rem', maxHeight: '120px' }}
                onInput={(e) => {
                  e.target.style.height = 'auto'
                  e.target.style.height = e.target.scrollHeight + 'px'
                }}
              />
              <motion.button
                type="submit"
                disabled={!text.trim() || submitting}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl transition-all flex-shrink-0"
                style={{
                  background: text.trim() ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'var(--bg-elevated)',
                  color: text.trim() ? 'white' : 'var(--text-muted)',
                }}
              >
                <Send size={15} />
              </motion.button>
            </div>
          </div>
        </form>
      ) : (
        <div
          className="rounded-2xl px-5 py-4 mb-8 text-sm text-slate-500"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          Sign in to leave a comment
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-9 h-9 rounded-xl skeleton flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 rounded skeleton w-32" />
                <div className="h-4 rounded skeleton w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-4">
            {comments.map((comment, i) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.03 }}
                className="flex gap-3 group"
              >
                <img
                  src={getAvatarUrl(comment.author?.avatar, comment.author?.username)}
                  alt={comment.author?.username}
                  className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-display font-semibold text-slate-300">
                      {comment.author?.username}
                    </span>
                    <span className="text-xs text-slate-600">{timeAgo(comment.created_at)}</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed break-words">
                    {comment.comment_text}
                  </p>
                </div>
                {user?.id === comment.user_id && (
                  <motion.button
                    onClick={() => handleDelete(comment.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/15 text-red-400/60 hover:text-red-400 transition-all flex-shrink-0"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 size={14} />
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {!loading && comments.length === 0 && (
        <div className="text-center py-10 text-slate-600">
          <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No comments yet. Start the conversation.</p>
        </div>
      )}
    </div>
  )
}
