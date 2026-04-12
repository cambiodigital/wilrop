'use client'

import { motion } from 'framer-motion'
import { Ship, Clock, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNavigationStore } from '@/store/useNavigationStore'

const cruisePackages = [
  {
    name: 'San Andrés Express',
    duration: '3 noches',
    price: '1.450.000',
    category: 'Economy',
    color: 'from-sky-500 to-blue-600',
    badge: null,
  },
  {
    name: 'Caribe Premium',
    duration: '5 noches',
    price: '2.350.000',
    category: 'Premium',
    color: 'from-amber-500 to-orange-500',
    badge: 'Popular',
  },
  {
    name: 'Islas del Rosario',
    duration: '1 noche',
    price: '680.000',
    category: 'Day Cruise',
    color: 'from-emerald-500 to-teal-600',
    badge: 'Nuevo',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function CruisesSection() {
  const { navigate } = useNavigationStore()

  return (
    <section id="cruises" className="bg-white">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28"
      >
        {/* Section Header */}
        <motion.div variants={itemVariants} className="text-center">
          <Badge className="mb-4 rounded-full bg-sky-100 px-4 py-1.5 text-sky-700 border-sky-200 text-xs font-semibold uppercase tracking-wider">
            <Ship className="mr-1.5 size-3" />
            Navega el Caribe
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
            Cruceros
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-neutral-500 sm:text-lg">
            Navega por el Caribe colombiano
          </p>
        </motion.div>

        {/* Hero Cruise Card */}
        <motion.div
          variants={itemVariants}
          className="mt-12 relative overflow-hidden rounded-2xl shadow-xl"
        >
          <img
            src="/images/cruceros.png"
            alt="Crucero por el Caribe"
            className="w-full aspect-[21/9] object-cover sm:aspect-[3/1]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex items-end p-6 sm:p-10">
            <div className="max-w-xl">
              <Badge className="mb-3 rounded-full bg-emerald-500 px-3 py-1 text-white border-transparent text-xs font-semibold">
                Nuevo
              </Badge>
              <h3 className="text-2xl font-bold text-white sm:text-3xl">
                Crucero por San Andrés y Providencia
              </h3>
              <p className="mt-2 flex items-center gap-2 text-sm text-white/80 sm:text-base">
                <Clock className="size-4 text-amber-400" />
                7 noches · Todo incluido · Desde $2.800.000
              </p>
              <Button
                onClick={() => navigate('portal-destinations')}
                className="mt-5 rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/30 transition-all hover:bg-amber-600 hover:shadow-xl"
              >
                Ver Detalles
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Cruise Package Cards */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {cruisePackages.map((cruise) => (
            <motion.div
              key={cruise.name}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="group cursor-pointer overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
              onClick={() => navigate('portal-destinations')}
            >
              {/* Image Placeholder */}
              <div className={`relative flex aspect-[16/10] items-center justify-center bg-gradient-to-br ${cruise.color}`}>
                <Ship className="size-12 text-white/40" />
                {cruise.badge && (
                  <Badge className="absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-neutral-900 border-transparent">
                    {cruise.badge === 'Popular' && (
                      <Sparkles className="mr-1 size-3 text-amber-500" />
                    )}
                    {cruise.badge}
                  </Badge>
                )}
              </div>

              <div className="p-5">
                <h4 className="text-lg font-bold text-neutral-900">{cruise.name}</h4>
                <div className="mt-2 flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-sm text-neutral-500">
                    <Clock className="size-3.5" />
                    {cruise.duration}
                  </span>
                  <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
                    {cruise.category}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-neutral-500">Desde</p>
                  <p className="text-xl font-bold text-neutral-900">
                    ${cruise.price}
                  </p>
                </div>
                <Button
                  onClick={(e) => { e.stopPropagation(); navigate('portal-destinations') }}
                  className="mt-4 w-full rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white transition-all hover:bg-amber-600"
                >
                  Reservar
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div variants={itemVariants} className="mt-10 text-center">
          <button
            onClick={() => navigate('portal-destinations')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 transition-colors hover:text-amber-700"
          >
            Ver todos los cruceros
            <ArrowRight className="size-4" />
          </button>
        </motion.div>
      </motion.div>
    </section>
  )
}
