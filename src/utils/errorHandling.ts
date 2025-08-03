import { FirebaseError } from 'firebase/app';

export interface AppError {
  code: string;
  message: string;
  details?: string;
}

// Firebase error handler
export const handleFirebaseError = (error: FirebaseError): AppError => {
  switch (error.code) {
    case 'auth/user-not-found':
      return {
        code: 'USER_NOT_FOUND',
        message: 'No account found with this email address.',
        details: 'Please check your email or create a new account.'
      };
    case 'auth/wrong-password':
      return {
        code: 'INVALID_PASSWORD',
        message: 'Incorrect password.',
        details: 'Please check your password and try again.'
      };
    case 'auth/email-already-in-use':
      return {
        code: 'EMAIL_IN_USE',
        message: 'An account with this email already exists.',
        details: 'Please use a different email or sign in instead.'
      };
    case 'auth/weak-password':
      return {
        code: 'WEAK_PASSWORD',
        message: 'Password is too weak.',
        details: 'Please choose a stronger password with at least 8 characters.'
      };
    case 'auth/invalid-email':
      return {
        code: 'INVALID_EMAIL',
        message: 'Invalid email address.',
        details: 'Please enter a valid email address.'
      };
    case 'auth/too-many-requests':
      return {
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many failed attempts.',
        details: 'Please wait a few minutes before trying again.'
      };
    case 'permission-denied':
      return {
        code: 'PERMISSION_DENIED',
        message: 'You don\'t have permission to perform this action.',
        details: 'Please contact support if you believe this is an error.'
      };
    case 'unavailable':
      return {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Service is temporarily unavailable.',
        details: 'Please try again in a few moments.'
      };
    default:
      return {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred.',
        details: error.message || 'Please try again or contact support.'
      };
  }
};

// Generic error handler
export const handleGenericError = (error: unknown): AppError => {
  if (error instanceof FirebaseError) {
    return handleFirebaseError(error);
  }
  
  if (error instanceof Error) {
    return {
      code: 'GENERIC_ERROR',
      message: error.message,
      details: 'Please try again or contact support if the problem persists.'
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred.',
    details: 'Please try again or contact support.'
  };
};

// Async error wrapper
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<{ data?: T; error?: AppError }> => {
  try {
    const data = await operation();
    return { data };
  } catch (error) {
    const appError = handleGenericError(error);
    console.error('Operation failed:', appError);
    return { 
      data: fallback, 
      error: appError 
    };
  }
};

// Rate limiting helper
export const createRateLimiter = (maxAttempts: number, windowMs: number) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return (key: string): boolean => {
    const now = Date.now();
    const record = attempts.get(key);

    if (!record || now > record.resetTime) {
      attempts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  };
};
