'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react'

interface ExcursionGalleryProps {
  images: string[]
  name: string
}

export default function ExcursionGallery({ images, name }: ExcursionGalleryProps) {
  const [currentIdx, setCurrentIdx] = useState(0)

  if (images.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
        <ImageIcon className="size-12 stroke-1 opacity-70" />
      </div>
    )
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIdx((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIdx((prev) => (prev + 1) % images.length)
  }

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden">
      <img
        src={images[currentIdx]}
        alt={`${name} - Imagen ${currentIdx + 1}`}
        className="h-full w-full object-cover transition-all duration-500"
      />
      
      {images.length > 1 && (
        <>
          {/* Navigation Controls */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition-all hover:bg-black/60 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center shadow-md border border-white/10"
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="size-5" />
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition-all hover:bg-black/60 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center shadow-md border border-white/10"
            aria-label="Siguiente imagen"
          >
            <ChevronRight className="size-5" />
          </button>

          {/* Indicator Index Badge */}
          <div className="absolute right-4 top-4 z-10 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xs shadow-xs border border-white/10">
            {currentIdx + 1} / {images.length}
          </div>
          
          {/* Slider dots */}
          <div className="absolute bottom-4 right-4 z-10 flex gap-1.5 bg-black/35 px-2.5 py-1.5 rounded-full backdrop-blur-xs">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIdx(idx)}
                className={`size-2 rounded-full transition-all duration-300 ${idx === currentIdx ? 'bg-amber-400 w-4' : 'bg-white/60 hover:bg-white'}`}
                aria-label={`Ir a imagen ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
