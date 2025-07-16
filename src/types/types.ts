export interface Trace {
  id: string;
  input: string;
  output: string;
}

export type Rating = "good" | "bad" | "none";

export interface Annotation {
  id: string;
  traceId: string;
  note: string;
  rating: Rating;
  categories: string[];
}

export type AnnotatedTrace = Omit<Trace, "id"> & {
  annotationId: string;
  traceId: string;
} & Pick<Annotation, "note" | "rating" | "categories">;

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
