// ─── Types ───────────────────────────────────────────────────────

export interface TransportProvider {
  id: string;
  name: string;
  legalName: string;
  nit: string;
  phone: string;
  email: string;
  vehicleType: string;
  capacity: number;
  active: boolean;
  _count?: { services: number };
}

export interface TransportService {
  id: string;
  providerId: string;
  name: string;
  routeType: string;
  origin: string;
  destination: string;
  cityId: string;
  cityName: string;
  originDestinationId?: string | null;
  destinationDestinationId?: string | null;
  durationMins: number;
  basePrice: number;
  pricePerExtra: number;
  includes: string[];
  notes: string;
  active: boolean;
  resellerId?: string | null;
  provider?: { id: string; name: string; vehicleType: string; capacity: number };
}

// ─── Mappings ────────────────────────────────────────────────────

export const vehicleTypeLabels: Record<string, string> = {
  auto: 'Auto',
  van: 'Van',
  bus: 'Buseta',
  suv: 'SUV',
};

export const routeTypeLabels: Record<string, string> = {
  'aeropuerto-hotel': 'Aeropuerto → Hotel',
  'hotel-aeropuerto': 'Hotel → Aeropuerto',
  'punto-a-punto': 'Punto a Punto',
  'ciudad-a-ciudad': 'Ciudad a Ciudad',
};

// ─── Default Forms ───────────────────────────────────────────────

export const emptyProvider = {
  name: '',
  legalName: '',
  nit: '',
  phone: '',
  email: '',
  vehicleType: 'auto',
  capacity: 4,
  active: true,
};

export const emptyService = {
  providerId: '',
  name: '',
  routeType: 'aeropuerto-hotel',
  origin: '',
  destination: '',
  cityId: '',
  cityName: '',
  originDestinationId: '',
  destinationDestinationId: '',
  durationMins: 60,
  basePrice: 0,
  pricePerExtra: 0,
  includes: [] as string[],
  notes: '',
  active: true,
  resellerId: '',
};
