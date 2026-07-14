'use client';
import { useState, useCallback, useEffect } from 'react';
import {
  keepIdsPresentInOptions,
  normalizePackageDestinationOptions,
  normalizePackageRelationOptions,
  selectedIdsFromPackageRelations,
  type PackageCompositionSelection,
  type PackageDestinationOption,
  type PackageRelationOption,
} from '@/lib/admin/package-relation-ui';

interface RelationState {
  destinationOptions: PackageDestinationOption[];
  destinationsLoading: boolean;
  destinationsError: string | null;
  hotelOptions: PackageRelationOption[];
  roomTypeOptions: PackageRelationOption[];
  excursionOptions: PackageRelationOption[];
  transportOptions: PackageRelationOption[];
  selectorLoading: Record<string, boolean>;
  selectorErrors: Record<string, string | null>;
}


export function usePackageRelations(
  dialogOpen: boolean,
  destinationId: string,
  composition: PackageCompositionSelection,
  setComposition: React.Dispatch<React.SetStateAction<PackageCompositionSelection>>,
  setForm: React.Dispatch<React.SetStateAction<any>>,
  setResellers: React.Dispatch<React.SetStateAction<any[]>>,
) {
  const [state, setState] = useState<RelationState>({
    destinationOptions: [], destinationsLoading: false, destinationsError: null,
    hotelOptions: [], roomTypeOptions: [], excursionOptions: [], transportOptions: [],
    selectorLoading: {}, selectorErrors: {},
  });

  const selectedHotelForRoomTypes = composition.hotelIds[0];

  const fetchDestinationOptions = useCallback(async () => {
    setState((s) => ({ ...s, destinationsLoading: true, destinationsError: null }));
    try {
      const res = await fetch('/api/admin/relation-options/destinations?active=all');
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) throw new Error(json.error || 'Error al cargar destinos');
      setState((s) => ({ ...s, destinationOptions: normalizePackageDestinationOptions(json) }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar destinos';
      setState((s) => ({ ...s, destinationsError: msg }));
    } finally {
      setState((s) => ({ ...s, destinationsLoading: false }));
    }
  }, []);

  const fetchRelationOptions = useCallback(async (
    key: 'hotels' | 'roomTypes' | 'excursions' | 'transportServices',
    url: string,
    optionsKey: keyof Pick<RelationState, 'hotelOptions' | 'roomTypeOptions' | 'excursionOptions' | 'transportOptions'>,
  ) => {
    setState((s) => ({
      ...s,
      selectorLoading: { ...s.selectorLoading, [key]: true },
      selectorErrors: { ...s.selectorErrors, [key]: null },
    }));
    try {
      const res = await fetch(url);
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) throw new Error(json.error || 'Error al cargar opciones');
      setState((s) => ({ ...s, [optionsKey]: normalizePackageRelationOptions(json) }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar opciones';
      setState((s) => ({ ...s, selectorErrors: { ...s.selectorErrors, [key]: msg } }));
    } finally {
      setState((s) => ({ ...s, selectorLoading: { ...s.selectorLoading, [key]: false } }));
    }
  }, []);

  const fetchResellers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/resellers');
      if (!res.ok) throw new Error('Error al cargar revendedores');
      const json = await res.json();
      setResellers(json.data || json);
    } catch (err) {
      console.error(err);
    }
  }, [setResellers]);

  const fetchPackageDestinationRelation = useCallback(async (packageId: string) => {
    try {
      const res = await fetch(`/api/admin/packages/${packageId}/relations`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) return;
      const destination = json.data?.destinations?.[0]?.destination;
      setComposition((prev) => ({
        ...prev,
        hotelIds: selectedIdsFromPackageRelations(json.data, 'hotels', 'hotel'),
        roomTypeIds: selectedIdsFromPackageRelations(json.data, 'roomTypes', 'roomType'),
        excursionIds: selectedIdsFromPackageRelations(json.data, 'excursions', 'excursion'),
        transportServiceIds: selectedIdsFromPackageRelations(json.data, 'transportServices', 'transportService'),
      }));
      if (destination?.id && destination?.name) {
        setForm((prev: any) => ({ ...prev, destinationId: destination.id, destinationName: destination.name }));
        setComposition((prev) => ({ ...prev, destinationId: destination.id }));
      }
    } catch {
      // Keep legacy destination snapshots visible if relation loading fails.
    }
  }, [setComposition, setForm]);

  useEffect(() => {
    if (dialogOpen) { fetchDestinationOptions(); fetchResellers(); }
  }, [dialogOpen, fetchDestinationOptions, fetchResellers]);

  useEffect(() => {
    if (!dialogOpen) return;
    const q = destinationId ? `&destinationId=${encodeURIComponent(destinationId)}` : '';
    fetchRelationOptions('hotels', `/api/admin/relation-options/hotels?active=all${q}`, 'hotelOptions');
    fetchRelationOptions('excursions', `/api/admin/relation-options/excursions?active=all${q}`, 'excursionOptions');
    fetchRelationOptions('transportServices', `/api/admin/relation-options/transport-services?active=all${q}`, 'transportOptions');
  }, [dialogOpen, destinationId, fetchRelationOptions]);

  useEffect(() => {
    if (!dialogOpen) return;
    if (!selectedHotelForRoomTypes) { setState((s) => ({ ...s, roomTypeOptions: [] })); return; }
    fetchRelationOptions('roomTypes', `/api/admin/relation-options/room-types?active=all&hotelId=${encodeURIComponent(selectedHotelForRoomTypes)}`, 'roomTypeOptions');
  }, [dialogOpen, selectedHotelForRoomTypes, fetchRelationOptions]);

  useEffect(() => {
    setComposition((prev) => ({
      ...prev,
      hotelIds: keepIdsPresentInOptions(prev.hotelIds, state.hotelOptions),
      roomTypeIds: keepIdsPresentInOptions(prev.roomTypeIds, state.roomTypeOptions),
      excursionIds: keepIdsPresentInOptions(prev.excursionIds, state.excursionOptions),
      transportServiceIds: keepIdsPresentInOptions(prev.transportServiceIds, state.transportOptions),
    }));
  }, [state.hotelOptions, state.roomTypeOptions, state.excursionOptions, state.transportOptions, setComposition]);

  return {
    ...state,
    selectedHotelForRoomTypes,
    fetchDestinationOptions,
    fetchRelationOptions,
    fetchPackageDestinationRelation,
  };
}
