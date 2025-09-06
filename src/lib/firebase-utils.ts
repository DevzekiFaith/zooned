import { Timestamp, serverTimestamp as serverTimestampFn } from "firebase/firestore";

// Helper to safely convert Firestore Timestamp to Date
export const toDate = (value: any): Date => {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (value.toDate) return value.toDate();
  return new Date(value);
};

// Type-safe server timestamp
export const serverTimestamp = () => serverTimestampFn() as unknown as Date;

// Type guard for Firestore Timestamp
export const isTimestamp = (value: any): value is { toDate: () => Date } => {
  return value && typeof value.toDate === 'function';
};

// Convert object with Timestamps to plain object with Dates
export const convertTimestamps = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(convertTimestamps);
  if (isTimestamp(obj)) return obj.toDate();
  
  const result: Record<string, any> = {};
  for (const key in obj) {
    result[key] = convertTimestamps(obj[key]);
  }
  return result;
};
