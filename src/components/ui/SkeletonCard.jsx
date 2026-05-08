export function SkeletonCard({ compact = false }) {
  return <div className={`skeleton w-full rounded-xl ${compact ? 'h-16' : 'h-40'}`} aria-hidden="true" />
}
