import dayjs from 'dayjs';
import { DemoDataSettings } from './demoDataService';
import { generateComprehensiveDemoData } from './enhancedDemoDataService';

// Configuration profiles for different banking scenarios
export interface ConfigurationProfile {
  id: string;
  name: string;
  description: string;
  category: 'risk' | 'volume' | 'compliance' | 'demo';
  settings: Partial<DemoDataSettings>;
  additionalSettings: {
    validationStrictness: number;
    performanceMode: 'realtime' | 'balanced' | 'efficient';
    errorSimulation: boolean;
    complianceAlerts: boolean;
    auditTrail: boolean;
    scenarioComplexity: 'simple' | 'moderate' | 'complex';
    regulatoryFocus: string[];
  };
  metrics: {
    estimatedGenTime: number; // seconds
    memoryUsage: number; // MB
    recommendedCPU: string;
    dataSize: number; // MB
  };
}

export const BANKING_CONFIGURATION_PROFILES: ConfigurationProfile[] = [
  {
    id: 'conservative_retail',
    name: 'Conservative Retail Bank',
    description: 'Low-risk retail banking with high compliance standards',
    category: 'risk',
    settings: {
      transactionCount: 350,
      maxTransactionAmount: 25000,
      errorRate: 0.3,
      complianceScore: 99.2,
      refreshInterval: 60,
      autoRefresh: true
    },
    additionalSettings: {
      validationStrictness: 98,
      performanceMode: 'balanced',
      errorSimulation: false,
      complianceAlerts: true,
      auditTrail: true,
      scenarioComplexity: 'simple',
      regulatoryFocus: ['MAS 610', 'AML/CFT', 'Consumer Protection']
    },
    metrics: {
      estimatedGenTime: 15,
      memoryUsage: 45,
      recommendedCPU: 'Medium',
      dataSize: 1.2
    }
  },
  {
    id: 'growth_commercial',
    name: 'Growth Commercial Bank',
    description: 'Expanding commercial bank with moderate risk appetite',
    category: 'volume',
    settings: {
      transactionCount: 1800,
      maxTransactionAmount: 750000,
      errorRate: 2.8,
      complianceScore: 96.5,
      refreshInterval: 30,
      autoRefresh: true
    },
    additionalSettings: {
      validationStrictness: 85,
      performanceMode: 'realtime',
      errorSimulation: true,
      complianceAlerts: true,
      auditTrail: true,
      scenarioComplexity: 'moderate',
      regulatoryFocus: ['MAS 610', 'Market Risk', 'Credit Risk', 'Liquidity Risk']
    },
    metrics: {
      estimatedGenTime: 35,
      memoryUsage: 125,
      recommendedCPU: 'High',
      dataSize: 3.8
    }
  },
  {
    id: 'investment_bank',
    name: 'Investment Bank',
    description: 'Complex investment banking with derivatives and high volumes',
    category: 'volume',
    settings: {
      transactionCount: 3500,
      maxTransactionAmount: 2000000,
      errorRate: 4.2,
      complianceScore: 94.8,
      refreshInterval: 15,
      autoRefresh: true
    },
    additionalSettings: {
      validationStrictness: 80,
      performanceMode: 'realtime',
      errorSimulation: true,
      complianceAlerts: true,
      auditTrail: true,
      scenarioComplexity: 'complex',
      regulatoryFocus: ['MAS 610', 'Market Risk', 'Derivatives', 'Capital Adequacy', 'Stress Testing']
    },
    metrics: {
      estimatedGenTime: 65,
      memoryUsage: 280,
      recommendedCPU: 'Very High',
      dataSize: 8.5
    }
  },
  {
    id: 'problem_bank',
    name: 'Problem Bank Scenario',
    description: 'Distressed bank with compliance issues and high error rates',
    category: 'risk',
    settings: {
      transactionCount: 1200,
      maxTransactionAmount: 150000,
      errorRate: 12.5,
      complianceScore: 78.3,
      refreshInterval: 10,
      autoRefresh: true
    },
    additionalSettings: {
      validationStrictness: 60,
      performanceMode: 'efficient',
      errorSimulation: true,
      complianceAlerts: true,
      auditTrail: true,
      scenarioComplexity: 'complex',
      regulatoryFocus: ['MAS 610', 'Remedial Actions', 'Asset Quality', 'Governance']
    },
    metrics: {
      estimatedGenTime: 45,
      memoryUsage: 95,
      recommendedCPU: 'Medium',
      dataSize: 2.8
    }
  },
  {
    id: 'regulatory_focus',
    name: 'Regulatory Compliance Focus',
    description: 'Optimized for regulatory reporting and compliance demonstrations',
    category: 'compliance',
    settings: {
      transactionCount: 800,
      maxTransactionAmount: 100000,
      errorRate: 1.8,
      complianceScore: 98.7,
      refreshInterval: 45,
      autoRefresh: true
    },
    additionalSettings: {
      validationStrictness: 95,
      performanceMode: 'balanced',
      errorSimulation: true,
      complianceAlerts: true,
      auditTrail: true,
      scenarioComplexity: 'moderate',
      regulatoryFocus: ['MAS 610', 'MAS 637', 'MAS 639', 'BCBS 239']
    },
    metrics: {
      estimatedGenTime: 25,
      memoryUsage: 65,
      recommendedCPU: 'Medium',
      dataSize: 2.1
    }
  },
  {
    id: 'demo_showcase',
    name: 'Demo Showcase',
    description: 'Balanced scenario optimized for product demonstrations',
    category: 'demo',
    settings: {
      transactionCount: 950,
      maxTransactionAmount: 250000,
      errorRate: 3.5,
      complianceScore: 94.2,
      refreshInterval: 20,
      autoRefresh: true
    },
    additionalSettings: {
      validationStrictness: 80,
      performanceMode: 'realtime',
      errorSimulation: true,
      complianceAlerts: true,
      auditTrail: true,
      scenarioComplexity: 'moderate',
      regulatoryFocus: ['MAS 610', 'Risk Management', 'Digital Banking']
    },
    metrics: {
      estimatedGenTime: 30,
      memoryUsage: 85,
      recommendedCPU: 'Medium',
      dataSize: 2.5
    }
  },
  {
    id: 'high_frequency',
    name: 'High Frequency Trading',
    description: 'High-volume, low-latency trading scenario',
    category: 'volume',
    settings: {
      transactionCount: 8000,
      maxTransactionAmount: 500000,
      errorRate: 0.8,
      complianceScore: 96.8,
      refreshInterval: 5,
      autoRefresh: true
    },
    additionalSettings: {
      validationStrictness: 90,
      performanceMode: 'realtime',
      errorSimulation: true,
      complianceAlerts: true,
      auditTrail: true,
      scenarioComplexity: 'complex',
      regulatoryFocus: ['Market Risk', 'Algo Trading', 'Best Execution', 'Market Abuse']
    },
    metrics: {
      estimatedGenTime: 120,
      memoryUsage: 450,
      recommendedCPU: 'Maximum',
      dataSize: 12.5
    }
  },
  {
    id: 'digital_bank',
    name: 'Digital Bank',
    description: 'Modern digital-first bank with API-driven operations',
    category: 'demo',
    settings: {
      transactionCount: 2200,
      maxTransactionAmount: 100000,
      errorRate: 1.2,
      complianceScore: 97.5,
      refreshInterval: 15,
      autoRefresh: true
    },
    additionalSettings: {
      validationStrictness: 88,
      performanceMode: 'realtime',
      errorSimulation: true,
      complianceAlerts: true,
      auditTrail: true,
      scenarioComplexity: 'moderate',
      regulatoryFocus: ['Digital Banking', 'Cybersecurity', 'Data Privacy', 'Open Banking']
    },
    metrics: {
      estimatedGenTime: 40,
      memoryUsage: 110,
      recommendedCPU: 'High',
      dataSize: 3.2
    }
  }
];

