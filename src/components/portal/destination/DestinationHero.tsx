import { MapPin, Star } from 'lucide-react'

interface DestinationHeroProps {
  destination: {
    image: string
    name: string
    region: string
    rating: number
    reviewCount: number
    description: string
    highlights: string[]
  }
}

export default function DestinationHero({ destination }: DestinationHeroProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
      <div className="relative h-72 sm:h-96">
        <img
          src={destination.image}
          alt={destination.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
          <p className="text-xs uppercase tracking-widest text-white/80">Destino</p>
          <h1 className="mt-2 text-2xl font-bold sm:text-4xl">{destination.name}</h1>
          <div className="mt-3 flex items-center gap-4 text-sm text-white/90">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" />
              {destination.region}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Star className="size-4 fill-amber-300 text-amber-300" />
              {destination.rating.toFixed(1)} ({destination.reviewCount} reseñas)
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <p className="text-sm leading-relaxed text-neutral-600">{destination.description}</p>

        {destination.highlights && destination.highlights.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {destination.highlights.map((highlight: string) => (
              <span
                key={highlight}
                className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"
              >
                {highlight}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
