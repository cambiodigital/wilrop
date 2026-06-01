'use client';
import { formatCurrency } from '@/lib/currency'


import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bed, Bus, MapPin, Mountain, Package, Search, Star, Ship } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
;

interface HotelProduct {
  id: string;
  slug: string;
  name: string;
  cityName: string;
  stars: number;
  priceFrom: number;
  images: string[];
  rooms: Array<{ id: string; name: string; price: number; available?: number }>;
  featured: boolean;
}

interface ExcursionProduct {
  id: string;
  slug: string;
  name: string;
  destinationName: string;
  cityName: string;
  duration: string;
  basePrice: number;
  childPrice: number;
  category: string;
  featured: boolean;
  images: string[];
}

interface TransportProduct {
  id: string;
  name: string;
  routeType: string;
  origin: string;
  destination: string;
  cityName: string;
  durationMins: number;
  basePrice: number;
  provider?: { name: string; capacity: number; vehicleType: string };
}

interface CruiseProduct {
  id: string;
  slug: string;
  name: string;
  shipName: string;
  operator: string;
  durationDays: number;
  priceFrom: number;
  images: string[];
  featured: boolean;
  cabins: Array<{ id: string; name: string; basePrice: number }>;
}

const productTabs = [
  { value: 'hotels', label: 'Hoteles', icon: Bed },
  { value: 'excursions', label: 'Excursiones', icon: Mountain },
  { value: 'transport', label: 'Transporte', icon: Bus },
  { value: 'cruises', label: 'Cruceros', icon: Ship },
];

function includesSearch(values: string[], search: string) {
  const normalized = search.trim().toLowerCase();
  if (!normalized) return true;
  return values.some((value) => value.toLowerCase().includes(normalized));
}

function ProductImage({ src, alt, icon: Icon }: { src?: string; alt: string; icon: typeof Bed }) {
  return (
    <div className="relative h-36 overflow-hidden rounded-t-lg bg-neutral-100">
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-primary/10">
          <Icon className="size-10 text-primary/50" />
        </div>
      )}
    </div>
  );
}

