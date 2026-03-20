import VideoCard, { VideoCardSkeleton } from './VideoCard'

export default function VideoGrid({ videos, loading, cols = 4 }) {
  const gridClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[cols] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

  if (loading) {
    return (
      <div className={`grid ${gridClass} gap-6`}>
        {Array.from({ length: 12 }).map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!videos?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <span className="text-3xl">📭</span>
        </div>
        <p className="font-display font-semibold text-slate-400 text-lg">No videos yet</p>
        <p className="text-slate-600 text-sm mt-1">Be the first to upload something great</p>
      </div>
    )
  }

  return (
    <div className={`grid ${gridClass} gap-6`}>
      {videos.map((video, i) => (
        <VideoCard key={video.id} video={video} index={i} />
      ))}
    </div>
  )
}
