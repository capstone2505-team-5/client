import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Traces from "./components/Traces";
import Annotation from "./components/Annotation";
import TraceDetails from "./components/TraceDetails";
import type { AnnotatedTrace, Rating } from "./types/types";
import {
  fetchTraces,
  fetchAnnotations,
  categorizeAnnotations,
} from "./services/services";
import { createAnnotation, updateAnnotation } from "./services/services";

const App = () => {
  const [annotatedTraces, setAnnotatedTraces] = useState<AnnotatedTrace[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [traces, annotations] = await Promise.all([
          fetchTraces(),
          fetchAnnotations(),
        ]);

        const combined: AnnotatedTrace[] = traces.map((trace) => {
          const match = annotations.find(
            (annotation) => annotation.traceId === trace.id
          );

          return {
            traceId: trace.id,
            input: trace.input,
            output: trace.output,
            annotationId: match?.id ?? "",
            note: match?.note ?? "",
            rating: match?.rating ?? "none",
            categories: match?.categories ?? [],
          };
        });

        setAnnotatedTraces(combined);
      } catch (error) {
        console.error("Failed to fetch traces or annotations", error);
      }
    };

    fetchData();
  }, []);

  const handleCategorize = async () => {
    const fetchCategorizedAnnotations = async () => {
      try {
        const traceCategories = await categorizeAnnotations();

        const updatedAnnotatedTraces = annotatedTraces.map((annotatedTrace) => {
          const match = traceCategories.find(
            ({traceId}) => traceId === annotatedTrace.traceId
          );
          const categories = match ? match.categories : annotatedTrace.categories;
          return {
            ...annotatedTrace,
            categories,
          };
        });
        setAnnotatedTraces(updatedAnnotatedTraces);
      } catch (error) {
        console.log("Error categorizing annotations", error);
      }
    };

    fetchCategorizedAnnotations();
  };

  const handleSaveAnnotation = async (
    annotationId: string,
    traceId: string,
    note: string,
    rating: Rating
  ): Promise<void> => {
    try {
      let res;
      if (annotationId === "") {
        res = await createAnnotation(traceId, note || "", rating || "none");
      } else {
        res = await updateAnnotation(
          annotationId,
          note || "",
          rating || "none"
        );
      }

      setAnnotatedTraces((prev) => {
        return prev.map((trace) => {
          if (trace.traceId === traceId) {
            return {
              annotationId: res.id,
              traceId: res.traceId,
              input: trace.input,
              output: trace.output,
              note: res.note,
              rating: res.rating,
              categories: res.categories,
            };
          } else {
            return trace;
          }
        });
      });

      console.log(
        annotationId ? "Annotation updated:" : "Annotation created:",
        res
      );
    } catch (err) {
      console.error("Failed to save annotation", err);
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Traces annotatedTraces={annotatedTraces} onCategorize={handleCategorize} />}
        />
        <Route path="/traces/:id" element={<TraceDetails />} />
        <Route
          path="/annotation"
          element={
            <Annotation
              annotatedTraces={annotatedTraces}
              onSave={handleSaveAnnotation}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
