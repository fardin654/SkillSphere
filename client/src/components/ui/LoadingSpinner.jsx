export default function LoadingSpinner({ fullPage = false, size = 'md', text = '' }) {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  }

  const spinner = (
    <div className="flex flex-col items-center gap-4">
      <div className={`relative ${sizeMap[size] || sizeMap.md}`}>
        {/* Outer ring */}
        <div
          className={`absolute inset-0 rounded-full border-2 border-transparent animate-spin`}
          style={{
            borderTopColor: '#6366f1',
            borderRightColor: '#8b5cf6',
            animationDuration: '1s',
          }}
        />
        {/* Inner ring */}
        <div
          className={`absolute inset-1 rounded-full border-2 border-transparent animate-spin`}
          style={{
            borderBottomColor: '#a78bfa',
            borderLeftColor: '#c4b5fd',
            animationDuration: '1.5s',
            animationDirection: 'reverse',
          }}
        />
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-400 to-violet-400 animate-pulse" />
        </div>
      </div>
      {text && (
        <p className="text-sm text-slate-400 animate-pulse">{text}</p>
      )}
    </div>
  )

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[var(--color-surface)] z-50">
        {spinner}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-12">
      {spinner}
    </div>
  )
}
