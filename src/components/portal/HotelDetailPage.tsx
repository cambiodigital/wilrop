'use client'

import HotelDetailContent from '@/components/portal/HotelDetailContent'
import type { Hotel } from '@/data/hotels'
import { usePortalNavigation } from '@/hooks/use-portal-navigation'

interface HotelDetailPageProps {
  hotel: Hotel
}

export default function HotelDetailPage({ hotel }: HotelDetailPageProps) {
  const { goBack, navigateHotelBooking } = usePortalNavigation()

  return (
    <HotelDetailContent
      hotel={hotel}
      nights={1}
      totalGuests={1}
      checkIn=""
      checkOut=""
      onBack={() => goBack()}
      onSelectRoom={(room) =>
        navigateHotelBooking({
          hotelId: hotel.id,
          roomId: room.id,
          checkIn: '',
          checkOut: '',
          adults: 1,
          children: 0,
          childrenAges: [],
        })
      }
    />
  )
}