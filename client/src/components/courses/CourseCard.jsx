import { Link } from 'react-router-dom'
import { User, IndianRupee, BookOpen } from 'lucide-react'

export default function CourseCard({ course }) {
  const {
    _id,
    title,
    thumbnailImage: thumbnail,
    price,
    educator,
  } = course

  // Price in rupees (backend stores in paise/cents)
  const displayPrice = price != null ? (price / 100).toFixed(0) : 'Free'

  const educatorName =
    typeof educator === 'object' ? educator.name : educator || 'Instructor'

  return (
    <Link
      to={`/courses/${_id}`}
      className="group block glass-card overflow-hidden hover:scale-[1.02] transition-all duration-300"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-600/30 to-violet-600/30 flex items-center justify-center">
            <BookOpen size={40} className="text-indigo-400/60" />
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Price badge */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-0.5 px-3 py-1 rounded-full text-xs font-bold bg-black/50 backdrop-blur-md text-white border border-white/10">
            {price > 0 ? (
              <>
                <IndianRupee size={12} />
                {displayPrice}
              </>
            ) : (
              <span className="text-emerald-400">Free</span>
            )}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-[family-name:var(--font-family-heading)] text-lg font-semibold text-white leading-snug line-clamp-2 group-hover:text-indigo-300 transition-colors duration-200">
          {title}
        </h3>

        <div className="flex items-center gap-2 mt-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 flex items-center justify-center border border-white/10">
            <User size={12} className="text-indigo-300" />
          </div>
          <span className="text-sm text-slate-400 truncate">{educatorName}</span>
        </div>
      </div>
    </Link>
  )
}
