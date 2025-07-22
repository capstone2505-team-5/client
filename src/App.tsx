import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import FilteredAnnotation from "./components/FilteredAnnotation";
import Home from "./components/Home";
import Queues from "./components/Queues";
import NavBar from "./components/NavBar";
import CreateQueue from "./components/CreateQueue";
import RootSpanDetails from "./components/RootSpanDetails";
import type { AnnotatedRootSpan, Rating } from "./types/types";
import FilteredRootSpans from "./components/FilteredRootSpans";
import {
  fetchRootSpans,
  fetchAnnotations,
  categorizeAnnotations,
} from "./services/services";
import { createAnnotation, updateAnnotation } from "./services/services";
import EditQueue from "./components/EditQueue";

const App = () => {
  const [annotatedRootSpans, setAnnotatedRootSpans] = useState<AnnotatedRootSpan[]>([]);
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [rootSpans, annotations] = await Promise.all([
          fetchRootSpans(),
          fetchAnnotations(),
        ]);

        const combined: AnnotatedRootSpan[] = rootSpans.map((rootSpan) => {
          const match = annotations.find(
            (annotation) => annotation.rootSpanId === rootSpan.id
          );

          return {
            id: rootSpan.id,
            input: rootSpan.input,
            output: rootSpan.output,
            traceId: rootSpan.traceId,
            queueId: rootSpan.queueId,
            startTime: rootSpan.startTime,
            endTime: rootSpan.endTime,
            tsStart: Date.parse(rootSpan.startTime),
            tsEnd: Date.parse(rootSpan.endTime),
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
      } finally {
        setIsLoading(false)
      }
    };

    fetchData();
  }, []);

  const handleCategorize = async () => {
    try {
      const rootSpanCategories = await categorizeAnnotations();

      const updatedAnnotatedRootSpans = annotatedRootSpans.map((annotatedRootSpan) => {
        const match = rootSpanCategories.find(
          ({ rootSpanId }) => rootSpanId === annotatedRootSpan.id
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
    rootSpanId: string,
    note: string,
    rating: Rating
  ): Promise<void> => {
    try {
      let res;
      if (annotationId === "") {
        res = await createAnnotation(rootSpanId, note || "", rating || "none");
      } else {
        res = await updateAnnotation(
          annotationId,
          note || "",
          rating || "none"
        );
      }

      setAnnotatedRootSpans((prev) => {
        return prev.map((rootSpan) => {
          if (rootSpan.id === rootSpanId) {
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

  if (isLoading) {
    return <>Loading...</>
  }


  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/queues" element={<Queues />} />
        <Route path="/create-queue" element={<CreateQueue annotatedRootSpans={annotatedRootSpans}/>} />
        <Route path="/edit-queue/:id" element={<EditQueue annotatedRootSpans={annotatedRootSpans}/>} />
        <Route
          path="/queues/:id"
          element={
            <FilteredRootSpans
              allSpans={annotatedRootSpans}
              onCategorize={handleCategorize}
            />
          }
        />
        <Route path="/rootSpans/:id" element={<RootSpanDetails />} />
        <Route
          path="/queues/:id/annotation"
          element={
            <FilteredAnnotation
              allSpans={annotatedRootSpans}
              onSave={handleSaveAnnotation}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
