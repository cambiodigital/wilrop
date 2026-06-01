'use client'

import { MapPin, Star, MessageCircle, Phone, Globe } from 'lucide-react'

interface BrandLandingProps {
  reseller: {
    id: string
    companyName: string
    logoUrl: string
  }
  hotels: Array<{
    id: string
    slug: string
    name: string
    cityName: string
    stars: number
    priceFrom: number
    images: string
  }>
  packages: Array<{
    id: string
    slug: string
    title: string
    destinationName: string
    duration: string
    price: number
    image: string
  }>
  excursions: Array<{
    id: string
    slug: string
    name: string
    destinationName: string
    basePrice: number
    duration: string
    images: string
  }>
  cruises: Array<{
    id: string
    slug: string
    name: string
    durationDays: number
    priceFrom: number
    images: string
  }>
  transportServices: Array<{
    id: string
    name: string
    cityName: string
    basePrice: number
  }>
  destinations: Array<{
    id: string
    slug: string
    name: string
    region: string
    image: string
    description: string
  }>
}

export default function BrandLanding({
  reseller,
  hotels,
  packages,
  excursions,
  destinations,
}: BrandLandingProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {reseller.logoUrl ? (
              <img
                src={reseller.logoUrl}
                alt={reseller.companyName}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-sm font-bold">
                {reseller.companyName[0]?.toUpperCase() || 'B'}
              </div>
            )}
            <span className="text-lg font-semibold">{reseller.companyName}</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="#destinos"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Destinos
            </a>
            <a
              href="#paquetes"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Paquetes
            </a>
            <a
              href="#hoteles"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Hoteles
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-20 px-4 text-center bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="max-w-3xl mx-auto">
            {reseller.logoUrl && (
              <img
                src={reseller.logoUrl}
                alt={reseller.companyName}
                className="h-16 mx-auto mb-6 object-contain"
              />
            )}
            <h1 className="text-4xl font-bold mb-4">{reseller.companyName}</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Descubre los mejores destinos de Colombia
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Globe className="w-4 h-4" />
              <span>Tu agencia de viajes de confianza</span>
            </div>
          </div>
        </section>

        {/* Destinations */}
        {destinations.length > 0 && (
          <section id="destinos" className="py-16 px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold mb-8 text-center">Destinos Destacados</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {destinations.map((dest) => (
                  <div
                    key={dest.id}
                    className="rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow"
                  >
                    <div className="h-48 bg-muted flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-1">{dest.name}</h3>
                      <p className="text-sm text-muted-foreground">{dest.region}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Packages */}
        {packages.length > 0 && (
          <section id="paquetes" className="py-16 px-4 bg-muted/30">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold mb-8 text-center">Paquetes Disponibles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="rounded-xl overflow-hidden border border-border bg-white hover:shadow-lg transition-shadow"
                  >
                    <div className="h-40 bg-muted flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-1">{pkg.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{pkg.destinationName}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{pkg.duration}</span>
                        <span className="text-lg font-bold text-primary">
                          ${pkg.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Hotels */}
        {hotels.length > 0 && (
          <section id="hoteles" className="py-16 px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold mb-8 text-center">Hoteles Recomendados</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    className="rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow"
                  >
                    <div className="p-4">
                      <h3 className="font-semibold mb-1">{hotel.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{hotel.cityName}</p>
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: hotel.stars }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      {hotel.priceFrom > 0 && (
                        <span className="text-lg font-bold text-primary">
                          Desde ${hotel.priceFrom.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Excursions */}
        {excursions.length > 0 && (
          <section className="py-16 px-4 bg-muted/30">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold mb-8 text-center">Excursiones</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {excursions.map((exc) => (
                  <div
                    key={exc.id}
                    className="rounded-xl overflow-hidden border border-border bg-white hover:shadow-lg transition-shadow"
                  >
                    <div className="p-4">
                      <h3 className="font-semibold mb-1">{exc.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{exc.destinationName}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{exc.duration}</span>
                        <span className="text-lg font-bold text-primary">
                          ${exc.basePrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Empty state */}
        {destinations.length === 0 &&
          packages.length === 0 &&
          hotels.length === 0 &&
          excursions.length === 0 && (
            <section className="py-20 px-4 text-center">
              <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Próximamente</h2>
              <p className="text-muted-foreground">
                Esta agencia está configurando su catálogo. ¡Vuelve pronto!
              </p>
            </section>
          )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-4 text-center">
        <p className="text-xs text-muted-foreground">
          Powered by WILROP Colombia Travel
        </p>
      </footer>
    </div>
  )
}
