'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNavigationStore } from '@/store/useNavigationStore'

const features = [
  'Paquetes personalizados',
  'Los mejores precios garantizados',
  'Atención 24/7 antes y durante tu viaje',
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

export default function StartTravelSection() {
  const { navigate } = useNavigationStore()

  return (
    <section id="start-travel" className="relative bg-amber-50/50">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28"
      >
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16 items-center">
          {/* Left – Text */}
          <motion.div variants={itemVariants} className="lg:col-span-5">
            <Badge className="mb-5 rounded-full bg-amber-100 px-4 py-1.5 text-amber-700 border-amber-200 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="mr-1.5 size-3" />
              Planifica tu viaje
            </Badge>

            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
              ¡Comienza tu viaje{' '}
              <span className="bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
                aquí
              </span>
              !
            </h2>

            <p className="mt-5 text-base leading-relaxed text-neutral-600 sm:text-lg">
              No importa si buscas relajarte en una playa paradisíaca o vivir emociones
              fuertes en la selva. En WILROP creamos experiencias personalizadas que se
              adaptan a tus sueños y presupuesto.
            </p>

            <ul className="mt-7 space-y-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
                  <span className="text-sm font-medium text-neutral-700 sm:text-base">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => navigate('portal-destinations')}
              className="mt-8 rounded-xl bg-amber-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all duration-300 hover:bg-amber-600 hover:shadow-xl hover:shadow-amber-500/35 active:scale-[0.97]"
            >
              Ver Todos los Paquetes
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </motion.div>

          {/* Right – Image */}
          <motion.div
            variants={itemVariants}
            className="relative lg:col-span-7"
          >
            <div className="relative">
              <motion.div
                whileHover={{ rotate: 0, scale: 1.01 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden rounded-2xl shadow-2xl shadow-amber-900/15 rotate-2"
              >
                <img
                  src="/images/cartagena.png"
                  alt="Cartagena de Indias"
                  className="aspect-[4/3] w-full object-cover"
                />
              </motion.div>

              {/* Floating Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="absolute -bottom-5 -left-3 rounded-2xl border border-white/20 bg-white/95 p-4 shadow-xl backdrop-blur-sm sm:-bottom-6 sm:-left-6 sm:p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-amber-100">
                    <Sparkles className="size-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-neutral-900">Desde $550.000 COP</p>
                    <p className="text-sm text-neutral-500">50+ paquetes disponibles</p>
                  </div>
                </div>
              </motion.div>

              {/* Decorative element */}
              <div className="absolute -top-3 -right-3 size-16 rounded-full border-2 border-dashed border-amber-300/40 sm:-top-4 sm:-right-4 sm:size-20" />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
