// Security utilities for the application
export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

// Content Security Policy headers
export const cspHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'"
  ].join('; ')
};

// Rate limiting for API endpoints
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
};

// Input validation patterns
export const validationPatterns = {
  email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  phone: /^\+?[1-9]\d{1,14}$/,
  name: /^[a-zA-Z\s]{2,50}$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
};

// Firestore security rules validation
export const validateFirestoreAccess = (userRole: string, resource: string, action: string): boolean => {
  const permissions = {
    client: {
      projects: ['read', 'create'],
      invoices: ['read'],
      bookings: ['read', 'create', 'update']
    },
    freelancer: {
      projects: ['read', 'update'],
      invoices: ['create', 'read', 'update'],
      bookings: ['read', 'update']
    },
    admin: {
      projects: ['create', 'read', 'update', 'delete'],
      invoices: ['create', 'read', 'update', 'delete'],
      bookings: ['create', 'read', 'update', 'delete'],
      users: ['create', 'read', 'update', 'delete']
    }
  };

  const userPermissions = permissions[userRole as keyof typeof permissions];
  if (!userPermissions) return false;

  const resourcePermissions = userPermissions[resource as keyof typeof userPermissions];
  if (!resourcePermissions) return false;

  return resourcePermissions.includes(action);
};
