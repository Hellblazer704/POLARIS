// ─────────────────────────────────────────────────────────
// TypeScript Interfaces — Data Contracts
// ─────────────────────────────────────────────────────────

export type Topic = 'Economy' | 'Security' | 'Healthcare' | 'Infrastructure' | 'Governance' | 'Identity';
export type AlertType = 'CRISIS' | 'DRIFT' | 'INSTABILITY' | 'VIRALITY' | 'ACCELERATION';

export const TOPICS: Topic[] = ['Economy', 'Security', 'Healthcare', 'Infrastructure', 'Governance', 'Identity'];

export interface ConstituencyState {
    name: string;
    lat: number;
    lon: number;
    tier: 1 | 2 | 3;
    s: number;
    velocity: number;
    acceleration: number;
    volatility: number;
    stability_index: number;
    topic_salience: Record<Topic, number>;
    uncertainty: number;
    last_updated: string;
}

export interface Alert {
    id: string;
    type: AlertType;
    constituency: string;
    detail: string;
    timestamp: string;
    read: boolean;
}

export interface SimulationResult {
    target: string;
    ranked_strategies: {
        rank: number;
        name: string;
        score: number;
        predicted_reception: number;
        confidence: number;
        delta_volatility: number;
        trajectory: number[];
        description?: string;
    }[];
}

export interface OnboardingConfig {
    partyName: string;
    logo: string | null;
    ideology: number;
    primaryColor: string;
    languages: string[];
    states: string[];
    actors: {
        own: { name: string; twitter: string; facebook: string; youtube: string }[];
        opponents: { name: string; twitter: string; facebook: string; youtube: string }[];
    };
    constituencies: { name: string; lat: number; lon: number; tier: 1 | 2 | 3 }[];
    kernelSigma: number;
    topicAnchors: { topic: Topic; seeds: string[]; weight: number }[];
}

export interface SystemStatus {
    name: string;
    status: 'ok' | 'degraded' | 'down';
    lastPing: string;
}
