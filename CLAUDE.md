# General Ledger System - AI Context Template

## 1. Project Overview
- **Vision:** Educational General Ledger System demonstrating financial workflows through GitHub Pages deployment
- **Current Phase:** Implementation phase - React/TypeScript development with persona simulation
- **Key Architecture:** Client-side React SPA with simulated backend functionality for GitHub Pages
- **Development Strategy:** Multi-agent parallel implementation with comprehensive documentation maintenance

## ⚠️ CRITICAL PROJECT BOUNDARIES - ABSOLUTE RESTRICTIONS
**NEVER access, read, write, or reference "/home/siva/Documents/GL" - This is a separate project**
- All work must focus EXCLUSIVELY on "/home/siva/Documents/general ledger/" directory
- When creating sub-agents or using tools, explicitly instruct them to avoid the GL directory
- Always use full paths: "/home/siva/Documents/general ledger/" for this project
- If any tool or agent attempts to access GL directory, immediately stop and redirect

## 2. Project Structure

**⚠️ CRITICAL: AI agents MUST read the [Project Structure documentation](/docs/ai-context/project-structure.md) before attempting any task to understand the complete technology stack, file tree and project organization.**

General Ledger System follows a modular financial architecture with client-side processing. For the complete tech stack and file tree structure, see [docs/ai-context/project-structure.md](/docs/ai-context/project-structure.md).

## 3. Coding Standards & AI Instructions

### General Instructions
- **ABSOLUTE RULE**: Never access "/home/siva/Documents/GL" - only work in "/home/siva/Documents/general ledger/"
- Your most important job is to manage your own context. Always read any relevant files BEFORE planning changes.
- When updating documentation, keep updates concise and on point to prevent bloat.
- Write code following KISS, YAGNI, and DRY principles.
- When in doubt follow proven best practices for implementation.
- Do not commit to git without user approval.
- Always consider industry standard libraries/frameworks first over custom implementations.
- Never mock anything. Never use placeholders. Never omit code.
- Apply SOLID principles where relevant. Use modern framework features rather than reinventing solutions.
- Be brutally honest about whether an idea is good or bad.
- Make side effects explicit and minimal.
- **GitHub Pages Only**: All code must work with static hosting, no backend servers allowed.

### File Organization & Modularity
- Default to creating multiple small, focused files rather than large monolithic ones
- Each file should have a single responsibility and clear purpose
- Keep files under 350 lines when possible - split larger files by extracting utilities, constants, types, or logical components into separate modules
- Separate concerns: utilities, constants, types, components, and business logic into different files
- Prefer composition over inheritance - use inheritance only for true 'is-a' relationships, favor composition for 'has-a' or behavior mixing
- Follow existing project structure and conventions - place files in appropriate directories. Create new directories and move files if deemed appropriate.
- Use well defined sub-directories to keep things organized and scalable
- Structure projects with clear folder hierarchies and consistent naming conventions
- Import/export properly - design for reusability and maintainability

### Type Hints (REQUIRED)
- **Always** use TypeScript for all code
- Use comprehensive type definitions for all functions, components, and data structures
- Prefer specific types over `any` or generic types
- Use Zod or similar for runtime type validation when needed

```typescript
// Good
interface TransactionData {
  id: string;
  amount: number;
  currency: string;
  timestamp: Date;
  type: 'debit' | 'credit';
}

const processTransaction = (
  data: TransactionData,
  validator?: (data: TransactionData) => boolean
): Promise<ProcessResult> => {
  // Implementation
};
```

