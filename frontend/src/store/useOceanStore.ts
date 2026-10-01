import { create } from 'zustand';
import type { Comparison, Insight, Observation, Region, Variable } from '../types';

export type Screen =
  | 'login'
  | 'home'
  | 'twin'
  | 'ocean-info'
  | 'region-info'
  | 'variable-info'
  | 'observations'
  | 'insights'
  | 'analytics';

type User = { id: string; display_name: string; guest?: boolean };

type State = {
  screen: Screen;
  user?: User;
  regions: Region[];
  variables: Variable[];
  regionId: string;
  variableId: string;
  depth: number;
  time: string;
  showObservations: boolean;
  dive: boolean;
  selectedObservation?: Observation;
  comparison?: Comparison;
  insight?: Insight;
  set: <K extends keyof State>(k: K, v: State[K]) => void;
  reset: () => void;
  signOut: () => void;
};

const STORAGE_KEY = 'oceanx-session-v7';
const defaults = {
  screen: 'login' as Screen,
  regionId: '',
  variableId: '',
  depth: 0,
  time: '2026-09-28T00:00:00Z',
  showObservations: true,
  dive: false,
};

function readSession(): Partial<State> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const rawSaved = typeof window !== 'undefined' ? readSession() : {};
const saved: Partial<State> = { ...rawSaved, variableId: '' };


export const useOceanStore = create<State>((set) => ({
  ...defaults,
  ...saved,
  regions: [],
  variables: [],
  set: (key, value) => set({ [key]: value } as Partial<State>),
  reset: () => set({ ...defaults }),
  signOut: () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* storage may be unavailable */ }
    set({ ...defaults, user: undefined });
  },
}));

if (typeof window !== 'undefined') {
  useOceanStore.subscribe((state) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        screen: state.screen,
        user: state.user,
        regionId: state.regionId,
        variableId: state.variableId,
        depth: state.depth,
        time: state.time,
        showObservations: state.showObservations,
        dive: state.dive,
      }));
    } catch { /* ignore storage errors */ }
  });
}
