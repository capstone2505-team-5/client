export type Rating = "good" | "bad" | "none";

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
  queueId: string | null;
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

export type AnnotatedRootSpan = RootSpan & {
  annotationId: string;
} & Pick<Annotation, "note" | "rating" | "categories">;

export interface Batch {
  id: string;
  name: string;
  totalSpans: number;
  annotatedCount: number;
  goodCount: number;
  categories: string[];
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  rootSpanCount: number;
  numBatches: number;
}