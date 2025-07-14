import { useState, useEffect } from 'react';
import { PersonaType, PersonaConfig, getPersonaConfig, DEFAULT_PERSONA } from '../constants/personas';

interface DemoPersona {
  id: string;
  name: string;
  role: string;
  email: string;
  permissions: string[];
  defaultDashboard: string;
  avatar: string;
  department: string;
  joinDate: string;
  lastLogin: string;
}

export const usePersona = () => {
  const [currentPersona, setCurrentPersona] = useState<DemoPersona | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize with default persona
    const defaultPersonaConfig = getPersonaConfig(DEFAULT_PERSONA);
    const demoPersona: DemoPersona = {
      id: defaultPersonaConfig.id,
      name: defaultPersonaConfig.name,
      role: defaultPersonaConfig.title,
      email: `${defaultPersonaConfig.name.toLowerCase().replace(' ', '.')}@demobank.com`,
      permissions: Object.entries(defaultPersonaConfig.permissions)
        .filter(([_, value]) => value)
        .map(([key, _]) => key.replace('can', '').toLowerCase()),
      defaultDashboard: defaultPersonaConfig.defaultRoute.replace('/', ''),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${defaultPersonaConfig.name}`,
      department: defaultPersonaConfig.title,
      joinDate: '2020-01-15',
      lastLogin: new Date().toISOString(),
    };
    
    setCurrentPersona(demoPersona);
    setLoading(false);
  }, []);

  const switchPersona = (persona: DemoPersona) => {
    setCurrentPersona(persona);
  };

  return {
    currentPersona,
    loading,
    switchPersona,
  };
};