// Data generation progress interface
export interface DataGenerationProgress {
  step: string;
  progress: number;
  eta: number;
  currentOperation: string;
  completedSteps: string[];
  totalSteps: number;
}

// Data generation service with progress tracking
export class AdvancedDataGenerationService {
  private progressCallbacks: ((progress: DataGenerationProgress) => void)[] = [];

  // Add progress callback
  addProgressCallback(callback: (progress: DataGenerationProgress) => void) {
    this.progressCallbacks.push(callback);
  }

  // Remove progress callback
  removeProgressCallback(callback: (progress: DataGenerationProgress) => void) {
    this.progressCallbacks = this.progressCallbacks.filter(cb => cb !== callback);
  }

  // Notify all callbacks
  private notifyProgress(progress: DataGenerationProgress) {
    this.progressCallbacks.forEach(callback => {
      try {
        callback(progress);
      } catch (error) {
        // Error in progress callback
      }
    });
  }

  // Generate data with progress tracking
  async generateDataWithProgress(
    basicSettings: DemoDataSettings,
    profile?: ConfigurationProfile
  ): Promise<any> {
    const steps = [
      { name: 'Initialize Configuration', duration: 1000 },
      { name: 'Generate Counterparties', duration: profile?.metrics.estimatedGenTime ? profile.metrics.estimatedGenTime * 200 : 3000 },
      { name: 'Create Facilities', duration: profile?.metrics.estimatedGenTime ? profile.metrics.estimatedGenTime * 300 : 5000 },
      { name: 'Process Derivatives', duration: profile?.metrics.estimatedGenTime ? profile.metrics.estimatedGenTime * 150 : 2000 },
      { name: 'Build Analytics', duration: profile?.metrics.estimatedGenTime ? profile.metrics.estimatedGenTime * 250 : 4000 },
      { name: 'Generate Reports', duration: profile?.metrics.estimatedGenTime ? profile.metrics.estimatedGenTime * 200 : 3000 },
      { name: 'Finalize & Validate', duration: profile?.metrics.estimatedGenTime ? profile.metrics.estimatedGenTime * 100 : 2000 }
    ];

    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
    const completedSteps: string[] = [];
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (!step) continue;
      
      const progress = {
        step: step.name,
        progress: Math.round(((i + 1) / steps.length) * 100),
        eta: Math.round((totalDuration - steps.slice(0, i + 1).reduce((sum, s) => sum + s.duration, 0)) / 1000),
        currentOperation: step.name,
        completedSteps: [...completedSteps],
        totalSteps: steps.length
      };
      
      this.notifyProgress(progress);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, step.duration));
      
      completedSteps.push(step.name);
    }

    // Generate actual data
    const data = generateComprehensiveDemoData();
    
    // Final progress update
    this.notifyProgress({
      step: 'Complete',
      progress: 100,
      eta: 0,
      currentOperation: 'Data generation complete',
      completedSteps,
      totalSteps: steps.length
    });

    return data;
  }
}

