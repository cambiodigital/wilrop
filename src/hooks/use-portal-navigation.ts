'use client'

import { useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useNavigationStore, type HotelBookingData } from '@/store/useNavigationStore'
import { buildHotelBookingQuery, getPortalViewFromPath, portalPaths, type PortalView } from '@/lib/portal-routes'

export function usePortalNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const selectedPackageId = useNavigationStore((state) => state.selectedPackageId)
  const setSelectedPackageId = useNavigationStore((state) => state.setSelectedPackageId)
  const setHotelBookingData = useNavigationStore((state) => state.setHotelBookingData)

  const currentView = useMemo(() => getPortalViewFromPath(pathname), [pathname])

  const navigate = (view: PortalView | string, entityId?: string | null) => {
    switch (view) {
      case 'portal-home':
        router.push(portalPaths.home)
        return
      case 'portal-destinations':
        router.push(portalPaths.destinations)
        return
      case 'portal-hotels':
        router.push(portalPaths.hotels)
        return
      case 'portal-hotel-detail':
        router.push(entityId ? portalPaths.hotelDetail(entityId) : portalPaths.hotels)
        return
      case 'portal-about':
        router.push(portalPaths.about)
        return
      case 'portal-contact':
        router.push(portalPaths.contact)
        return
      case 'portal-package-detail':
        setSelectedPackageId(entityId ?? null)
        router.push(entityId ? portalPaths.packageDetail(entityId) : portalPaths.destinations)
        return
      case 'portal-booking': {
        const packageId = entityId ?? selectedPackageId
        setSelectedPackageId(packageId ?? null)
        router.push(packageId ? portalPaths.packageBooking(packageId) : portalPaths.destinations)
        return
      }
      case 'portal-excursion-detail':
        router.push(entityId ? portalPaths.excursionDetail(entityId) : portalPaths.excursions)
        return
      case 'portal-transport-detail':
        router.push(entityId ? portalPaths.transportDetail(entityId) : portalPaths.transport)
        return
      case 'portal-destination-detail':
        router.push(entityId ? portalPaths.destinationDetail(entityId) : portalPaths.destinations)
        return
      case 'portal-excursions':
        router.push(portalPaths.excursions)
        return
      case 'portal-transport':
        router.push(portalPaths.transport)
        return
      case 'portal-cruises':
        router.push(portalPaths.cruises)
        return
      case 'portal-cruise-detail':
        router.push(entityId ? portalPaths.cruiseDetail(entityId) : portalPaths.cruises)
        return
      case 'portal-cruise-booking':
        router.push(entityId ? portalPaths.cruiseBooking(entityId) : portalPaths.cruises)
        return
      case 'admin-login':
        router.push(portalPaths.adminLogin)
        return
      case 'reseller-login':
        router.push(portalPaths.resellerLogin)
        return
      case 'admin-dashboard':
        router.push('/admin')
        return
      case 'reseller-dashboard':
        router.push('/reseller')
        return
      default:
        if (view.startsWith('/')) {
          router.push(view)
          return
        }
        router.push(portalPaths.home)
    }
  }

  const navigateHotelBooking = (data: HotelBookingData) => {
    setHotelBookingData(data)
    const query = buildHotelBookingQuery(data)
    router.push(`${portalPaths.hotelBooking(data.hotelId)}${query ? `?${query}` : ''}`)
  }

  const goBack = (fallbackPath = portalPaths.home) => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }

    router.push(fallbackPath)
  }

  const openHotelDetail = (hotelId: string) => {
    router.push(portalPaths.hotelDetail(hotelId))
  }

  const openOrderDetail = (bookingCode: string) => {
    router.push(portalPaths.orderDetail(bookingCode))
  }

  return {
    currentView,
    goBack,
    navigate,
    navigateHotelBooking,
    openHotelDetail,
    openOrderDetail,
  }
}