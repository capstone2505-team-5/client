interface Trace {
  id: string;
  input: string;
  output: string;
}

type Rating = "good" | "bad" | "none";

interface Annotation {
  id: string;
  traceId: string;
  note: string;
  rating: Rating;
  categories: string[];
}

export type AnnotatedTrace = Omit<Trace, "id"> & {
  traceId: string;
} & Pick<Annotation, "note" | "rating" | "categories">;