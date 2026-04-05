'use client'

import { motion } from 'framer-motion'
import { Shield, DollarSign, MapPin, Sliders, Phone, Star, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigationStore } from '@/store/useNavigationStore'

const features = [
  {
    icon: Shield,
    title: 'Seguridad Total',
    description:
      'Todos nuestros paquetes incluyen seguro de viaje completo. Tu tranquilidad es nuestra prioridad.',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
  },
  {
    icon: DollarSign,
    title: 'Mejor Precio',
    description:
      'Garantizamos los mejores precios del mercado. Si encuentras uno mejor, te igualamos.',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    icon: MapPin,
    title: 'Expertos Locales',
    description:
      'Nuestros guías son locales que conocen cada rincón de Colombia como nadie.',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    icon: Sliders,
    title: 'Personalización',
    description:
      'Cada viaje se adapta a tus gustos, presupuesto y ritmo. No hay paquetes rígidos.',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
  },
  {
    icon: Phone,
    title: 'Soporte 24/7',
    description:
      'Estamos contigo antes, durante y después de tu viaje. Siempre disponibles.',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
  },
  {
    icon: Star,
    title: '4.9 de calificación',
    description:
      'Más de 500 reseñas verificadas nos respaldan. La confianza de nuestros viajeros habla por nosotros.',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function WhyUsSection() {
  const { navigate } = useNavigationStore()

  return (
    <section id="why-us" className="bg-neutral-50">
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
            Lo que nos hace diferentes
          </p>
        </motion.div>

        {/* Image Banner */}
        <motion.div variants={itemVariants} className="mt-10 relative overflow-hidden rounded-2xl shadow-lg">
          <img
            src="/images/why-us.png"
            alt="¿Por qué viajar con WILROP?"
            className="w-full aspect-[21/9] object-cover sm:aspect-[3/1]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
        </motion.div>

        {/* Feature Cards */}
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="group rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg hover:border-neutral-300"
            >
              <div
                className={`flex size-12 items-center justify-center rounded-xl ${feature.iconBg} transition-transform duration-300 group-hover:scale-110`}
              >
                <feature.icon className={`size-6 ${feature.iconColor}`} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-neutral-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

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
