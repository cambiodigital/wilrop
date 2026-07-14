'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Mail, Phone, Instagram, Facebook, Shield } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { BrandWordmark } from '@/components/brand/BrandWordmark'
import { portalPaths } from '@/lib/portal-routes'
import { brand, socialLinks as brandSocialLinks } from '@/lib/brand'
import { supportTelUrl, supportWhatsAppUrl } from '@/lib/contact'

const quickLinks = [
  { label: 'Inicio', href: portalPaths.home },
  { label: 'Destinos', href: portalPaths.destinations },
  { label: 'Hoteles', href: portalPaths.hotels },
  { label: 'Excursiones', href: portalPaths.excursions },
  { label: 'Transportes', href: portalPaths.transport },
  { label: 'Sobre Nosotros', href: portalPaths.about },
  { label: 'Contacto', href: portalPaths.contact },
]

const socialLinks = [
  { icon: Instagram, label: 'Instagram', href: brandSocialLinks.find(s => s.icon === 'Instagram')?.href || '#' },
  { icon: Facebook, label: 'Facebook', href: brandSocialLinks.find(s => s.icon === 'Facebook')?.href || '#' },
]

export default function PortalFooter() {
  const [destinationsList, setDestinationsList] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/public/destinations')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setDestinationsList(res.data)
        }
      })
      .catch((err) => console.error('Error fetching footer destinations:', err))
  }, [])
  return (
    <footer className="bg-secondary text-brand-text">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <BrandWordmark inverted />
            <p className="mt-4 text-sm leading-relaxed text-brand-text-muted">
              {brand.description}
            </p>
            <div className="mt-5 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex size-9 items-center justify-center rounded-lg bg-brand-surface text-brand-text-muted transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label={social.label}
                >
                  <social.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Enlaces Rápidos
            </h3>
            <ul className="mt-4 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-brand-text-muted transition-colors hover:text-sky-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Destinos Populares
            </h3>
            <ul className="mt-4 space-y-3">
              {destinationsList.slice(0, 6).map((dest) => (
                <li key={dest.id}>
                  <Link
                    href={portalPaths.destinationDetail(dest.id)}
                    className="flex items-center gap-1.5 text-sm text-brand-text-muted transition-colors hover:text-sky-300"
                  >
                    <MapPin className="size-3" />
                    {dest.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Contacto
            </h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-2 text-sm text-brand-text-muted">
                <Phone className="size-4 shrink-0 text-sky-300/80" />
                <a href={supportTelUrl} className="transition-colors hover:text-sky-300">
                  {brand.phone}
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-brand-text-muted">
                <Mail className="size-4 shrink-0 text-sky-300/80" />
                {brand.supportEmail}
              </li>
              <li className="flex items-start gap-2 text-sm text-brand-text-muted">
                <MapPin className="mt-0.5 size-4 shrink-0 text-sky-300/80" />
                <span>{brand.address}</span>
              </li>
            </ul>
            <a
              href={supportWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 block rounded-lg bg-brand-surface p-3 transition-colors hover:bg-brand-surface/90"
            >
              <p className="text-xs text-brand-text-muted">
                ¿Necesitas ayuda inmediata?
              </p>
              <p className="mt-1 text-sm font-medium text-sky-300">
                Escríbenos por WhatsApp
              </p>
            </a>
          </div>
        </div>

        <Separator className="my-10 bg-brand-line/30" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-brand-text-muted">
            &copy; {new Date().getFullYear()} {brand.name}. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-xs text-brand-text-muted">
            <button className="hover:text-sky-300 transition-colors">
              Términos y Condiciones
            </button>
            <button className="hover:text-sky-300 transition-colors">
              Política de Privacidad
            </button>
            <Link
              href={portalPaths.adminLogin}
              className="flex items-center gap-1 hover:text-sky-300 transition-colors"
              aria-label="Acceso Administrativo"
            >
              <Shield className="size-3" />
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
