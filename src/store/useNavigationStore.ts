import { create } from 'zustand';

export interface HotelBookingData {
  hotelId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  childrenAges: number[];
}

interface NavigationState {
  currentView: string;
  previousView: string | null;
  selectedPackageId: string | null;
  hotelBookingData: HotelBookingData | null;
  isResellerLoggedIn: boolean;
  resellerName: string;
  isAdminLoggedIn: boolean;
  adminName: string;
  navigate: (view: string, packageId?: string | null) => void;
  navigateHotelBooking: (data: HotelBookingData) => void;
  goBack: () => void;
  loginReseller: (name: string) => void;
  logoutReseller: () => void;
  loginAdmin: (name: string) => void;
  logoutAdmin: () => void;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  currentView: 'portal-home',
  previousView: null,
  selectedPackageId: null,
  hotelBookingData: null,
  isResellerLoggedIn: false,
  resellerName: '',
  isAdminLoggedIn: false,
  adminName: '',

  navigate: (view: string, packageId?: string | null) => {
    const { currentView } = get();
    set({
      previousView: currentView,
      currentView: view,
      selectedPackageId: packageId ?? null,
    });
  },

  navigateHotelBooking: (data: HotelBookingData) => {
    const { currentView } = get();
    set({
      previousView: currentView,
      currentView: 'portal-hotel-booking',
      hotelBookingData: data,
    });
  },

  goBack: () => {
    const { previousView } = get();
    if (previousView) {
      set({ currentView: previousView, previousView: null });
    } else {
      set({ currentView: 'portal-home' });
    }
  },

  loginReseller: (name: string) => {
    set({
      isResellerLoggedIn: true,
      resellerName: name,
      currentView: 'reseller-dashboard',
      previousView: 'reseller-login',
    });
  },

  logoutReseller: () => {
    set({
      isResellerLoggedIn: false,
      resellerName: '',
      currentView: 'portal-home',
      previousView: null,
      selectedPackageId: null,
      hotelBookingData: null,
    });
  },

  loginAdmin: (name: string) => {
    set({
      isAdminLoggedIn: true,
      adminName: name,
      currentView: 'admin-dashboard',
      previousView: 'admin-login',
    });
  },

  logoutAdmin: () => {
    set({
      isAdminLoggedIn: false,
      adminName: '',
      currentView: 'portal-home',
      previousView: null,
      selectedPackageId: null,
      hotelBookingData: null,
    });
  },
}));
