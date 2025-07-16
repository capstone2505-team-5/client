import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Traces from "./components/Traces";
import Annotation from "./components/Annotation";
import TraceDetails from "./components/TraceDetails";
import type { AnnotatedRootSpan, Rating } from "./types/types";
import {
  fetchRootSpans,
  fetchAnnotations,
  categorizeAnnotations,
} from "./services/services";
import { createAnnotation, updateAnnotation } from "./services/services";

const App = () => {
  const [annotatedRootSpans, setAnnotatedRootSpans] = useState<AnnotatedRootSpan[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rootSpans, annotations] = await Promise.all([
          fetchRootSpans(),
          fetchAnnotations(),
        ]);

        const combined: AnnotatedRootSpan[] = rootSpans.map((rootSpan) => {
          const match = annotations.find(
            (annotation) => annotation.spanId === rootSpan.id
          );

          return {
            id: rootSpan.id,
            input: rootSpan.input,
            output: rootSpan.output,
            traceId: rootSpan.traceId,
            startTime: rootSpan.startTime,
            endTime: rootSpan.endTime,
            projectName: rootSpan.projectName,
            spanName: rootSpan.spanName,
            annotationId: match?.id ?? "",
            note: match?.note ?? "",
            rating: match?.rating ?? "none",
            categories: match?.categories ?? [],
          };
        });

        setAnnotatedRootSpans(combined);
      } catch (error) {
        console.error("Failed to fetch root spans or annotations", error);
      }
    };

    fetchData();
  }, []);

  const handleCategorize = async () => {
    try {
      const traceCategories = await categorizeAnnotations();

      const updatedAnnotatedRootSpans = annotatedRootSpans.map((annotatedRootSpan) => {
        const match = traceCategories.find(
          ({ rootSpanId }) => rootSpanId === annotatedRootSpan.traceId
        );
        const categories = match ? match.categories : annotatedRootSpan.categories;
        return {
          ...annotatedRootSpan,
          categories,
        };
      });
      setAnnotatedRootSpans(updatedAnnotatedRootSpans);
    } catch (error) {
      console.log("Error categorizing annotations", error);
    }
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

      setAnnotatedRootSpans((prev) => {
        return prev.map((rootSpan) => {
          if (rootSpan.traceId === traceId) {
            return {
              ...rootSpan,
              note,
              rating,
            };
          } else {
            return rootSpan;
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
          element={
            <Traces
              annotatedTraces={annotatedRootSpans}
              onCategorize={handleCategorize}
            />
          }
        />
        <Route path="/traces/:id" element={<TraceDetails />} />
        <Route
          path="/annotation"
          element={
            <Annotation
              annotatedTraces={annotatedRootSpans}
              onSave={handleSaveAnnotation}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
