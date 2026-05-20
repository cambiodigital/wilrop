'use client'

import { motion } from 'framer-motion'
import { Umbrella, Mountain, Landmark, Globe, Briefcase, Clock, Users } from 'lucide-react'
import { usePortalNavigation } from '@/hooks/use-portal-navigation'
import { useState, useEffect } from 'react'

const categories = [
  {
    icon: Umbrella,
    title: 'Playa y Sol',
    subtitle: '12 paquetes',
    color: 'from-sky-400/20 to-blue-500/20',
    iconBg: 'bg-sky-500/20',
    iconColor: 'text-sky-300',
  },
  {
    icon: Mountain,
    title: 'Aventura y Naturaleza',
    subtitle: '12 paquetes',
    color: 'from-emerald-400/20 to-green-500/20',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-300',
  },
  {
    icon: Landmark,
    title: 'Cultura y Historia',
    subtitle: '12 paquetes',
    color: 'from-amber-400/20 to-orange-500/20',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-300',
  },
]

const defaultStats = [
  { value: '—', label: 'destinos', icon: Globe },
  { value: '—', label: 'paquetes', icon: Briefcase },
  { value: '—', label: 'años de experiencia', icon: Clock },
  { value: '—', label: 'viajeros', icon: Users },
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

export default function ExploreSection() {
  const { navigate } = usePortalNavigation()
  const [stats, setStats] = useState(defaultStats)
  const [categoriesData, setCategoriesData] = useState(categories)

  useEffect(() => {
    fetch('/api/public/stats')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          const { totalDestinations, totalPackages, totalBookings } = res.data
          setStats([
            { value: `${totalDestinations || 0}+`, label: 'destinos', icon: Globe },
            { value: `${totalPackages || 0}+`, label: 'paquetes', icon: Briefcase },
            { value: '15+', label: 'años de experiencia', icon: Clock },
            { value: `${totalBookings || 0}+`, label: 'viajeros', icon: Users },
          ])
          setCategoriesData([
            { ...categories[0], subtitle: `${totalPackages || 0} paquetes` },
            { ...categories[1], subtitle: `${totalPackages || 0} paquetes` },
            { ...categories[2], subtitle: `${totalPackages || 0} paquetes` },
          ])
        }
      })
      .catch((err) => console.error('Error fetching stats:', err))
  }, [])

  return (
    <section id="explore" className="relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/explore.png')" }}
      />
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
      >
        {/* Heading */}
        <motion.div variants={itemVariants} className="text-center">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            ¡Explora el{' '}
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
              mundo
            </span>
            !
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base text-white/70 sm:text-lg lg:text-xl">
            Te ayudamos a planear la aventura de tus sueños. Desde las playas del
            Caribe hasta la selva amazónica, tu próxima gran experiencia está a un
            clic.
          </p>
        </motion.div>

        {/* Category Cards */}
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {categoriesData.map((cat) => (
            <motion.div
              key={cat.title}
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -4 }}
              className="group cursor-pointer rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-md transition-colors hover:border-amber-400/30 hover:bg-white/15"
              onClick={() => navigate('portal-destinations')}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${cat.iconBg}`}
                >
                  <cat.icon className={`size-6 ${cat.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white">{cat.title}</h3>
                  <p className="mt-0.5 text-sm text-white/50">{cat.subtitle}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-amber-300 transition-colors group-hover:text-amber-200">
                Explorar
                <motion.span
                  className="inline-block"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                >
                  →
                </motion.span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Strip */}
        <motion.div
          variants={itemVariants}
          className="mt-16 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-5 backdrop-blur-sm"
            >
              <stat.icon className="size-4 text-amber-400" />
              <span className="text-2xl font-bold text-white">{stat.value}</span>
              <span className="text-xs text-white/50 font-medium">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
