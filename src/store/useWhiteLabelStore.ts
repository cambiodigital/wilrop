import { create } from 'zustand';

export interface WhiteLabelConfig {
  storeName: string;
  slogan: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  selectedDestinations: string[];
  whatsappNumber: string;
  commissionRate: number;
  subdomain: string;
}

interface WhiteLabelState {
  config: WhiteLabelConfig;
  updateConfig: (updates: Partial<WhiteLabelConfig>) => void;
  resetConfig: () => void;
  applyTheme: (theme: string) => void;
}

export const themes: Record<string, { primary: string; secondary: string; accent: string }> = {
  'Tropical': { primary: '#16a34a', secondary: '#eab308', accent: '#22c55e' },
  'Caribeño': { primary: '#0891b2', secondary: '#f43f5e', accent: '#06b6d4' },
  'Elegante': { primary: '#1F3556', secondary: '#C8A96A', accent: '#2C4770' },
  'Naturaleza': { primary: '#15803d', secondary: '#92400e', accent: '#4ade80' },
};

export const colorPresets = [
  { name: 'Gold', value: '#C8A96A' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Coral', value: '#ef4444' },
  { name: 'Navy', value: '#1e3a5f' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Orange', value: '#ea580c' },
];

const defaultConfig: WhiteLabelConfig = {
  storeName: 'Tu Agencia de Viajes',
  slogan: 'Tu puerta a los mejores destinos de Colombia',
  logoUrl: null,
  primaryColor: '#1F3556',
  secondaryColor: '#C8A96A',
  accentColor: '#2C4770',
  selectedDestinations: [],
  whatsappNumber: '',
  commissionRate: 12,
  subdomain: '',
};

export const useWhiteLabelStore = create<WhiteLabelState>((set) => ({
  config: { ...defaultConfig },
  updateConfig: (updates: Partial<WhiteLabelConfig>) => {
    set((state) => ({
      config: { ...state.config, ...updates },
    }));
  },
  resetConfig: () => {
    set({ config: { ...defaultConfig } });
  },
  applyTheme: (theme: string) => {
    const themeColors = themes[theme];
    if (themeColors) {
      set((state) => ({
        config: {
          ...state.config,
          primaryColor: themeColors.primary,
          secondaryColor: themeColors.secondary,
          accentColor: themeColors.accent,
        },
      }));
    }
  },
}));
