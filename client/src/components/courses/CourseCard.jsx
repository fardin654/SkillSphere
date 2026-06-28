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
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-600/30 to-violet-600/30">
            <BookOpen size={40} className="text-indigo-400/60" />
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Price badge */}
        <div className="absolute right-3 top-3">
          <span className="inline-flex items-center gap-0.5 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
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
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 flex-1 text-lg font-semibold leading-snug text-slate-900 transition-colors duration-200 group-hover:text-indigo-600">
          {title}
        </h3>

        <div className="mt-4 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-slate-100">
            <User size={12} className="text-slate-500" />
          </div>
          <span className="truncate text-sm text-slate-500">{educatorName}</span>
        </div>
      </div>
    </Link>
  )
}