export default function ResellerProducts() {
  const [hotels, setHotels] = useState<HotelProduct[]>([]);
  const [excursions, setExcursions] = useState<ExcursionProduct[]>([]);
  const [transport, setTransport] = useState<TransportProduct[]>([]);
  const [cruises, setCruises] = useState<CruiseProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [resellerCode, setResellerCode] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const [hotelRes, excursionRes, transportRes, cruiseRes] = await Promise.all([
          fetch('/api/public/hotels?resellerPanel=true'),
          fetch('/api/public/excursions?resellerPanel=true'),
          fetch('/api/public/transport?resellerPanel=true'),
          fetch('/api/public/cruises?resellerPanel=true'),
        ]);
        const [hotelJson, excursionJson, transportJson, cruiseJson] = await Promise.all([
          hotelRes.json(),
          excursionRes.json(),
          transportRes.json(),
          cruiseRes.json(),
        ]);
        if (hotelJson.success) setHotels(hotelJson.data);
        if (excursionJson.success) setExcursions(excursionJson.data);
        if (transportJson.success) setTransport(transportJson.data);
        if (cruiseJson.success) setCruises(cruiseJson.data);
      } finally {
        setLoading(false);
      }
    }

    async function fetchResellerCode() {
      try {
        const res = await fetch('/api/reseller/profile');
        const json = await res.json();
        if (json.success && json.data?.code) {
          setResellerCode(json.data.code);
        }
      } catch {
        // ignore — link will work without reseller context
      }
    }

    fetchProducts();
    fetchResellerCode();
  }, []);

  const filteredHotels = useMemo(
    () => hotels.filter((hotel) => includesSearch([hotel.name, hotel.cityName], search)),
    [hotels, search],
  );
  const filteredExcursions = useMemo(
    () => excursions.filter((excursion) => includesSearch([excursion.name, excursion.cityName, excursion.destinationName, excursion.category], search)),
    [excursions, search],
  );
  const filteredTransport = useMemo(
    () => transport.filter((service) => includesSearch([service.name, service.origin, service.destination, service.cityName], search)),
    [transport, search],
  );
  const filteredCruises = useMemo(
    () => cruises.filter((cruise) => includesSearch([cruise.name, cruise.shipName, cruise.operator], search)),
    [cruises, search],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos para Revender</h1>
          <p className="mt-1 text-sm text-gray-500">Productos activos disponibles para revender y armar paquetes personalizados.</p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href={resellerCode ? `/paquetes/armar?reseller=${resellerCode}` : '/paquetes/armar'}>
            <Package className="mr-2 size-4" />
            Armar paquete terrestre
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Bed className="size-8 rounded-lg bg-blue-100 p-1.5 text-blue-700" />
            <div>
              <p className="text-xl font-bold">{hotels.length}</p>
              <p className="text-xs text-gray-500">hoteles activos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Mountain className="size-8 rounded-lg bg-emerald-100 p-1.5 text-emerald-700" />
            <div>
              <p className="text-xl font-bold">{excursions.length}</p>
              <p className="text-xs text-gray-500">excursiones activas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Bus className="size-8 rounded-lg bg-amber-100 p-1.5 text-amber-700" />
            <div>
              <p className="text-xl font-bold">{transport.length}</p>
              <p className="text-xs text-gray-500">traslados activos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Ship className="size-8 rounded-lg bg-indigo-100 p-1.5 text-indigo-700" />
            <div>
              <p className="text-xl font-bold">{cruises.length}</p>
              <p className="text-xs text-gray-500">cruceros activos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por producto, ciudad o ruta" className="pl-10" />
      </div>

      <Tabs defaultValue="hotels">
        <TabsList className="bg-brand-section text-brand-text">
          {productTabs.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="gap-2 data-[state=active]:bg-brand-surface data-[state=active]:text-brand-text [&[data-state=active]]:font-semibold">
              <Icon className="size-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="hotels" className="mt-5">
          <ProductGrid loading={loading} empty={!filteredHotels.length}>
            {filteredHotels.map((hotel) => (
              <Card key={hotel.id} className="overflow-hidden">
                <ProductImage src={hotel.images[0]} alt={hotel.name} icon={Bed} />
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-gray-900">{hotel.name}</h2>
                      <p className="mt-1 flex items-center gap-1 text-xs text-gray-500"><MapPin className="size-3" />{hotel.cityName}</p>
                    </div>
                    {hotel.featured && <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Aliado</Badge>}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-amber-500">
                    {Array.from({ length: hotel.stars }).map((_, index) => <Star key={index} className="size-3 fill-current" />)}
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Desde {formatCurrency(hotel.priceFrom)} / noche</p>
                  <p className="text-xs text-gray-500">{hotel.rooms.length} tipos de habitacion cargados por admin</p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/hoteles/${hotel.slug}`}>Ver hotel</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </ProductGrid>
        </TabsContent>

        <TabsContent value="excursions" className="mt-5">
          <ProductGrid loading={loading} empty={!filteredExcursions.length}>
            {filteredExcursions.map((excursion) => (
              <Card key={excursion.id} className="overflow-hidden">
                <ProductImage src={excursion.images[0]} alt={excursion.name} icon={Mountain} />
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-gray-900">{excursion.name}</h2>
                      <p className="mt-1 text-xs text-gray-500">{excursion.cityName || excursion.destinationName} · {excursion.duration}</p>
                    </div>
                    <Badge variant="secondary">{excursion.category}</Badge>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Adulto {formatCurrency(excursion.basePrice)}</p>
                  {excursion.childPrice > 0 && <p className="text-xs text-gray-500">Nino {formatCurrency(excursion.childPrice)}</p>}
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/excursiones/${excursion.slug}`}>Ver excursion</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </ProductGrid>
        </TabsContent>

        <TabsContent value="transport" className="mt-5">
          <ProductGrid loading={loading} empty={!filteredTransport.length}>
            {filteredTransport.map((service) => (
              <Card key={service.id}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start gap-3">
                    <Bus className="size-9 rounded-lg bg-amber-100 p-2 text-amber-700" />
                    <div>
                      <h2 className="font-semibold text-gray-900">{service.name}</h2>
                      <p className="mt-1 text-xs text-gray-500">{service.origin} a {service.destination}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{service.cityName} · {service.durationMins} min · {service.provider?.capacity || 0} pax</p>
                  <p className="text-sm font-semibold text-gray-900">Desde {formatCurrency(service.basePrice)}</p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/transportes/${service.id}`}>Ver traslado</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </ProductGrid>
        </TabsContent>

        <TabsContent value="cruises" className="mt-5">
          <ProductGrid loading={loading} empty={!filteredCruises.length}>
            {filteredCruises.map((cruise) => (
              <Card key={cruise.id} className="overflow-hidden">
                <ProductImage src={cruise.images[0]} alt={cruise.name} icon={Ship} />
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-gray-900">{cruise.name}</h2>
                      <p className="mt-1 text-xs text-gray-500">{cruise.shipName} · {cruise.operator}</p>
                    </div>
                    {cruise.featured && <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Destacado</Badge>}
                  </div>
                  <p className="text-xs text-gray-500">{cruise.durationDays} días de duración</p>
                  <p className="text-sm font-semibold text-gray-900">Desde {formatCurrency(cruise.priceFrom)}</p>
                  <p className="text-xs text-gray-500">{cruise.cabins?.length || 0} categorías de cabina cargadas</p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/cruceros/${cruise.slug}`}>Ver crucero</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </ProductGrid>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

function ProductGrid({ children, loading, empty }: { children: React.ReactNode; loading: boolean; empty: boolean }) {
  if (loading) {
    return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-72 rounded-lg" />)}</div>;
  }

  if (empty) {
    return <div className="rounded-lg border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-500">No hay productos disponibles en esta categoría. Si esperabas ver productos, contacta al administrador para que los asigne a tu catálogo.</div>;
  }

  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>;
}
