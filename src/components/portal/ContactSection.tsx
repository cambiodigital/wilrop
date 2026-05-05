'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Instagram,
  Facebook,
  Twitter,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { brand } from '@/lib/brand'
import { supportWhatsAppUrl } from '@/lib/contact'

const contactInfo = [
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: brand.phone,
    href: supportWhatsAppUrl,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: Mail,
    label: 'Email',
    value: brand.supportEmail,
    href: `mailto:${brand.supportEmail}`,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: MapPin,
    label: 'Dirección',
    value: brand.address,
    href: '#',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Clock,
    label: 'Horario',
    value: 'Lun-Vie: 8am - 6pm | Sáb: 9am - 2pm',
    href: '#',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
]

const socialLinks = [
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Facebook, label: 'Facebook', href: '#' },
  { icon: Twitter, label: 'Twitter', href: '#' },
]

export default function ContactSection() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [sending, setSending] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)

    // Simulate form submission
    setTimeout(() => {
      setSending(false)
      setFormData({ name: '', email: '', phone: '', message: '' })
      toast({
        title: '¡Mensaje enviado!',
        description: 'Te responderemos en menos de 24 horas.',
      })
    }, 1000)
  }

  return (
    <section id="contact" className="py-20 bg-neutral-50">
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
            Contáctanos
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            ¿Tienes Preguntas?
          </h2>
          <p className="mt-3 text-lg text-neutral-500">
            Estamos aquí para ayudarte a planificar tu viaje perfecto
          </p>
        </motion.div>

        <div className="mt-14 grid gap-8 lg:grid-cols-5">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3"
          >
            <Card className="border-neutral-200 p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-neutral-900">
                Envíanos un Mensaje
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Completa el formulario y nos pondremos en contacto contigo
              </p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="contact-name">Nombre</Label>
                    <Input
                      id="contact-name"
                      placeholder="Tu nombre completo"
                      className="mt-1.5 rounded-xl"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-email">Correo Electrónico</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="tu@email.com"
                      className="mt-1.5 rounded-xl"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="contact-phone">Teléfono (opcional)</Label>
                  <Input
                    id="contact-phone"
                    placeholder="+57 300 123 4567"
                    className="mt-1.5 rounded-xl"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="contact-message">Mensaje</Label>
                  <Textarea
                    id="contact-message"
                    placeholder="¿En qué podemos ayudarte?"
                    className="mt-1.5 rounded-xl"
                    rows={5}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={sending}
                  className="w-full rounded-xl bg-amber-500 text-white hover:bg-amber-600 sm:w-auto"
                >
                  <Send className="mr-2 size-4" />
                  {sending ? 'Enviando...' : 'Enviar Mensaje'}
                </Button>
              </form>
            </Card>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="space-y-4">
              {contactInfo.map((info) => (
                <a
                  key={info.label}
                  href={info.href}
                  target={info.href.startsWith('http') ? '_blank' : undefined}
                  rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  <Card className="border-neutral-200 p-4 transition-all hover:shadow-md">
                    <CardContent className="flex items-center gap-4 p-0">
                      <div
                        className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${info.bg}`}
                      >
                        <info.icon className={`size-5 ${info.color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-neutral-400">
                          {info.label}
                        </p>
                        <p className="text-sm font-medium text-neutral-800 truncate">
                          {info.value}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ))}

              {/* Social Links */}
              <Card className="border-neutral-200 p-4">
                <CardContent className="p-0">
                  <p className="mb-3 text-sm font-medium text-neutral-500">
                    Síguenos en redes sociales
                  </p>
                  <div className="flex gap-3">
                    {socialLinks.map((social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        className="flex size-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 transition-colors hover:bg-amber-50 hover:text-amber-600"
                      >
                        <social.icon className="size-5" />
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Map Placeholder */}
              <Card className="border-neutral-200 overflow-hidden p-0">
                <div className="flex h-48 items-center justify-center bg-neutral-100">
                  <div className="text-center">
                    <MapPin className="mx-auto size-8 text-neutral-300" />
                    <p className="mt-2 text-sm text-neutral-400">Mapa de Bogotá</p>
                    <p className="text-xs text-neutral-300">Calle 72 #10-34</p>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
