// Suspense fallback while a page chunk downloads: a skeleton, not a blank screen.
export default function PageLoader() {
  return (
    <div className="animate-pulse space-y-3" role="status" aria-label="Loading">
      <div className="h-8 w-1/2 rounded-lg bg-gray-200" />
      <div className="h-24 rounded-2xl bg-gray-200" />
      <div className="h-16 rounded-2xl bg-gray-200" />
      <div className="h-16 rounded-2xl bg-gray-200" />
    </div>
  )
}