### Naming Conventions
- **Components**: PascalCase (e.g., `TransactionProcessor`)
- **Functions/Methods**: camelCase (e.g., `processTransaction`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_TRANSACTION_SIZE`)
- **Types/Interfaces**: PascalCase (e.g., `TransactionData`, `ProcessResult`)
- **Files**: kebab-case for components (e.g., `transaction-processor.tsx`)

### Performance-First Development
- **Bundle Size**: Monitor with webpack-bundle-analyzer for every major change
- **Tree Shaking**: Use selective imports from all libraries
- **Icon Strategy**: Primary lucide-react, selective @ant-design/icons, avoid react-icons
- **Code Splitting**: Implement route-based and component-based splitting
- **Memory Management**: Avoid memory leaks, use proper cleanup in useEffect

### Financial Data Handling
- **Precision**: Use proper decimal handling for financial calculations
- **Validation**: Validate all financial data at boundaries
- **Compliance**: Follow ISO 20022 and MAS 610 standards strictly
- **Audit Trail**: Maintain comprehensive logging for all financial operations
- **Error Handling**: Implement robust error handling with proper user feedback

### Security First
- **Input Validation**: Validate all external inputs including financial data
- **Client-Side Security**: Implement proper CSP headers and XSS protection
- **Data Handling**: Secure handling of financial information
- **No Secrets**: Never embed secrets in client-side code
- **Audit Logging**: Log all financial operations for compliance

### Error Handling
- **Specific Exceptions**: Use specific error types for different failure modes
- **User-Friendly Messages**: Provide clear error messages for users
- **Graceful Degradation**: System should work even with partial failures
- **Recovery Strategies**: Implement retry logic and fallback mechanisms

### Component Architecture
- **Ant Design Integration**: Use Ant Design components as primary UI building blocks
- **Custom Components**: Build custom components only when Ant Design is insufficient
- **Responsive Design**: Ensure all components work across device sizes
- **Accessibility**: Follow WCAG guidelines for financial applications

### API Design Principles
- **TypeScript First**: All API interfaces defined with TypeScript
- **Consistent Responses**: Standardized response formats
- **Error Handling**: Comprehensive error response structure
- **Documentation**: All APIs documented with examples

## 4. Performance Optimization Standards

### Bundle Size Management
- **Target**: < 2MB initial load, < 500KB per route
- **Monitoring**: Use webpack-bundle-analyzer for every build
- **Icon Strategy**: lucide-react primary, selective @ant-design/icons
- **Tree Shaking**: Selective imports: `import { Button } from 'antd'`

### Runtime Performance
- **Target**: 60fps UI interactions, < 100MB heap usage
- **Optimization**: WebAssembly for financial calculations
- **Memory**: Proper cleanup in useEffect hooks
- **Rendering**: Use React.memo and useMemo appropriately

### Development Workflow
- **Type Check**: `npm run typecheck` before commits
- **Lint**: `npm run lint` with zero warnings
- **Test**: `npm run test` with 90%+ coverage
- **Build**: `npm run build` with bundle size validation

## 5. Financial Standards Integration

### ISO 20022 Implementation
- **Message Types**: Support pain.001, pain.002, camt.053, camt.054
- **Validation**: Strict schema validation for all messages
- **Transformation**: Efficient XML to JSON transformation
- **Error Handling**: Comprehensive validation error reporting

### MAS 610 Compliance
- **Reporting**: Automated regulatory report generation
- **Validation**: Real-time compliance checking
- **Documentation**: Audit trail for all regulatory operations
- **Updates**: Monitor and implement regulatory changes

## 6. Development Phases

### Phase 1: Foundation (Weeks 1-3)
- React + TypeScript + Ant Design setup
- Core infrastructure and build process
- Performance monitoring integration

### Phase 2: Core Features (Weeks 4-6)
- ISO 20022 message processing
- MAS 610 reporting engine
- Basic financial data handling

### Phase 3: Advanced Processing (Weeks 7-9)
- ETL pipeline implementation
- Compliance validation engine
- Mock data generation

### Phase 4: Visualization & Analytics (Weeks 10-11)
- Transaction topology analysis
- Advanced reporting dashboards
- Performance optimization

### Phase 5: Deployment & Optimization (Week 12)
- GitHub Pages deployment
- Performance optimization
- Production readiness

## 7. Quality Assurance

### Testing Strategy
- **Unit Tests**: Jest + React Testing Library for all components
- **Integration Tests**: Test financial processing workflows
- **Performance Tests**: Bundle size and runtime performance
- **Compliance Tests**: Validate against ISO 20022 and MAS 610

### Code Quality
- **TypeScript**: Strict mode with comprehensive types
- **ESLint**: Zero-warning policy with React/TypeScript rules
- **Prettier**: Consistent code formatting with eslint-plugin-prettier
- **Bundle Analysis**: Regular bundle size monitoring

### Documentation Requirements
- **Code Comments**: Complex financial logic must be commented
- **API Documentation**: All interfaces documented with examples
- **Architecture Decisions**: Document all major technical decisions
- **Performance Notes**: Document optimization strategies and results

## 8. Deployment Architecture

### GitHub Pages Configuration
- **Static Generation**: Vite build output optimized for production
- **CI/CD**: GitHub Actions with automated testing and deployment
- **Performance**: CDN optimization and asset compression
- **Monitoring**: Performance and error tracking

### Production Readiness
- **Security**: CSP headers, XSS protection, secure data handling
- **Performance**: < 2 second load times, optimized bundle size
- **Reliability**: Error handling and graceful degradation
- **Compliance**: Full ISO 20022 and MAS 610 compliance validation