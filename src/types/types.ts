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
  startTime: string; // or Date
  endTime: string; // or Date
  input: string;
  output: string;
  projectName: string;
  spanName: string;
}

export type AnnotatedRootSpan = RootSpan & {
  annotationId: string;
} & Pick<Annotation, "note" | "rating" | "categories">;
