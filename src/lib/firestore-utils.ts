import { 
  Firestore, 
  DocumentData, 
  CollectionReference,
  DocumentReference,
  collection as firestoreCollection,
  doc as firestoreDoc
} from "firebase/firestore";

// Type-safe wrapper for Firestore collections
export const getCollection = <T = DocumentData>(
  parent: Firestore | DocumentReference<DocumentData> | CollectionReference<DocumentData>,
  path: string,
  ...pathSegments: string[]
): CollectionReference<T> => {
  return firestoreCollection(
    parent as any,
    path,
    ...pathSegments
  ) as unknown as CollectionReference<T>;
};

// Type-safe wrapper for Firestore document references
export const getDocRef = <T = DocumentData>(
  parent: Firestore | DocumentReference<DocumentData> | CollectionReference<DocumentData>,
  path: string,
  ...pathSegments: string[]
): DocumentReference<T> => {
  return firestoreDoc(
    parent as any,
    path,
    ...pathSegments
  ) as unknown as DocumentReference<T>;
};

// Helper type for documents with ID
export type WithId<T> = T & { id: string };
