import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Box, ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useTheme } from "./contexts/ThemeContext";
import { darkTheme, lightTheme } from "./theme/theme";
import FilteredAnnotation from "./components/FilteredAnnotation";
import Home from "./components/Home";
import Projects from "./components/Projects";
import Queues from "./components/Queues";
import NavBar from "./components/NavBar";
import CreateQueue from "./components/CreateQueue";
import RootSpanDetails from "./components/RootSpanDetails";
import Footer from "./components/Footer";
import type { AnnotatedRootSpan, Rating } from "./types/types";
import FilteredRootSpans from "./components/FilteredRootSpans";
import {
  fetchRootSpans,
  fetchAnnotations,
  categorizeAnnotations,
} from "./services/services";
import { createAnnotation, updateAnnotation, createQueue, updateQueue } from "./services/services";
import EditQueue from "./components/EditQueue";

const App = () => {
  const [annotatedRootSpans, setAnnotatedRootSpans] = useState<AnnotatedRootSpan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
            created_at: rootSpan.created_at,
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

  const handleCreateQueue = async (name: string, rootSpanIds: string[]) => {
    try {
      const { id: queueId } = await createQueue({ name, rootSpanIds });

      const idSet = new Set(rootSpanIds);
      setAnnotatedRootSpans(prev =>
        prev.map(span =>
          idSet.has(span.id) ? { ...span, queueId } : span
        )
      );
    } catch (error) {
      console.error("Failed to create queue", error);
    }
  };

  const handleUpdateQueue = async (
    queueId: string,
    name: string,
    rootSpanIds: string[]
  ) => {
    try {
      await updateQueue(queueId, { name, rootSpanIds });

      const keepSet = new Set(rootSpanIds);

      setAnnotatedRootSpans(prev =>
        prev.map(span => {
          const inQueueNow   = span.queueId === queueId;
          const shouldBeIn   = keepSet.has(span.id);

          if (!inQueueNow && shouldBeIn) {
            return { ...span, queueId };
          }

          if (inQueueNow && !shouldBeIn) {
            return { ...span, queueId: null };
          }

          return span;
        })
      );
    } catch (error) {
      console.error('Failed to update queue', error);
    }
  };

  const handleSpansOnDeleteQueue = async (queueId: string) => {
    try {
      setAnnotatedRootSpans(prev =>
        prev.map(span => (span.queueId === queueId ? { ...span, queueId: null } : span))
      );
    } catch (error) {
      console.error("Failed to delete queue", error);
    }
  };

  const AppContent = () => {
    const { isDarkMode } = useTheme();
    const showNavBar = true; // Always show NavBar now

    return (
      <MuiThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {showNavBar && <NavBar />}
          <Box component="main" sx={{ flex: 1 }}>
            <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/queues" element={<Queues onDeleteQueue={handleSpansOnDeleteQueue} />} />
          <Route
            path="/create-queue"
            element={
              <CreateQueue
                annotatedRootSpans={annotatedRootSpans}
                onCreateQueue={handleCreateQueue}
              />
            }
          />
          <Route
            path="/edit-queue/:id"
            element={
              <EditQueue
                annotatedRootSpans={annotatedRootSpans}
                onUpdateQueue={handleUpdateQueue}
              />
            }
          />
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
          </Box>
          <Footer />
        </Box>
      </MuiThemeProvider>
    );
  };

  if (isLoading) {
    return <>Loading...</>
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
