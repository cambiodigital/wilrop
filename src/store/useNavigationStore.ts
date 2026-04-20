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

export interface SubagentSession {
  id: string;
  name: string;
  code: string;
  commission: number;
}

interface NavigationState {
  selectedPackageId: string | null;
  hotelBookingData: HotelBookingData | null;
  isResellerLoggedIn: boolean;
  resellerName: string;
  isAdminLoggedIn: boolean;
  adminName: string;
  isSubagentLoggedIn: boolean;
  subagentId: string;
  subagentName: string;
  subagentCode: string;
  subagentCommission: number;
  setSelectedPackageId: (packageId: string | null) => void;
  setHotelBookingData: (data: HotelBookingData | null) => void;
  loginReseller: (name: string) => void;
  logoutReseller: () => void;
  loginAdmin: (name: string) => void;
  logoutAdmin: () => void;
  loginSubagent: (session: SubagentSession) => void;
  logoutSubagent: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  selectedPackageId: null,
  hotelBookingData: null,
  isResellerLoggedIn: false,
  resellerName: '',
  isAdminLoggedIn: false,
  adminName: '',
  isSubagentLoggedIn: false,
  subagentId: '',
  subagentName: '',
  subagentCode: '',
  subagentCommission: 0,

  setSelectedPackageId: (packageId: string | null) => {
    set({ selectedPackageId: packageId });
  },

  setHotelBookingData: (data: HotelBookingData | null) => {
    set({ hotelBookingData: data });
  },

  loginReseller: (name: string) => {
    set({
      isResellerLoggedIn: true,
      resellerName: name,
    });
  },

  logoutReseller: () => {
    set({
      isResellerLoggedIn: false,
      resellerName: '',
      selectedPackageId: null,
      hotelBookingData: null,
    });
  },

  loginAdmin: (name: string) => {
    set({
      isAdminLoggedIn: true,
      adminName: name,
    });
  },

  logoutAdmin: () => {
    set({
      isAdminLoggedIn: false,
      adminName: '',
      selectedPackageId: null,
      hotelBookingData: null,
    });
  },

  loginSubagent: (session: SubagentSession) => {
    set({
      isSubagentLoggedIn: true,
      subagentId: session.id,
      subagentName: session.name,
      subagentCode: session.code,
      subagentCommission: session.commission,
    });
  },

  logoutSubagent: () => {
    set({
      isSubagentLoggedIn: false,
      subagentId: '',
      subagentName: '',
      subagentCode: '',
      subagentCommission: 0,
      selectedPackageId: null,
      hotelBookingData: null,
    });
  },
}));