// Scenario templates for different banking use cases
export const SCENARIO_TEMPLATES = {
  month_end_close: {
    name: 'Month-End Close',
    description: 'Monthly financial close with reconciliation focus',
    settingsModifiers: {
      errorRate: 1.8,
      complianceScore: 98.5,
      refreshInterval: 30
    },
    specialFeatures: ['enhanced_reconciliation', 'month_end_reports', 'variance_analysis']
  },
  
  regulatory_exam: {
    name: 'Regulatory Examination',
    description: 'Regulatory exam scenario with enhanced audit trails',
    settingsModifiers: {
      errorRate: 0.5,
      complianceScore: 99.8,
      refreshInterval: 60
    },
    specialFeatures: ['audit_trails', 'regulatory_reports', 'exception_handling']
  },
  
  stress_testing: {
    name: 'Stress Testing',
    description: 'Adverse scenario testing with increased volatility',
    settingsModifiers: {
      errorRate: 6.5,
      complianceScore: 92.3,
      refreshInterval: 15
    },
    specialFeatures: ['stress_scenarios', 'risk_monitoring', 'capital_impact']
  },
  
  system_migration: {
    name: 'System Migration',
    description: 'Data migration testing with validation checks',
    settingsModifiers: {
      errorRate: 3.2,
      complianceScore: 95.8,
      refreshInterval: 45
    },
    specialFeatures: ['migration_validation', 'data_integrity', 'reconciliation']
  }
};

