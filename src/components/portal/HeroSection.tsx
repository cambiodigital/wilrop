'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, Calendar, Star, Users, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { destinations } from '@/data/destinations'
import { useNavigationStore } from '@/store/useNavigationStore'

const stats = [
  { label: 'Viajeros Felices', value: '500+', icon: Users },
  { label: 'Paquetes', value: '50+', icon: Briefcase },
  { label: 'Destinos', value: '6', icon: MapPin },
  { label: 'Rating', value: '4.9★', icon: Star },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function HeroSection() {
  const { navigate } = useNavigationStore()
  const [selectedDest, setSelectedDest] = useState('')

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero.png')" }}
      />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-20 pb-16 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/15 px-4 py-1.5 text-sm text-amber-300 backdrop-blur-sm">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              La mejor agencia de viajes en Colombia
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="mt-6 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Descubre la{' '}
            <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
              Magia
            </span>{' '}
            de Colombia
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-2xl text-lg text-white/80 sm:text-xl"
          >
            Experiencias únicas en los destinos más increíbles del país
          </motion.p>

          {/* Search Bar */}
          <motion.div
            variants={itemVariants}
            className="mt-10 w-full max-w-3xl"
          >
            <div className="rounded-2xl border border-white/15 bg-white/15 p-4 shadow-2xl backdrop-blur-xl sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
                {/* Destination Select */}
                <div className="flex-1">
                  <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/60">
                    <MapPin className="size-3.5" />
                    Destino
                  </label>
                  <Select value={selectedDest} onValueChange={setSelectedDest}>
                    <SelectTrigger className="w-full rounded-xl border-white/20 bg-white/15 text-sm shadow-inner backdrop-blur-sm transition-colors hover:bg-white/20 focus:ring-2 focus:ring-amber-400/50 [&>svg]:text-white [&>span]:text-white" style={{ height: '44px', minHeight: '44px' }}>
                      <SelectValue placeholder="¿A dónde quieres ir?" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-neutral-200 bg-white shadow-xl">
                      {destinations.map((d) => (
                        <SelectItem key={d.id} value={d.id} className="text-neutral-700 rounded-lg py-2.5 px-3 focus:bg-amber-50 focus:text-amber-700">
                          <div className="flex items-center gap-2">
                            <MapPin className="size-3.5 text-amber-500" />
                            <span>{d.name}</span>
                            <span className="text-xs text-white/70">· {d.region}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Input */}
                <div className="flex-1">
                  <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/60">
                    <Calendar className="size-3.5" />
                    Fecha
                  </label>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/60" />
                    <Input
                      type="date"
                      className="w-full rounded-xl border-white/20 bg-white/15 pl-9 text-sm text-white shadow-inner backdrop-blur-sm transition-colors hover:bg-white/20 focus:ring-2 focus:ring-amber-400/50 [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:size-5 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    style={{ height: '44px', minHeight: '44px' }}
                    />
                  </div>
                </div>

                {/* Search Button */}
                <Button
                  onClick={() => navigate('portal-destinations')}
                  className="shrink-0 rounded-xl bg-amber-500 px-6 text-sm font-semibold text-white shadow-lg shadow-amber-600/30 transition-all duration-300 hover:bg-amber-600 hover:shadow-xl hover:shadow-amber-600/40 active:scale-[0.98] sm:self-end"
                  style={{ height: '44px', minHeight: '44px' }}
                >
                  <Search className="mr-2 size-4" />
                  Buscar Paquetes
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="mt-16 grid w-full max-w-3xl grid-cols-2 gap-3 sm:gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1.5 rounded-xl bg-white/5 px-4 py-4 backdrop-blur-sm border border-white/5">
                <stat.icon className="size-4 text-amber-400" />
                <span className="text-xl font-bold text-white sm:text-2xl">{stat.value}</span>
                <span className="text-xs text-white/50 font-medium">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="flex h-8 w-5 items-start justify-center rounded-full border-2 border-white/30 p-1"
        >
          <motion.div className="h-1.5 w-1 rounded-full bg-white/60" />
        </motion.div>
      </motion.div>
    </section>
  )
}
