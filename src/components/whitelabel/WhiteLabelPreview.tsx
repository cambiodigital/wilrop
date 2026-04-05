'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Globe,
  MapPin,
  Star,
  Clock,
  Heart,
  Phone,
  MessageCircle,
  Send,
  ChevronRight,
  Shield,
  Sparkles,
  Users,
  Plane,
  Check,
  Instagram,
  Facebook,
  Twitter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWhiteLabelStore } from '@/store/useWhiteLabelStore';
import { useNavigationStore } from '@/store/useNavigationStore';
import { destinations } from '@/data/destinations';
import { packages, formatPrice } from '@/data/packages';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function WhiteLabelPreview() {
  const { config } = useWhiteLabelStore();
  const navigate = useNavigationStore((s) => s.navigate);

  const selectedDestinations = destinations.filter((d) =>
    config.selectedDestinations.includes(d.id)
  );
  const selectedPackages = packages.filter((p) =>
    config.selectedDestinations.includes(p.destinationId)
  );

  const initials = config.storeName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-white">
      {/* Preview Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('reseller-whitelabel')}
              className="flex items-center gap-1.5 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver al Editor</span>
            </Button>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Eye className="w-3 h-3 mr-1" />
                Modo Previsualización
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="hidden sm:inline">Vista Previa de:</span>
            <span className="font-semibold text-foreground">{config.storeName}</span>
          </div>
          <Button
            size="sm"
            className="bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white border-0"
            onClick={() => {
              navigate('reseller-whitelabel');
            }}
          >
            <Globe className="w-4 h-4 mr-1.5" />
            Publicar Tienda
          </Button>
        </div>
      </div>

      {/* Store Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-14 z-40 transition-colors duration-300"
        style={{ backgroundColor: config.primaryColor }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg"
              style={{
                backgroundColor: `${config.accentColor}30`,
                border: `2px solid ${config.accentColor}60`,
              }}
            >
              {initials}
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">{config.storeName}</h1>
              <p className="text-white/70 text-xs">{config.slogan}</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {['Destinos', 'Paquetes', 'Ofertas', 'Contacto'].map((item) => (
              <button
                key={item}
                className="text-white/80 hover:text-white text-sm font-medium transition-colors"
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={config.whatsappNumber ? `https://wa.me/${config.whatsappNumber.replace(/[^0-9]/g, '')}` : '#'}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section
        {...fadeInUp}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${config.primaryColor}dd, ${config.secondaryColor}dd), url('/images/hero.png') center/cover`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-36">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl"
          >
            <Badge
              className="mb-4 text-xs text-white border-white/30"
              style={{ backgroundColor: `${config.accentColor}40`, backdropFilter: 'blur(8px)' }}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Tu agencia de confianza en Colombia
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Descubre los Mejores
              <br />
              <span style={{ color: config.accentColor }}>Destinos de Colombia</span>
            </h2>
            <p className="text-white/80 text-base sm:text-lg mb-8 max-w-lg">
              Experiencias únicas diseñadas para ti. Desde el Caribe hasta la Amazonía, 
              vive la magia de Colombia con nosotros.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="text-base font-semibold text-white border-0 shadow-xl"
                style={{ backgroundColor: config.accentColor }}
              >
                Explorar Paquetes
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base font-medium bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <Phone className="w-4 h-4 mr-2" />
                Contáctanos
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/20"
          >
            {[
              { value: '500+', label: 'Viajeros Felices', icon: Users },
              { value: `${selectedDestinations.length}`, label: 'Destinos', icon: MapPin },
              { value: '12+', label: 'Paquetes', icon: Plane },
              { value: '4.8★', label: 'Calificación', icon: Star },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2">
                <stat.icon className="w-5 h-5 text-white/60" />
                <div>
                  <div className="text-white font-bold text-lg">{stat.value}</div>
                  <div className="text-white/60 text-xs">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Destinations Grid */}
      <motion.section
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-7xl mx-auto px-4 sm:px-6 py-16"
      >
        <motion.div {...fadeInUp} className="text-center mb-10">
          <Badge variant="outline" className="mb-3 text-xs" style={{ borderColor: config.primaryColor, color: config.primaryColor }}>
            <MapPin className="w-3 h-3 mr-1" />
            Explora Colombia
          </Badge>
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Nuestros Destinos Destacados
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Desde playas caribeñas hasta selvas amazónicas, cada destino es una aventura única
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedDestinations.map((dest, index) => (
            <motion.div
              key={dest.id}
              variants={fadeInUp}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group relative rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Destination Image Placeholder */}
              <div
                className="h-48 flex flex-col items-center justify-center text-white relative"
                style={{
                  background: `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})`,
                }}
              >
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-4 right-4 w-20 h-20 rounded-full" style={{ backgroundColor: config.accentColor }} />
                  <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
                </div>
                <MapPin className="w-10 h-10 mb-2 relative z-10" />
                <span className="text-xl font-bold relative z-10">{dest.name}</span>
                <span className="text-sm text-white/70 relative z-10">{dest.region}</span>
                <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs text-white font-medium">{dest.rating}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {dest.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {dest.highlights.slice(0, 3).map((h) => (
                    <span
                      key={h}
                      className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: `${config.primaryColor}15`,
                        color: config.primaryColor,
                      }}
                    >
                      {h}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Desde <span className="font-bold text-base" style={{ color: config.secondaryColor }}>
                      {formatPrice(
                        Math.min(
                          ...packages
                            .filter((p) => p.destinationId === dest.id)
                            .map((p) => p.price)
                        )
                      )}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    className="text-xs"
                    style={{ backgroundColor: config.accentColor, color: 'white', border: 'none' }}
                  >
                    Ver Paquetes
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Packages Section */}
      <section className="bg-gradient-to-b from-muted/30 to-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div {...fadeInUp} className="text-center mb-10">
            <Badge variant="outline" className="mb-3 text-xs" style={{ borderColor: config.secondaryColor, color: config.secondaryColor }}>
              <Plane className="w-3 h-3 mr-1" />
              Paquetes Exclusivos
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Paquetes Populares
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Paquetes diseñados con todo incluido para que solo te preocupes por disfrutar
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {selectedPackages.map((pkg, index) => {
              const dest = destinations.find((d) => d.id === pkg.destinationId);
              const discount = Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100);
              return (
                <motion.div
                  key={pkg.id}
                  variants={fadeInUp}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="group bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Package Header */}
                  <div
                    className="relative h-36 flex items-center justify-center overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${config.secondaryColor}90, ${config.primaryColor}90)`,
                    }}
                  >
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full border-2 border-white" />
                      <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full border-2 border-white" />
                    </div>
                    <div className="text-center relative z-10">
                      <div className="text-white/70 text-xs font-medium mb-1">{dest?.region}</div>
                      <div className="text-white text-lg font-bold">{dest?.name}</div>
                      <div className="text-white/60 text-xs mt-1">{pkg.category}</div>
                    </div>
                    {discount > 0 && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        -{discount}%
                      </div>
                    )}
                  </div>

                  {/* Package Content */}
                  <div className="p-5">
                    <h4 className="font-bold text-base mb-1 text-foreground">{pkg.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{pkg.description}</p>

                    {/* Duration and Rating */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {pkg.duration}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{pkg.rating}</span>
                        <span className="text-muted-foreground">({Math.floor(pkg.rating * 20)})</span>
                      </div>
                    </div>

                    {/* Includes */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {pkg.includes.slice(0, 3).map((item) => (
                        <span
                          key={item}
                          className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                        >
                          <Check className="w-2.5 h-2.5" style={{ color: config.secondaryColor }} />
                          {item}
                        </span>
                      ))}
                      {pkg.includes.length > 3 && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          +{pkg.includes.length - 3} más
                        </span>
                      )}
                    </div>

                    {/* Price and CTA */}
                    <div className="flex items-end justify-between pt-3 border-t border-border">
                      <div>
                        <div className="text-xs text-muted-foreground line-through">
                          {formatPrice(pkg.originalPrice)}
                        </div>
                        <div className="text-xl font-bold" style={{ color: config.primaryColor }}>
                          {formatPrice(pkg.price)}
                        </div>
                        <div className="text-[11px] text-muted-foreground">por persona</div>
                      </div>
                      <Button
                        size="sm"
                        className="font-medium text-white border-0 shadow-md"
                        style={{ backgroundColor: config.accentColor }}
                      >
                        Reservar
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div {...fadeInUp} className="text-center mb-10">
            <h3 className="text-2xl font-bold text-foreground mb-2">¿Por Qué Elegirnos?</h3>
            <p className="text-muted-foreground">Viaja con la tranquilidad de estar en buenas manos</p>
          </motion.div>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                icon: Shield,
                title: 'Pago Seguro',
                description: 'Transacciones protegidas y garantía de reembolso',
              },
              {
                icon: Heart,
                title: 'Atención Personalizada',
                description: 'Soporte 24/7 antes, durante y después de tu viaje',
              },
              {
                icon: MapPin,
                title: 'Guias Locales',
                description: 'Expertos locales que conocen cada rincón',
              },
              {
                icon: Sparkles,
                title: 'Experiencias Únicas',
                description: 'Actividades exclusivas que no encontrarás en otro lado',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl border border-border hover:shadow-md transition-shadow"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 text-white"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  <feature.icon className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-sm mb-1">{feature.title}</h4>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* WhatsApp Contact Bar */}
      <section
        className="py-10 transition-colors duration-300"
        style={{ backgroundColor: config.secondaryColor }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <h4 className="text-white font-bold text-lg">¿Tienes Preguntas?</h4>
                <p className="text-white/70 text-sm">
                  {config.whatsappNumber
                    ? `Escríbenos al ${config.whatsappNumber}`
                    : 'Contáctanos por WhatsApp para una asesoría personalizada'}
                </p>
              </div>
            </div>
            <a
              href={config.whatsappNumber ? `https://wa.me/${config.whatsappNumber.replace(/[^0-9]/g, '')}` : '#'}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="bg-white hover:bg-white/90 shadow-lg border-0"
                style={{ color: config.secondaryColor }}
              >
                <Send className="w-4 h-4 mr-2" />
                Chatear por WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  {initials}
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg">{config.storeName}</h4>
                  <p className="text-sm text-white/50">{config.slogan}</p>
                </div>
              </div>
              <p className="text-sm text-white/50 max-w-sm mb-4">
                Tu agencia de viajes de confianza en Colombia. Experiencias únicas, 
                precios justos y atención excepcional.
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <Instagram className="w-4 h-4 text-white" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <Facebook className="w-4 h-4 text-white" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <Twitter className="w-4 h-4 text-white" />
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h5 className="text-white font-semibold text-sm mb-3">Destinos</h5>
              <ul className="space-y-2">
                {selectedDestinations.slice(0, 5).map((dest) => (
                  <li key={dest.id}>
                    <a href="#" className="text-sm text-white/50 hover:text-white transition-colors">
                      {dest.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-white font-semibold text-sm mb-3">Legal</h5>
              <ul className="space-y-2">
                {['Términos y Condiciones', 'Política de Privacidad', 'Política de Cancelación', 'Preguntas Frecuentes'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-white/50 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-white/40">
              © {new Date().getFullYear()} {config.storeName}. Todos los derechos reservados.
            </div>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <span>Powered by</span>
              <span className="font-semibold text-white/60">WILROP Colombia Travel</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Eye({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
