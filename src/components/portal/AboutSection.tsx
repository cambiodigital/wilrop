'use client'

import { motion } from 'framer-motion'
import {
  Shield,
  Compass,
  Heart,
  Leaf,
  Users,
  Globe,
  Award,
  MapPin,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { usePortalNavigation } from '@/hooks/use-portal-navigation'

const values = [
  {
    icon: Shield,
    title: 'Seguridad',
    description:
      'La seguridad de nuestros viajeros es nuestra máxima prioridad. Cada destino y actividad está rigurosamente evaluado.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Compass,
    title: 'Experiencia',
    description:
      'Más de 10 años creando experiencias de viaje únicas en Colombia con un equipo de expertos apasionados.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: Heart,
    title: 'Autenticidad',
    description:
      'Conectamos a los viajeros con la cultura local, las tradiciones y las comunidades de cada destino.',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
  {
    icon: Leaf,
    title: 'Sostenibilidad',
    description:
      'Comprometidos con el turismo responsable que beneficia a las comunidades y protege el medio ambiente.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
]

const team = [
  { name: 'Carolina Mejía', role: 'Fundadora & CEO', initials: 'CM' },
  { name: 'Andrés Ríos', role: 'Director de Operaciones', initials: 'AR' },
  { name: 'Valentina Duque', role: 'Diseñadora de Experiencias', initials: 'VD' },
  { name: 'Santiago Peña', role: 'Guía Principal', initials: 'SP' },
]

const achievements = [
  { icon: Users, value: '500+', label: 'Viajeros Felices' },
  { icon: Globe, value: '6', label: 'Destinos en Colombia' },
  { icon: Award, value: '10+', label: 'Años de Experiencia' },
  { icon: MapPin, value: '50+', label: 'Paquetes Disponibles' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
} as const

export default function AboutSection() {
  const { navigate } = usePortalNavigation()

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Badge variant="secondary" className="mb-4 rounded-full bg-amber-50 text-amber-700">
            Nuestra Historia
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Sobre WILROP Colombia Travel
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-neutral-500">
            Conectamos viajeros del mundo con la belleza, cultura y diversidad de Colombia
          </p>
        </motion.div>

        {/* Story Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-14 grid items-center gap-10 lg:grid-cols-2"
        >
          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl">
              <img
                src="/images/eje-cafetero.png"
                alt="WILROP Colombia Travel"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-4 rounded-2xl bg-amber-500 p-4 text-white shadow-lg sm:p-6">
              <p className="text-3xl font-extrabold">10+</p>
              <p className="text-sm text-amber-100">Años de Experiencia</p>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-neutral-900">
              Nuestra Pasión por Colombia
            </h3>
            <p className="mt-4 leading-relaxed text-neutral-600">
              WILROP Colombia Travel nació de la pasión por mostrar al mundo lo mejor de
              nuestro país. Desde las costas del Caribe hasta la selva amazónica, desde las
              montañas andinas hasta los valles cafeteros, diseñamos experiencias que
              transforman la forma de viajar.
            </p>
            <p className="mt-4 leading-relaxed text-neutral-600">
              Creemos que cada viaje es una oportunidad para conectar con culturas, crear
              recuerdos y contribuir al desarrollo de las comunidades locales. Nuestro
              equipo de expertos locales trabaja incansablemente para crear itinerarios que
              combinan aventura, cultura, gastronomía y descanso.
            </p>
          </div>
        </motion.div>

        {/* Values Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="mt-24 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {values.map((value) => (
            <motion.div key={value.title} variants={itemVariants}>
              <Card className="h-full border-neutral-200 p-0 text-center transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div
                    className={`mx-auto flex size-14 items-center justify-center rounded-xl ${value.bg}`}
                  >
                    <value.icon className={`size-7 ${value.color}`} />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-neutral-900">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-20 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-8 sm:p-12"
        >
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {achievements.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="mx-auto size-6 text-amber-100" />
                <p className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-amber-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Team */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-20 text-center"
        >
          <h3 className="text-2xl font-bold text-neutral-900">Nuestro Equipo</h3>
          <p className="mt-2 text-neutral-500">
            Apasionados por crear las mejores experiencias de viaje
          </p>
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {team.map((member) => (
              <div key={member.name} className="flex flex-col items-center">
                <div className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-lg font-bold text-white shadow-md">
                  {member.initials}
                </div>
                <p className="mt-3 text-sm font-semibold text-neutral-900">{member.name}</p>
                <p className="text-xs text-neutral-500">{member.role}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-20 text-center"
        >
          <h3 className="text-2xl font-bold text-neutral-900">
            ¿Listo para tu próxima aventura?
          </h3>
          <p className="mt-2 text-neutral-500">
            Explora nuestros paquetes y comienza a planificar tu viaje soñado
          </p>
          <Button
            onClick={() => navigate('portal-destinations')}
            className="mt-6 rounded-xl bg-amber-500 px-8 text-white hover:bg-amber-600"
            size="lg"
          >
            Explorar Destinos
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
