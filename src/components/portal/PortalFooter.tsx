'use client'

import { Plane, MapPin, Mail, Phone, Instagram, Facebook, Twitter, Shield } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { useNavigationStore } from '@/store/useNavigationStore'
import { destinations } from '@/data/destinations'

const quickLinks = [
  { label: 'Inicio', view: 'portal-home' },
  { label: 'Destinos', view: 'portal-destinations' },
  { label: 'Sobre Nosotros', view: 'portal-about' },
  { label: 'Contacto', view: 'portal-contact' },
]

const socialLinks = [
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Facebook, label: 'Facebook', href: '#' },
  { icon: Twitter, label: 'Twitter', href: '#' },
]

export default function PortalFooter() {
  const { navigate } = useNavigationStore()

  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2">
              <Plane className="size-5 text-amber-400" />
              <span className="text-lg font-bold text-white">
                WIL<span className="text-amber-400">ROP</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-neutral-400">
              Tu agencia de viajes de confianza en Colombia. Experiencias auténticas,
              seguridad garantizada y los mejores destinos del país.
            </p>
            <div className="mt-5 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex size-9 items-center justify-center rounded-lg bg-neutral-800 text-neutral-400 transition-colors hover:bg-amber-500 hover:text-white"
                  aria-label={social.label}
                >
                  <social.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Enlaces Rápidos
            </h3>
            <ul className="mt-4 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.view}>
                  <button
                    onClick={() => {
                      navigate(link.view)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="text-sm text-neutral-400 transition-colors hover:text-amber-400"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Destinations */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Destinos Populares
            </h3>
            <ul className="mt-4 space-y-3">
              {destinations.slice(0, 6).map((dest) => (
                <li key={dest.id}>
                  <button
                    onClick={() => navigate('portal-destinations')}
                    className="flex items-center gap-1.5 text-sm text-neutral-400 transition-colors hover:text-amber-400"
                  >
                    <MapPin className="size-3" />
                    {dest.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Contacto
            </h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-2 text-sm text-neutral-400">
                <Phone className="size-4 shrink-0 text-amber-400/70" />
                +57 310 555 0123
              </li>
              <li className="flex items-center gap-2 text-sm text-neutral-400">
                <Mail className="size-4 shrink-0 text-amber-400/70" />
                info@wilroptravel.com
              </li>
              <li className="flex items-start gap-2 text-sm text-neutral-400">
                <MapPin className="mt-0.5 size-4 shrink-0 text-amber-400/70" />
                <span>Calle 72 #10-34, Bogotá, Colombia</span>
              </li>
            </ul>
            <div className="mt-5 rounded-lg bg-neutral-800 p-3">
              <p className="text-xs text-neutral-400">
                ¿Necesitas ayuda inmediata?
              </p>
              <p className="mt-1 text-sm font-medium text-amber-400">
                Escríbenos por WhatsApp
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-10 bg-neutral-800" />

        {/* Copyright */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-neutral-500">
            © {new Date().getFullYear()} WILROP Colombia Travel. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-xs text-neutral-500">
            <button className="hover:text-amber-400 transition-colors">
              Términos y Condiciones
            </button>
            <button className="hover:text-amber-400 transition-colors">
              Política de Privacidad
            </button>
            <button
              onClick={() => navigate('admin-login')}
              className="flex items-center gap-1 hover:text-amber-400 transition-colors"
              aria-label="Acceso Administrativo"
            >
              <Shield className="size-3" />
              Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
