'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Instagram, Facebook, Youtube, Music, Twitter, Star, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

const socialLinks = [
  { icon: Instagram, label: 'Instagram', href: '#', color: 'hover:bg-pink-500 hover:border-pink-500' },
  { icon: Facebook, label: 'Facebook', href: '#', color: 'hover:bg-blue-600 hover:border-blue-600' },
  { icon: Youtube, label: 'YouTube', href: '#', color: 'hover:bg-red-500 hover:border-red-500' },
  { icon: Music, label: 'TikTok', href: '#', color: 'hover:bg-neutral-100 hover:border-neutral-100 hover:text-black' },
  { icon: Twitter, label: 'Twitter', href: '#', color: 'hover:bg-sky-500 hover:border-sky-500' },
]

const testimonials = [
  {
    name: 'María Fernanda L.',
    location: 'Bogotá',
    initials: 'MF',
    color: 'bg-pink-500',
    review: 'El viaje a Cartagena fue increíble. Todo perfecto desde la reserva hasta el último día.',
    rating: 5,
  },
  {
    name: 'Carlos Andrés M.',
    location: 'Medellín',
    initials: 'CA',
    color: 'bg-sky-500',
    review: 'WILROP hizo que nuestra luna de miel fuera soñada. 100% recomendados.',
    rating: 5,
  },
  {
    name: 'Ana Sofía R.',
    location: 'Cali',
    initials: 'AS',
    color: 'bg-amber-500',
    review: 'El Eje Cafetero superó todas nuestras expectativas. Volveremos sin duda.',
    rating: 5,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function SocialSection() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    toast({
      title: '¡Gracias!',
      description: 'Te has suscrito exitosamente.',
    })
    setEmail('')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <section id="social" className="relative bg-neutral-900 text-white overflow-hidden">
      {/* Subtle background accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Síguenos y no te{' '}
            <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
              pierdas de nada
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base text-neutral-400 sm:text-lg">
            Conecta con nuestra comunidad de viajeros
          </p>
        </motion.div>

        {/* Social Icons */}
        <motion.div variants={itemVariants} className="mt-10 flex items-center justify-center gap-3 sm:gap-4">
          {socialLinks.map((social) => (
            <motion.a
              key={social.label}
              href={social.href}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              className={`flex size-12 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/70 backdrop-blur-sm transition-all duration-300 sm:size-14 ${social.color}`}
              aria-label={social.label}
            >
              <social.icon className="size-5 sm:size-6" />
            </motion.a>
          ))}
        </motion.div>

        {/* Newsletter Signup */}
        <motion.div variants={itemVariants} className="mx-auto mt-14 max-w-xl text-center">
          <h3 className="text-lg font-bold text-white sm:text-xl">
            Recibe ofertas exclusivas
          </h3>
          <p className="mt-2 text-sm text-neutral-400">
            Suscríbete y obtén descuentos especiales directamente en tu correo
          </p>
          <form onSubmit={handleSubscribe} className="mt-6 flex gap-3">
            <Input
              type="email"
              placeholder="Tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 flex-1 rounded-xl border-white/15 bg-white/10 text-sm text-white placeholder:text-neutral-500 backdrop-blur-sm transition-colors focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
            />
            <Button
              type="submit"
              className="shrink-0 rounded-xl bg-amber-500 px-6 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-600 hover:shadow-xl"
            >
              <Send className="mr-2 size-4" />
              Suscribirme
            </Button>
          </form>
        </motion.div>

        {/* Testimonials */}
        <motion.div variants={itemVariants} className="mt-16">
          <h3 className="text-center text-lg font-bold text-white sm:text-xl">
            Lo que dicen nuestros viajeros
          </h3>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={itemVariants}
                className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:bg-white/8"
              >
                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="size-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-neutral-300">
                  &ldquo;{t.review}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <div
                    className={`flex size-10 items-center justify-center rounded-full ${t.color} text-xs font-bold text-white`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-neutral-500">{t.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