// Performance optimization settings
export const PERFORMANCE_CONFIGURATIONS = {
  realtime: {
    name: 'Real-time Performance',
    description: 'Optimized for real-time updates and low latency',
    settings: {
      chartUpdateFrequency: 2,
      autoSaveInterval: 10,
      validationStrictness: 75
    },
    requirements: {
      minCPU: 'High',
      minMemory: '8GB',
      recommendedBrowser: 'Chrome 90+, Firefox 88+, Safari 14+'
    }
  },
  
  balanced: {
    name: 'Balanced Performance',
    description: 'Good balance between performance and resource usage',
    settings: {
      chartUpdateFrequency: 5,
      autoSaveInterval: 30,
      validationStrictness: 85
    },
    requirements: {
      minCPU: 'Medium',
      minMemory: '4GB',
      recommendedBrowser: 'Chrome 85+, Firefox 80+, Safari 13+'
    }
  },
  
  efficient: {
    name: 'Resource Efficient',
    description: 'Optimized for lower resource usage',
    settings: {
      chartUpdateFrequency: 10,
      autoSaveInterval: 60,
      validationStrictness: 95
    },
    requirements: {
      minCPU: 'Low',
      minMemory: '2GB',
      recommendedBrowser: 'Chrome 80+, Firefox 75+, Safari 12+'
    }
  }
};

// Settings validation
export const validateSettings = (
  basicSettings: DemoDataSettings,
  profile?: ConfigurationProfile
): { isValid: boolean; warnings: string[]; errors: string[] } => {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Transaction count validation
  if (basicSettings.transactionCount > 5000) {
    warnings.push('High transaction count may impact performance');
  }
  if (basicSettings.transactionCount < 100) {
    errors.push('Transaction count must be at least 100');
  }

  // Error rate validation
  if (basicSettings.errorRate > 10) {
    warnings.push('High error rate may affect data quality');
  }
  if (basicSettings.errorRate < 0 || basicSettings.errorRate > 100) {
    errors.push('Error rate must be between 0 and 100');
  }

  // Compliance score validation
  if (basicSettings.complianceScore < 85) {
    warnings.push('Low compliance score may trigger regulatory alerts');
  }
  if (basicSettings.complianceScore < 50 || basicSettings.complianceScore > 100) {
    errors.push('Compliance score must be between 50 and 100');
  }

  // Profile-specific validation
  if (profile) {
    if (profile.metrics.memoryUsage > 200) {
      warnings.push(`Profile "${profile.name}" requires significant memory (${profile.metrics.memoryUsage}MB)`);
    }
    if (profile.metrics.estimatedGenTime > 60) {
      warnings.push(`Profile "${profile.name}" has long generation time (${profile.metrics.estimatedGenTime}s)`);
    }
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors
  };
};

// Export utility functions
export const getProfileById = (id: string): ConfigurationProfile | undefined => {
  return BANKING_CONFIGURATION_PROFILES.find(profile => profile.id === id);
};

export const getProfilesByCategory = (category: string): ConfigurationProfile[] => {
  return BANKING_CONFIGURATION_PROFILES.filter(profile => profile.category === category);
};

export const estimatePerformanceImpact = (
  basicSettings: DemoDataSettings,
  profile?: ConfigurationProfile
): {
  cpu: 'Low' | 'Medium' | 'High' | 'Very High';
  memory: number;
  generationTime: number;
  dataSize: number;
} => {
  const baseMemory = 50;
  const baseCPU = 'Medium';
  const baseGenTime = 30;
  const baseDataSize = 2;

  const transactionMultiplier = basicSettings.transactionCount / 1000;
  const complexityMultiplier = profile?.additionalSettings.scenarioComplexity === 'complex' ? 1.5 : 
                               profile?.additionalSettings.scenarioComplexity === 'moderate' ? 1.2 : 1.0;

  const memory = Math.round((baseMemory + (transactionMultiplier * 20)) * complexityMultiplier);
  const generationTime = Math.round((baseGenTime + (transactionMultiplier * 10)) * complexityMultiplier);
  const dataSize = Math.round((baseDataSize + (transactionMultiplier * 0.5)) * complexityMultiplier * 10) / 10;

  let cpu: 'Low' | 'Medium' | 'High' | 'Very High' = 'Medium';
  if (memory > 300) cpu = 'Very High';
  else if (memory > 200) cpu = 'High';
  else if (memory > 100) cpu = 'Medium';
  else cpu = 'Low';

  return {
    cpu,
    memory,
    generationTime,
    dataSize
  };
};