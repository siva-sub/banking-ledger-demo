import * as React from 'react';
import { Result, Button } from 'antd';
import { FrownOutlined } from '@ant-design/icons';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error for debugging (in development)
    if (process.env['NODE_ENV'] === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error caught by boundary:', error, errorInfo);
    }

    // In production, you might want to log this to a service like Sentry
    // logErrorToService(error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent 
            error={this.state.error!} 
            resetError={this.resetError} 
          />
        );
      }

      return (
        <Result
          icon={<FrownOutlined />}
          title="Something went wrong"
          subTitle="An unexpected error occurred. Please try refreshing the page or contact support if the problem persists."
          extra={[
            <Button type="primary" key="reload" onClick={() => window.location.reload()}>
              Reload Page
            </Button>,
            <Button key="reset" onClick={this.resetError}>
              Try Again
            </Button>
          ]}
        >
          {process.env['NODE_ENV'] === 'development' && this.state.error && (
            <details style={{ 
              marginTop: '20px', 
              padding: '10px', 
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              textAlign: 'left'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                Error Details (Development Mode)
              </summary>
              <pre style={{ 
                fontSize: '12px', 
                overflow: 'auto',
                marginTop: '10px',
                padding: '10px',
                backgroundColor: '#fff',
                border: '1px solid #d9d9d9',
                borderRadius: '4px'
              }}>
                {this.state.error.stack}
              </pre>
              {this.state.errorInfo && (
                <pre style={{ 
                  fontSize: '12px', 
                  overflow: 'auto',
                  marginTop: '10px',
                  padding: '10px',
                  backgroundColor: '#fff',
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px'
                }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </details>
          )}
        </Result>
      );
    }

    return this.props.children;
  }
}


// Specialized error boundary for financial operations
export const FinancialErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const fallback = ({ error, resetError }: { error: Error; resetError: () => void }) => (
    <Result
      status="error"
      title="Financial Operation Error"
      subTitle="An error occurred while processing financial data. Your data is safe, but this operation could not be completed."
      extra={[
        <Button type="primary" key="reset" onClick={resetError}>
          Try Again
        </Button>,
        <Button key="home" onClick={() => window.location.href = '/'}>
          Go to Dashboard
        </Button>
      ]}
    >
      {process.env['NODE_ENV'] === 'development' && (
        <details style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#fff2f0',
          borderRadius: '4px',
          textAlign: 'left'
        }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#ff4d4f' }}>
            Financial Error Details
          </summary>
          <pre style={{ 
            fontSize: '12px', 
            overflow: 'auto',
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#fff',
            border: '1px solid #ff4d4f',
            borderRadius: '4px'
          }}>
            {error.message}
          </pre>
        </details>
      )}
    </Result>
  );

  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundary;