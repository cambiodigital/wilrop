export default function RouteLoading({ title = 'Cargando contenido...' }: { title?: string }) {
  return (
    <div className="min-h-screen bg-neutral-50 px-4 pt-24 pb-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl animate-pulse space-y-4">
        <div className="h-8 w-72 rounded-lg bg-neutral-200" />
        <div className="h-4 w-full rounded bg-neutral-200" />
        <div className="h-4 w-5/6 rounded bg-neutral-200" />
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">{title}</p>
          <div className="mt-4 space-y-3">
            <div className="h-4 w-full rounded bg-neutral-200" />
            <div className="h-4 w-full rounded bg-neutral-200" />
            <div className="h-4 w-2/3 rounded bg-neutral-200" />
          </div>
        </div>
      </div>
    </div>
  )
}
