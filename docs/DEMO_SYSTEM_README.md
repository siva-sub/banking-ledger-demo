# Demo System Documentation

## Overview

The General Ledger Demo System provides a comprehensive, interactive demonstration of enterprise financial system capabilities through a 5-persona simulation framework. This system enables users to experience real-world financial workflows, regulatory compliance processes, and multi-user collaboration scenarios without requiring backend infrastructure.

## System Architecture

### Core Components

1. **Persona Management System** (`PersonaManager`)
   - Handles user persona switching and state management
   - Manages persona-specific data and permissions
   - Provides session persistence and configuration

2. **Scenario Engine** (`ScenarioEngine`)
   - Orchestrates interactive demo scenarios
   - Manages workflow execution and validation
   - Handles step-by-step guided demonstrations

3. **Mock API Service** (`MockAPIService`)
   - Simulates backend API calls with realistic delays
   - Provides data persistence through localStorage
   - Enables real-time update simulation

4. **Demo Components**
   - PersonaSwitcher: User interface for persona selection
   - ScenarioLauncher: Interactive scenario management
   - DemoNotifications: Real-time notification system
   - DemoControlPanel: System configuration and management

## Demo Personas

### 1. Sarah Chen - Financial Operations Manager
- **Role**: Daily transaction processing and payment operations
- **Permissions**: payment_initiation, transaction_processing, reconciliation
- **Default Dashboard**: operations-dashboard
- **Key Workflows**: Payment approval, reconciliation, ISO 20022 processing

### 2. Michael Rodriguez - Compliance Officer
- **Role**: Regulatory reporting and compliance management
- **Permissions**: regulatory_reporting, audit_trail_access, mas610_reporting
- **Default Dashboard**: compliance-dashboard
- **Key Workflows**: MAS 610 report generation, compliance validation

### 3. Lisa Thompson - Treasury Manager
- **Role**: Cash management and liquidity monitoring
- **Permissions**: cash_management, liquidity_monitoring, currency_operations
- **Default Dashboard**: treasury-dashboard
- **Key Workflows**: Cash positioning, liquidity management, currency exposure

### 4. David Park - Risk Management Analyst
- **Role**: Transaction analysis and risk assessment
- **Permissions**: risk_analysis, topology_analysis, pattern_detection
- **Default Dashboard**: risk-dashboard
- **Key Workflows**: Network topology analysis, anomaly detection

### 5. Anna Mueller - System Administrator
- **Role**: System management and user administration
- **Permissions**: system_administration, user_management, performance_monitoring
- **Default Dashboard**: admin-dashboard
- **Key Workflows**: System monitoring, user management, performance tuning

## Demo Scenarios

### 1. Payment Approval Workflow
- **Category**: Workflow
- **Duration**: 8 minutes
- **Steps**: 5 (Create → Approve → Monitor → Analyze → Settle)
- **Learning Objectives**: ISO 20022 processing, approval workflows, real-time collaboration

### 2. MAS 610 Report Generation
- **Category**: Compliance
- **Duration**: 12 minutes
- **Steps**: 4 (Initiate → Review → Generate LCR → Submit)
- **Learning Objectives**: Regulatory reporting, CAR/LCR calculations, validation processes

### 3. Daily Reconciliation Process
- **Category**: Operations
- **Duration**: 6 minutes
- **Steps**: 4 (Import → Auto-match → Resolve exceptions → Generate report)
- **Learning Objectives**: Bank statement processing, reconciliation logic, exception handling

## Data Architecture

### Static Demo Data Structure
```
public/demo-data/
├── personas.json              # User personas and configurations
├── demo-transactions.json     # Sample transaction data
├── mas610-reports.json        # Regulatory report samples
├── demo-scenarios.json        # Interactive scenario definitions
├── regulatory-parameters.json # MAS 610 compliance parameters
├── bank-statements.json       # Sample bank statement data
└── calculation-data.json      # Financial calculation inputs
```

### State Management
- **Session Storage**: Temporary demo state and progress
- **Local Storage**: Persistent configuration and completed scenarios
- **In-Memory**: Real-time updates and UI state

## Usage Guide

### Getting Started

1. **Initialize Demo System**
   ```typescript
   import { PersonaManager, ScenarioEngine } from './services';
   
   const personaManager = PersonaManager.getInstance();
   const scenarioEngine = ScenarioEngine.getInstance();
   
   // Load personas and scenarios
   await personaManager.loadPersonas();
   ```

2. **Switch Personas**
   ```typescript
   // Switch to Operations Manager persona
   await personaManager.switchPersona('sarah-chen');
   
   // Check current persona
   const currentPersona = personaManager.getCurrentPersona();
   ```

3. **Start Demo Scenario**
   ```typescript
   // Start payment approval workflow
   await scenarioEngine.startScenario('payment-approval-workflow', 'sarah-chen');
   ```

### React Hook Usage

```typescript
import { useDemo } from './hooks/useDemo';

function DemoComponent() {
  const {
    currentPersona,
    scenarios,
    switchPersona,
    startScenario,
    executeScenarioStep
  } = useDemo();

  const handleStartDemo = async () => {
    await switchPersona('sarah-chen');
    await startScenario('payment-approval-workflow');
  };

  return (
    <div>
      <PersonaSwitcher onPersonaChange={setCurrentPersona} />
      <ScenarioLauncher onScenarioStart={handleStartDemo} />
    </div>
  );
}
```

## Configuration

### Demo Configuration Options

