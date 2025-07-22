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
}

export type AnnotatedRootSpan = RootSpan & {
  annotationId: string;
} & Pick<Annotation, "note" | "rating" | "categories">;

export interface Queue {
  id: string;
  name: string;
  totalSpans: number;
  annotatedCount: number;
  goodCount: number;
}
