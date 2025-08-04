export type Rating = "good" | "bad";

export interface Annotation {
  id: string;
  rootSpanId: string;
  note: string;
  rating: Rating;
  categories: string[];
}

export interface RootSpan {
  id: string;
  traceId: string;
  batchId: string | null;
  startTime: string; // or Date
  endTime: string; // or Date
  tsStart: number; // timestamp in milliseconds
  tsEnd: number; // timestamp in milliseconds
  input: string;
  output: string;
  projectName: string;
  spanName: string;
  created_at: string; // or Date - matches server response
}

export interface AnnotatedRootSpan {
  id: string;
  traceId: string;
  batchId: string | null;  
  startTime: string | null; 
  endTime: string | null;
  input: string;
  output: string;
  projectId?: string;
  projectName?: string;
  spanName: string | null;
  annotation: Omit<Annotation, 'rootSpanId'> | null;
}

export interface Batch {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
  validRootSpanCount: number;
  percentAnnotated: number;
  percentGood: number;
  categories: Record<string, number>;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  validRootSpanCount: number;
  numBatches: number;
}