```typescript
interface DemoConfig {
  enablePersonaSwitching: boolean;    // Enable persona switching
  enableGuidedTour: boolean;          // Enable guided tour
  enableScenarioProgress: boolean;    // Track scenario progress
  enableRealTimeUpdates: boolean;     // Enable real-time updates
  simulationSpeed: number;            // Simulation speed multiplier
  autoSaveInterval: number;           // Auto-save interval (ms)
}
```

### Persona Permissions

```typescript
// Check if current persona has specific permission
const canApprove = personaManager.hasPermission('approval_level_1');

// Get persona-specific dashboard URL
const dashboardUrl = personaManager.getDashboardUrl();
```

## Real-Time Updates

### Event System
The demo system uses custom events for real-time updates:

```typescript
// Listen for persona switches
window.addEventListener('personaSwitch', (event) => {
  console.log('Switched to:', event.detail.persona);
});

// Listen for scenario notifications
window.addEventListener('scenarioNotification', (event) => {
  console.log('Notification:', event.detail);
});

// Listen for real-time updates
window.addEventListener('realtimeUpdate', (event) => {
  console.log('Update:', event.detail);
});
```

### Notification System
```typescript
// Subscribe to real-time updates
mockAPI.subscribeToRealtimeUpdates('user-123', (update) => {
  console.log('Real-time update:', update);
});
```

## Advanced Features

### Custom Scenario Creation

```typescript
const customScenario: DemoScenario = {
  id: 'custom-workflow',
  title: 'Custom Workflow',
  description: 'Custom demo scenario',
  category: 'workflow',
  estimatedTime: 5,
  difficulty: 'intermediate',
  prerequisites: [],
  learningObjectives: ['Custom objective'],
  steps: [
    {
      id: 'step-1',
      title: 'First Step',
      persona: 'sarah-chen',
      action: 'custom-action',
      duration: 120,
      description: 'Step description',
      instructions: ['Do this', 'Then that'],
      expectedOutcome: 'Expected result',
      uiChanges: ['UI change 1'],
      validationPoints: ['Validation 1']
    }
  ],
  dataRequirements: ['demo-data.json'],
  completionCriteria: {
    allStepsCompleted: true,
    validationsPassed: true,
    timeWithinLimit: true
  }
};
```

### Data Export/Import

```typescript
// Export demo data
const exportData = personaManager.exportPersonaData();

// Import demo data
const success = personaManager.importPersonaData(jsonData);
```

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Load scenario data on demand
2. **Caching**: Cache frequently accessed data
3. **Throttling**: Limit real-time update frequency
4. **Cleanup**: Properly dispose of event listeners

### Memory Management

```typescript
// Cleanup on component unmount
useEffect(() => {
  return () => {
    personaManager.cleanup();
    mockAPI.unsubscribeFromRealtimeUpdates('user-123');
  };
}, []);
```

## Testing

### Unit Tests
```typescript
describe('PersonaManager', () => {
  test('should switch personas correctly', async () => {
    const personaManager = PersonaManager.getInstance();
    const success = await personaManager.switchPersona('sarah-chen');
    expect(success).toBe(true);
    
    const currentPersona = personaManager.getCurrentPersona();
    expect(currentPersona?.id).toBe('sarah-chen');
  });
});
```

### Integration Tests
```typescript
describe('Demo Workflow', () => {
  test('should complete payment approval scenario', async () => {
    const scenarioEngine = ScenarioEngine.getInstance();
    const success = await scenarioEngine.startScenario('payment-approval-workflow', 'sarah-chen');
    expect(success).toBe(true);
    
    // Execute all steps
    for (let i = 0; i < 5; i++) {
      await scenarioEngine.executeStep('payment-approval-workflow', 'sarah-chen');
    }
    
    const progress = scenarioEngine.getScenarioProgress('payment-approval-workflow', 'sarah-chen');
    expect(progress?.completedSteps).toHaveLength(5);
  });
});
```

## Troubleshooting

### Common Issues

1. **Persona Not Switching**
   - Check if persona exists in personas.json
   - Verify enablePersonaSwitching is true
   - Check browser console for errors

2. **Scenario Not Starting**
   - Verify persona is selected
   - Check scenario prerequisites
   - Ensure scenario exists in demo-scenarios.json

3. **Real-time Updates Not Working**
   - Check enableRealTimeUpdates configuration
   - Verify event listeners are properly attached
   - Check browser console for errors

### Debug Mode

```typescript
// Enable debug logging
localStorage.setItem('demo-debug', 'true');

// Check system health
const health = await mockAPI.healthCheck();
console.log('System health:', health);
```

## Deployment

### GitHub Pages Deployment
The demo system is designed for static hosting on GitHub Pages:

1. Build the application: `npm run build`
2. Deploy to GitHub Pages: `npm run deploy`
3. Access demo at: `https://username.github.io/repository-name/`

### Environment Variables
```bash
VITE_DEMO_MODE=true
VITE_BASE_URL=/general-ledger-system/
VITE_ENABLE_ANALYTICS=false
```

## Future Enhancements

### Planned Features
1. **Advanced Analytics**: User behavior tracking and insights
2. **Custom Scenarios**: Visual scenario builder
3. **Multi-language Support**: Internationalization
4. **Offline Mode**: Service worker implementation
5. **API Integration**: Optional backend connectivity

### Contributing
1. Fork the repository
2. Create feature branch
3. Implement changes
4. Add tests
5. Submit pull request

## Support

For issues and questions:
- Check the troubleshooting section
- Review browser console logs
- Create GitHub issue with reproduction steps
- Include demo configuration and browser information

---

*This demo system provides a comprehensive simulation of enterprise financial system capabilities while maintaining simplicity and ease of use for demonstration purposes.*