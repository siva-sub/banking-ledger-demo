import React from 'react';

// Hook-based error handler for functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { handleError, resetError };
};

// Type guards for error handling
export const isFinancialError = (error: unknown): error is Error => {
  return error instanceof Error && 
         (error.message.includes('financial') || 
          error.message.includes('currency') ||
          error.message.includes('amount'));
};

export const isValidationError = (error: unknown): error is Error => {
  return error instanceof Error && 
         error.message.includes('validation');
};