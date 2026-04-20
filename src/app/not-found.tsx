import Link from 'next/link'
import { Compass } from 'lucide-react'
import PortalShell from '@/components/portal/PortalShell'
import { buildPublicMetadata } from '@/lib/seo'

export const metadata = buildPublicMetadata({
  title: 'Página no encontrada | WILROP',
  description: 'La ruta que buscas no existe o ya no está disponible en WILROP Colombia Travel.',
  path: '/404',
  noIndex: true,
})

export default function NotFoundPage() {
  return (
    <PortalShell>
      <div className="min-h-screen bg-neutral-50 px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <Compass className="size-8" />
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-amber-600">Error 404</p>
          <h1 className="mt-2 text-3xl font-bold text-neutral-900">No encontramos esa ruta</h1>
          <p className="mt-3 text-sm text-neutral-500">
            Puede que el enlace haya cambiado o que el contenido no esté disponible.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
            >
              Volver al inicio
            </Link>
            <Link
              href="/destinos"
              className="rounded-xl border border-neutral-200 px-6 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Explorar destinos
            </Link>
          </div>
        </div>
      </div>
    </PortalShell>
  )
}
