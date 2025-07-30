import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Box, ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useTheme } from "./contexts/ThemeContext";
import { darkTheme, lightTheme } from "./theme/theme";
import FilteredAnnotation from "./components/FilteredAnnotation";
import Home from "./components/Home";
import Projects from "./components/Projects";
import Batches from "./components/Batches";
import NavBar from "./components/NavBar";
import CreateBatch from "./components/CreateBatch";
import RootSpanDetails from "./components/RootSpanDetails";
import Footer from "./components/Footer";
import type { AnnotatedRootSpan, Rating } from "./types/types";
import RootSpans from "./components/RootSpans";
import {
  fetchRootSpans,
  fetchRootSpansByBatch,
  fetchRootSpansByProject,
  categorizeAnnotations,
} from "./services/services";
import { createAnnotation, updateAnnotation, createBatch, updateBatch } from "./services/services";
import EditBatch from "./components/EditBatch";

const App = () => {
  const [annotatedRootSpans, setAnnotatedRootSpans] = useState<AnnotatedRootSpan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentContext, setCurrentContext] = useState<{
    type: 'all' | 'batch' | 'project';
    id?: string;
  }>({ type: 'all' });

  // Generic fetch function that handles different contexts
  const fetchData = async (context: { type: 'all' | 'batch' | 'project'; id?: string }) => {
    try {
      setIsLoading(true);
      let rootSpans: AnnotatedRootSpan[] = [];

      switch (context.type) {
        case 'batch':
          if (context.id) {
            rootSpans = await fetchRootSpansByBatch(context.id);
          }
          break;
        case 'project':
          if (context.id) {
            rootSpans = await fetchRootSpansByProject(context.id);
          }
          break;
        case 'all':
        default:
          rootSpans = await fetchRootSpans();
          break;
      }

      setAnnotatedRootSpans(rootSpans);
      setCurrentContext(context);
    } catch (error) {
      console.error("Failed to fetch root spans", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Functions that child components can call to trigger specific fetches
  const loadRootSpansByBatch = (batchId: string) => {
    fetchData({ type: 'batch', id: batchId });
  };

  const loadRootSpansByProject = (projectId: string) => {
    fetchData({ type: 'project', id: projectId });
  };

  const loadAllRootSpans = () => {
    fetchData({ type: 'all' });
  };

  // Refresh current context (useful after updates)
  const refreshCurrentData = () => {
    fetchData(currentContext);
  };

  const handleCategorize = async () => {
    try {
      const rootSpanCategories = await categorizeAnnotations();

      const updatedAnnotatedRootSpans = annotatedRootSpans.map((annotatedRootSpan) => {
        const match = rootSpanCategories.find(
          ({ rootSpanId }) => rootSpanId === annotatedRootSpan.id
        );
        const categories = match ? match.categories : annotatedRootSpan.annotation?.categories || [];
        return {
          ...annotatedRootSpan,
          annotation: annotatedRootSpan.annotation ? {
            ...annotatedRootSpan.annotation,
            categories
          } : null
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
    rating: Rating | null
  ): Promise<void> => {
    try {
      let res: any = null;
      if (annotationId === "") {
        if (rating) {
          res = await createAnnotation(rootSpanId, note || "", rating);
        }
      } else {
        if (rating) {
          res = await updateAnnotation(annotationId, note || "", rating);
        }
      }

      setAnnotatedRootSpans((prev) => {
        return prev.map((rootSpan) => {
          if (rootSpan.id === rootSpanId) {
            return {
              ...rootSpan,
              annotation: rating ? {
                id: annotationId || res?.id || '',
                note: note || '',
                rating,
                categories: rootSpan.annotation?.categories || []
              } : null
            };
          } else {
            return rootSpan;
          }
        });
      });

      if (res) {
        console.log(
          annotationId ? "Annotation updated:" : "Annotation created:",
          res
        );
      }
    } catch (err) {
      console.error("Failed to save annotation", err);
    }
  };

  const handleCreateBatch = async (name: string, projectId: string, rootSpanIds: string[]) => {
    try {
      const { id: batchId } = await createBatch({ name, projectId, rootSpanIds });

      const idSet = new Set(rootSpanIds);
      setAnnotatedRootSpans(prev =>
        prev.map(span =>
          idSet.has(span.id) ? { ...span, batchId: batchId } : span
        )
      );
    } catch (error) {
      console.error("Failed to create batch", error);
    }
  };

  const handleUpdateBatch = async (
    batchId: string,
    name: string,
    rootSpanIds: string[]
  ) => {
    try {
      await updateBatch(batchId, { name, rootSpanIds });

      const keepSet = new Set(rootSpanIds);

      setAnnotatedRootSpans(prev =>
        prev.map(span => {
          const inBatchNow   = span.batchId === batchId;
          const shouldBeIn   = keepSet.has(span.id);

          if (!inBatchNow && shouldBeIn) {
            return { ...span, batchId: batchId };
          }

          if (inBatchNow && !shouldBeIn) {
            return { ...span, batchId: null };
          }

          return span;
        })
      );
    } catch (error) {
      console.error('Failed to update batch', error);
    }
  };

  const handleSpansOnDeleteBatch = async (batchId: string) => {
    try {
      setAnnotatedRootSpans(prev =>
        prev.map(span => (span.batchId === batchId ? { ...span, batchId: null } : span))
      );
    } catch (error) {
      console.error("Failed to delete batch", error);
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
          <Route path="/projects/:id" element={<Batches onDeleteBatch={handleSpansOnDeleteBatch} />} />
          <Route
            path="/batches/create"
            element={
              <CreateBatch
                annotatedRootSpans={annotatedRootSpans}
                onLoadRootSpans={loadRootSpansByProject}
                onCreateBatch={handleCreateBatch}
              />
            }
          />
          <Route
            path="/batches/:id/edit"
            element={
              <EditBatch
                annotatedRootSpans={annotatedRootSpans}
                onUpdateBatch={handleUpdateBatch}
              />
            }
          />
          <Route
            path="/batches/:id"
            element={
              <RootSpans
                annotatedRootSpans={annotatedRootSpans}
                onLoadRootSpans={loadRootSpansByBatch}
                onCategorize={handleCategorize}
              />
            }
          />
          <Route path="/rootSpans/:id" element={<RootSpanDetails />} />
          <Route
            path="/batches/:id/annotation"
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
