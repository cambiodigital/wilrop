'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useNavigationStore } from '@/store/useNavigationStore';

// Portal components
import PortalHeader from '@/components/portal/PortalHeader';
import HeroSection from '@/components/portal/HeroSection';
import ExploreSection from '@/components/portal/ExploreSection';
import StartTravelSection from '@/components/portal/StartTravelSection';
import CruisesSection from '@/components/portal/CruisesSection';
import FounderSection from '@/components/portal/FounderSection';
import WhyUsSection from '@/components/portal/WhyUsSection';
import SocialSection from '@/components/portal/SocialSection';
import DestinationsSection from '@/components/portal/DestinationsSection';
import HotelPreviewSection from '@/components/portal/HotelPreviewSection';
import HotelsPage from '@/components/portal/HotelsPage';
import HotelBookingFlow from '@/components/portal/HotelBookingFlow';
import PackageDetail from '@/components/portal/PackageDetail';
import BookingFlow from '@/components/portal/BookingFlow';
import AboutSection from '@/components/portal/AboutSection';
import ContactSection from '@/components/portal/ContactSection';
import PortalFooter from '@/components/portal/PortalFooter';
import MarketingModalPopup from '@/components/portal/MarketingModalPopup';

// Reseller components
import ResellerLogin from '@/components/reseller/ResellerLogin';
import ResellerSidebar from '@/components/reseller/ResellerSidebar';
import ResellerDashboard from '@/components/reseller/ResellerDashboard';
import ResellerSales from '@/components/reseller/ResellerSales';
import ResellerCommissions from '@/components/reseller/ResellerCommissions';
import ResellerClients from '@/components/reseller/ResellerClients';

// White label components
import WhiteLabelCreator from '@/components/whitelabel/WhiteLabelCreator';
import WhiteLabelPreview from '@/components/whitelabel/WhiteLabelPreview';

// Admin components
import AdminLogin from '@/components/admin/AdminLogin';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminDestinations from '@/components/admin/AdminDestinations';
import AdminHotels from '@/components/admin/AdminHotels';
import AdminPackages from '@/components/admin/AdminPackages';
import AdminMarketingModal from '@/components/admin/AdminMarketingModal';

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

function PortalContent() {
  const currentView = useNavigationStore((s) => s.currentView);

  const renderContent = () => {
    switch (currentView) {
      case 'portal-home':
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
        );
      case 'portal-destinations':
        return <DestinationsSection />;
      case 'portal-package-detail':
        return <PackageDetail />;
      case 'portal-booking':
        return <BookingFlow />;
      case 'portal-about':
        return <AboutSection />;
      case 'portal-contact':
        return <ContactSection />;
      case 'portal-hotels':
        return <HotelsPage />;
      case 'portal-hotel-booking':
        return <HotelBookingFlow />;
      default:
        return <HeroSection />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PortalHeader />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div key={currentView} {...fadeIn}>
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
      <PortalFooter />
      <MarketingModalPopup />
    </div>
  );
}

function ResellerPanelContent() {
  const currentView = useNavigationStore((s) => s.currentView);

  switch (currentView) {
    case 'reseller-dashboard':
      return <ResellerDashboard />;
    case 'reseller-sales':
      return <ResellerSales />;
    case 'reseller-commissions':
      return <ResellerCommissions />;
    case 'reseller-clients':
      return <ResellerClients />;
    case 'reseller-whitelabel':
      return <WhiteLabelCreator />;
    case 'reseller-whitelabel-preview':
      return <WhiteLabelPreview />;
    default:
      return <ResellerDashboard />;
  }
}

function ResellerPanel() {
  return (
    <AnimatePresence mode="wait">
      <motion.div key="reseller-panel" {...fadeIn}>
        <ResellerSidebar>
          <ResellerPanelContent />
        </ResellerSidebar>
      </motion.div>
    </AnimatePresence>
  );
}

function AdminPanelContent() {
  const currentView = useNavigationStore((s) => s.currentView);

  switch (currentView) {
    case 'admin-dashboard':
      return <AdminDashboard />;
    case 'admin-destinations':
      return <AdminDestinations />;
    case 'admin-hotels':
      return <AdminHotels />;
    case 'admin-packages':
      return <AdminPackages />;
    case 'admin-marketing':
      return <AdminMarketingModal />;
    default:
      return <AdminDashboard />;
  }
}

function AdminPanel() {
  return (
    <AnimatePresence mode="wait">
      <motion.div key="admin-panel" {...fadeIn}>
        <AdminSidebar>
          <AdminPanelContent />
        </AdminSidebar>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Home() {
  const currentView = useNavigationStore((s) => s.currentView);

  if (currentView === 'admin-login') {
    return (
      <AnimatePresence mode="wait">
        <motion.div key="admin-login" {...fadeIn}>
          <AdminLogin />
        </motion.div>
      </AnimatePresence>
    );
  }

  if (currentView === 'reseller-login') {
    return (
      <AnimatePresence mode="wait">
        <motion.div key="reseller-login" {...fadeIn}>
          <ResellerLogin />
        </motion.div>
      </AnimatePresence>
    );
  }

  if (currentView.startsWith('admin-')) {
    return <AdminPanel />;
  }

  if (currentView.startsWith('reseller-')) {
    return <ResellerPanel />;
  }

  return <PortalContent />;
}
