'use client'

import HeroSection from '@/components/portal/HeroSection'
import DestinationsSection from '@/components/portal/DestinationsSection'
import HotelPreviewSection from '@/components/portal/HotelPreviewSection'
import ExploreSection from '@/components/portal/ExploreSection'
import StartTravelSection from '@/components/portal/StartTravelSection'
import CruisesSection from '@/components/portal/CruisesSection'
import FounderSection from '@/components/portal/FounderSection'
import WhyUsSection from '@/components/portal/WhyUsSection'
import SocialSection from '@/components/portal/SocialSection'

export default function PublicPortalHome() {
  return (
    <>
      <HeroSection />
      <DestinationsSection limit={3} />
      <HotelPreviewSection />
      <ExploreSection />
      <StartTravelSection />
      <CruisesSection />
      <FounderSection />
      <WhyUsSection />
      <SocialSection />
    </>
  )
}