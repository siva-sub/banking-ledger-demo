/**
 * Persona Type Definitions
 * 
 * Type definitions for the persona system used in the demo.
 */

import { PersonaType, PersonaConfig, PersonaPermissions } from '../constants/personas';

export interface PersonaState {
  currentPersona: PersonaType;
  config: PersonaConfig;
  loading: boolean;
  error: string | null;
}

export interface PersonaContextType {
  state: PersonaState;
  switchPersona: (persona: PersonaType) => void;
  hasPermission: (permission: keyof PersonaPermissions) => boolean;
  getPersonaRoutes: () => Array<{
    path: string;
    label: string;
    icon: string;
  }>;
  resetPersona: () => void;
}

export interface PersonaManagerProps {
  currentPersona: PersonaType;
  onPersonaChange: (persona: PersonaType) => void;
}

export interface PersonaCardProps {
  persona: PersonaConfig;
  isSelected: boolean;
  onSelect: () => void;
}

export interface PersonaHeaderProps {
  persona: PersonaConfig;
  compact?: boolean;
}

export interface PersonaStats {
  totalUsers: number;
  activeUsers: number;
  lastActivity: Date;
  commonWorkflows: string[];
}

export interface PersonaPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'zh' | 'ms';
  dateFormat: string;
  currency: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard: {
    layout: string[];
    refreshInterval: number;
    defaultView: string;
  };
}

export interface PersonaSession {
  id: string;
  personaType: PersonaType;
  startTime: Date;
  lastActivity: Date;
  preferences: PersonaPreferences;
  workflowState: Record<string, any>;
}

export type PersonaAction = 
  | { type: 'SET_PERSONA'; payload: PersonaType }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_PERSONA' };

export type { PersonaType, PersonaConfig, PersonaPermissions };