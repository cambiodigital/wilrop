'use client'

import { motion } from 'framer-motion'
import { Award, Users, MapPin, ThumbsUp, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { teamAssets } from '@/lib/team'

const stats = [
  { value: '15+', label: 'años', icon: Award },
  { value: '10,000+', label: 'viajeros', icon: Users },
  { value: '25+', label: 'destinos', icon: MapPin },
  { value: '98%', label: 'satisfacción', icon: ThumbsUp },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function FounderSection() {
  return (
    <section id="founder" className="relative bg-secondary text-white overflow-hidden">
      {/* Subtle gradient accent */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28"
      >
        <div className="grid grid-cols-1 gap-12 items-center lg:grid-cols-2 lg:gap-16">
          {/* Left – Portrait */}
          <motion.div variants={itemVariants} className="flex justify-center lg:justify-start">
            <div className="relative">
              <div className="overflow-hidden rounded-2xl border-2 border-amber-200/20 shadow-2xl shadow-black/30">
                <img
                  src={teamAssets.founder.imageSrc}
                  alt={`${teamAssets.founder.name} - Fundador de WILROP`}
                  className="aspect-[3/4] w-full max-w-sm object-cover lg:max-w-md"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-xl bg-amber-500/10 border border-amber-500/20 -z-10" />
              <div className="absolute -top-4 -left-4 h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 -z-10" />
            </div>
          </motion.div>

          {/* Right – Text */}
          <motion.div variants={itemVariants}>
            <p className="text-base text-neutral-500 sm:text-lg">Hola, soy</p>
            <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Wilson{' '}
              <span className="relative">
                <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
                  Bautista
                </span>
                <span className="absolute -bottom-2 left-0 h-1 w-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600" />
              </span>
            </h2>
            <p className="mt-4 text-base font-medium text-amber-400/80 sm:text-lg">
              {teamAssets.founder.roleLabel}
            </p>
            <p className="mt-5 text-base leading-relaxed text-neutral-400 sm:text-lg">
              Con más de 15 años de experiencia en el sector turístico, fundé WILROP
              con la misión de mostrar al mundo la belleza y diversidad de Colombia.
              Cada paquete que diseñamos nace de la pasión por crear recuerdos
              inolvidables.
            </p>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                >
                  <stat.icon className="size-4 text-amber-400" />
                  <p className="mt-2 text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-neutral-500 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              className="mt-8 rounded-xl border-white/20 bg-white/5 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/30 active:scale-[0.97]"
            >
              Conoce nuestra historia
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
