'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  MapPin,
  UserCircle,
  ChevronDown,
  Phone,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrandWordmark } from '@/components/brand/BrandWordmark'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { usePortalNavigation } from '@/hooks/use-portal-navigation'
import { portalPaths } from '@/lib/portal-routes'

const navLinks = [
  { label: 'Inicio', view: 'portal-home', href: portalPaths.home },
  { label: 'Destinos', view: 'portal-destinations', href: portalPaths.destinations },
  { label: 'Hoteles', view: 'portal-hotels', href: portalPaths.hotels },
  { label: 'Sobre Nosotros', view: 'portal-about', href: portalPaths.about },
]

export default function PortalHeader() {
  const { currentView } = usePortalNavigation()
  const [scrolled, setScrolled] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const isHome = currentView === 'portal-home'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isTransparent = isHome && !scrolled

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isTransparent
          ? 'bg-transparent'
          : 'bg-white/95 backdrop-blur-lg shadow-sm'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href={portalPaths.home} className="flex items-center gap-2">
          <BrandWordmark inverted={isTransparent} />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.view}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-black/5 ${
                currentView === link.view
                  ? isTransparent
                    ? 'text-sky-200'
                    : 'text-primary'
                  : isTransparent
                    ? 'text-white/90 hover:text-white'
                    : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Contacto Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-black/5 ${
                  currentView === 'portal-contact'
                    ? isTransparent
                      ? 'text-sky-200'
                      : 'text-primary'
                    : isTransparent
                      ? 'text-white/90 hover:text-white'
                      : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Contacto
                <ChevronDown className="size-3.5 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-52 rounded-xl p-1.5">
              <DropdownMenuItem
                asChild
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 cursor-pointer"
              >
                <Link href={portalPaths.contact}>
                  <Phone className="size-4 text-neutral-400" />
                  <div>
                    <span className="text-sm font-medium text-neutral-800">Contáctanos</span>
                    <p className="text-xs text-neutral-400">Información de contacto</p>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                asChild
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 cursor-pointer"
              >
                <Link href={portalPaths.resellerLogin}>
                  <UserCircle className="size-4 text-primary" />
                  <div>
                    <span className="text-sm font-medium text-neutral-800">Soy Revendedor</span>
                    <p className="text-xs text-neutral-400">Accede a tu panel</p>
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Desktop CTA Button */}
        <div className="hidden items-center gap-2 md:flex">
          <Button
            asChild
            size="sm"
            className="rounded-xl bg-primary font-medium text-primary-foreground shadow-md shadow-primary/20 transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30"
          >
            <Link href={portalPaths.destinations}>
              <MapPin className="mr-1.5 size-4" />
              Reservar Ahora
            </Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`md:hidden ${isTransparent ? 'text-white hover:bg-white/10' : 'text-neutral-800 hover:bg-neutral-100'}`}
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-left">
                <BrandWordmark compact />
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-1">
              {navLinks.map((link) => (
                <SheetClose asChild key={link.view}>
                  <Link
                    href={link.href}
                    className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-neutral-100 ${
                      currentView === link.view ? 'bg-primary/10 text-primary' : 'text-neutral-700'
                    }`}
                  >
                    {link.label}
                  </Link>
                </SheetClose>
              ))}

              {/* Contacto + Soy Revendedor mobile sub-menu */}
              <div>
                <button
                  onClick={() => setContactOpen(!contactOpen)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-neutral-100 ${
                    currentView === 'portal-contact' ? 'bg-primary/10 text-primary' : 'text-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="size-4 opacity-60" />
                    Contacto
                  </div>
                  <ChevronDown
                    className={`size-4 text-neutral-400 transition-transform duration-200 ${
                      contactOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {contactOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-4 flex flex-col gap-0.5 border-l-2 border-neutral-200 pl-3 py-1">
                        <SheetClose asChild>
                          <Link
                            href={portalPaths.contact}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                          >
                            <Phone className="size-4 text-neutral-400" />
                            Contáctanos
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link
                            href={portalPaths.resellerLogin}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                          >
                            <UserCircle className="size-4 text-primary" />
                            Soy Revendedor
                          </Link>
                        </SheetClose>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            <div className="mt-6 flex flex-col gap-3 px-3">
              <Button
                asChild
                className="w-full rounded-xl bg-primary font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Link href={portalPaths.destinations}>
                  <MapPin className="mr-2 size-4" />
                  Reservar Ahora
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  )
}
