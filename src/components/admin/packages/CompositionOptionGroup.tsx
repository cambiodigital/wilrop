'use client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RefreshCw, ExternalLink } from 'lucide-react';
import {
  getPackageRelationSelectorSmokeState,
  type PackageCompositionSelection,
  type PackageRelationOption,
} from '@/lib/admin/package-relation-ui';

interface Props {
  label: string;
  options: PackageRelationOption[];
  selectedIds: string[];
  selectionKey: keyof Omit<PackageCompositionSelection, 'destinationId'>;
  ctaHref: string;
  ctaLabel: string;
  disabledMessage?: string;
  selectorLoading: Record<string, boolean>;
  selectorErrors: Record<string, string | null>;
  onToggleComposition: (key: keyof Omit<PackageCompositionSelection, 'destinationId'>, id: string) => void;
  onRetryRelation: (key: string) => void;
}

const KEY_MAP: Record<string, string> = {
  hotelIds: 'hotels', roomTypeIds: 'roomTypes', excursionIds: 'excursions', transportServiceIds: 'transportServices',
};

export function CompositionOptionGroup({
  label, options, selectedIds, selectionKey, ctaHref, ctaLabel, disabledMessage,
  selectorLoading, selectorErrors, onToggleComposition, onRetryRelation,
}: Props) {
  const key = KEY_MAP[selectionKey] ?? selectionKey;
  const selectorState = getPackageRelationSelectorSmokeState({
    options, selectedIds, isLoading: Boolean(selectorLoading[key]),
    error: selectorErrors[key], disabledMessage, createCtaHref: ctaHref, createCtaLabel: ctaLabel,
  });
  return (
    <div className="rounded-md border border-border p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        {selectorState.hasRetry && (
          <Button type="button" variant="outline" size="sm" onClick={() => onRetryRelation(key)}>
            <RefreshCw className="w-3 h-3 mr-1" /> Reintentar
          </Button>
        )}
      </div>
      {selectorState.status === 'disabled' && <p className="text-xs text-muted-foreground">{selectorState.statusLabel}</p>}
      {selectorState.status === 'loading' && <p className="text-xs text-muted-foreground">{selectorState.statusLabel}</p>}
      {selectorState.status === 'error' && <p className="text-xs text-destructive">{selectorState.statusLabel}</p>}
      {selectorState.status === 'empty' && selectorState.createCta && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{selectorState.statusLabel}</span>
          <Button type="button" variant="outline" size="sm" asChild>
            <a href={selectorState.createCta.href}><ExternalLink className="w-3 h-3 mr-1" /> {selectorState.createCta.label}</a>
          </Button>
        </div>
      )}
      {selectorState.status === 'ready' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
          {selectorState.options.map((option) => (
            <label key={option.id} className="flex items-start gap-2 rounded border border-border/60 p-2 text-xs">
              <input type="checkbox" className="mt-0.5" checked={option.selected} onChange={() => onToggleComposition(selectionKey, option.id)} />
              <span>
                <span className="font-medium text-foreground">{option.label}</span>
                {option.subtitle && <span className="block text-muted-foreground">{option.subtitle}</span>}
                {option.stateLabel && <span className="block text-muted-foreground">{option.stateLabel}</span>}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
