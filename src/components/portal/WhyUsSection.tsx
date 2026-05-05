'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePortalNavigation } from '@/hooks/use-portal-navigation'
import { teamAssets } from '@/lib/team'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function WhyUsSection() {
  const { navigate } = usePortalNavigation()
  const photos = teamAssets.whyUsPhotos

  return (
    <section id="why-us" className="bg-brand-surface-light">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.05 }}
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28"
      >
        {/* Section Header */}
        <motion.div variants={itemVariants} className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
            ¿Por qué viajar con{' '}
            <span className="bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
              nosotros
            </span>
            ?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-neutral-500 sm:text-lg">
            Conoce al equipo que hace posible cada viaje
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-10">
          <div className="grid gap-4 overflow-hidden rounded-2xl shadow-lg sm:grid-cols-3">
            {photos.map((photo) => (
              <motion.div key={photo.imageSrc} variants={itemVariants} className="relative aspect-[4/5] sm:aspect-[3/4]">
                <img src={photo.imageSrc} alt={photo.alt} className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="text-base font-semibold leading-tight">{photo.name}</p>
                  <p className="mt-1 text-sm text-white/85">{photo.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div variants={itemVariants} className="mt-12 text-center">
          <Button
            onClick={() => navigate('portal-destinations')}
            className="rounded-xl bg-amber-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all duration-300 hover:bg-amber-600 hover:shadow-xl hover:shadow-amber-500/35 active:scale-[0.97]"
          >
            Reserva tu viaje con confianza
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </motion.div>
      </motion.div>
    </section>
  )
}
