// ─────────────────────────────────────────────────────────
// Zustand Store — Global Platform State
// ─────────────────────────────────────────────────────────
import { create } from 'zustand';
import type { ConstituencyState, Alert, SimulationResult, OnboardingConfig } from '../types';
import { CONSTITUENCY_DATA, generateAlerts, generateHistory } from '../data/mockData';

interface PlatformState {
    config: OnboardingConfig | null;
    constituencies: Record<string, ConstituencyState>;
    alerts: Alert[];
    history: Record<string, number[]>;
    simResult: SimulationResult | null;
    wsStatus: 'connected' | 'disconnected' | 'reconnecting';
    lastUpdated: Date | null;
    selectedConstituency: string | null;
    strategyModalOpen: boolean;
    activeView: 'dashboard' | 'globe' | 'analytics' | 'alerts' | 'simulation' | 'correlation';

    // Actions
    setConfig: (config: OnboardingConfig) => void;
    updateConstituency: (name: string, state: ConstituencyState) => void;
    addAlert: (alert: Alert) => void;
    setSimResult: (result: SimulationResult | null) => void;
    setWsStatus: (status: 'connected' | 'disconnected' | 'reconnecting') => void;
    setHistory: (history: Record<string, number[]>) => void;
    resetAlerts: () => void;
    setSelectedConstituency: (name: string | null) => void;
    setStrategyModalOpen: (open: boolean) => void;
    setActiveView: (view: PlatformState['activeView']) => void;
}

export const usePlatformStore = create<PlatformState>((set) => ({
    config: null,
    constituencies: CONSTITUENCY_DATA,
    alerts: generateAlerts(),
    history: generateHistory(),
    simResult: null,
    wsStatus: 'disconnected',
    lastUpdated: null,
    selectedConstituency: null,
    strategyModalOpen: false,
    activeView: 'dashboard',

    setConfig: (config) => set({ config }),
    updateConstituency: (name, state) =>
        set((prev) => ({
            constituencies: { ...prev.constituencies, [name]: state },
            lastUpdated: new Date(),
        })),
    addAlert: (alert) =>
        set((prev) => ({
            alerts: [alert, ...prev.alerts].slice(0, 50),
        })),
    setSimResult: (result) => set({ simResult: result }),
    setWsStatus: (status) => set({ wsStatus: status }),
    setHistory: (history) => set({ history }),
    resetAlerts: () => set({ alerts: [] }),
    setSelectedConstituency: (name) => set({ selectedConstituency: name }),
    setStrategyModalOpen: (open) => set({ strategyModalOpen: open }),
    setActiveView: (view) => set({ activeView: view }),
}));
