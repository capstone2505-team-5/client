import { useState, useCallback, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Box, ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useTheme } from "./contexts/ThemeContext";
import { darkTheme, lightTheme } from "./theme/theme";
import Annotation from "./components/Annotation";
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
  categorizeAnnotations,
} from "./services/services";
import { createAnnotation, updateAnnotation, createBatch, updateBatch } from "./services/services";
import EditBatch from "./components/EditBatch";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { useRootSpansContext, useRootSpanMutations } from "./hooks/useRootSpans";

const queryClient = new QueryClient();

const AppWithQuery = () => {
  // Keep track of current context for the unified query
  const [currentContext, setCurrentContext] = useState<{
    type: 'batch' | 'project';
    id?: string;
  } | null>(null); // Start with null - no data loaded initially

  // Use TanStack Query instead of manual state management
  // Always call the hook - handle null context inside the hook
  const { data: annotatedRootSpans = [], isLoading, error } = useRootSpansContext(currentContext);
  const { updateRootSpanInCache, invalidateAll, invalidateBatch, invalidateProject } = useRootSpanMutations();
  
  // Add the queryClient hook
  const queryClient = useQueryClient();

  // Track last fetched IDs to maintain your existing logic
  const lastFetchedBatchId = useRef<string | null>(null);
  const lastFetchedProjectId = useRef<string | null>(null);

  // Functions that child components can call - now just update context for TanStack Query
  const loadRootSpansByBatch = useCallback((batchId: string) => {
    if (batchId !== lastFetchedBatchId.current) {
      console.log('App level: Loading batch', batchId, 'lastFetched:', lastFetchedBatchId.current);
      lastFetchedBatchId.current = batchId;
      setCurrentContext({ type: 'batch', id: batchId });
    } else {
      console.log('App level: Skipping batch fetch, already loaded:', batchId);
    }
  }, []);

  const loadRootSpansByProject = useCallback((projectId: string) => {
    if (projectId !== lastFetchedProjectId.current) {
      console.log('App level: Loading project', projectId, 'lastFetched:', lastFetchedProjectId.current);
      lastFetchedProjectId.current = projectId;
      setCurrentContext({ type: 'project', id: projectId });
    } else {
      console.log('App level: Skipping project fetch, already loaded:', projectId);
    }
  }, []);

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

      // Optimistically update the cache
      updateRootSpanInCache(rootSpanId, (span) => ({
        ...span,
        annotation: rating ? {
          id: annotationId || res?.id || '',
          note: note || '',
          rating,
          categories: span.annotation?.categories || []
        } : null
      }));

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

  const handleCreateBatch = useCallback(async (name: string, projectId: string, rootSpanIds: string[]) => {
    try {
      const { id: batchId } = await createBatch({ name, projectId, rootSpanIds });

      // Optimistically update spans with new batch ID
      const idSet = new Set(rootSpanIds);
      rootSpanIds.forEach(rootSpanId => {
        updateRootSpanInCache(rootSpanId, (span) => ({ ...span, batchId }));
      });

      // Invalidate related queries to ensure consistency
      invalidateProject(projectId);
      
      // Also invalidate the batches query so the batches list updates
      queryClient.invalidateQueries({ queryKey: ['batches', projectId] });
      
      // Return the batch ID so the calling component can use it
      return batchId;
    } catch (error) {
      console.error("Failed to create batch", error);
      throw error; // Re-throw so calling component can handle the error
    }
  }, [updateRootSpanInCache, invalidateProject, queryClient]);

  const handleUpdateBatch = async (
    batchId: string,
    name: string,
    rootSpanIds: string[]
  ) => {
    try {
      await updateBatch(batchId, { name, rootSpanIds });

      const keepSet = new Set(rootSpanIds);

      // Update all spans in cache
      annotatedRootSpans.forEach(span => {
        const inBatchNow = span.batchId === batchId;
        const shouldBeIn = keepSet.has(span.id);

        if (!inBatchNow && shouldBeIn) {
          updateRootSpanInCache(span.id, s => ({ ...s, batchId: batchId }));
        } else if (inBatchNow && !shouldBeIn) {
          updateRootSpanInCache(span.id, s => ({ ...s, batchId: null }));
        }
      });

      // Invalidate batch-specific queries
      invalidateBatch(batchId);
    } catch (error) {
      console.error('Failed to update batch', error);
    }
  };

  const handleSpansOnDeleteBatch = async (batchId: string) => {
    try {
      // Update spans to remove batch association
      annotatedRootSpans.forEach(span => {
        if (span.batchId === batchId) {
          updateRootSpanInCache(span.id, s => ({ ...s, batchId: null }));
        }
      });

      // Invalidate queries
      invalidateAll();
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
          <Route path="/projects/:projectId" element={<Batches onDeleteBatch={handleSpansOnDeleteBatch} />} />
          <Route
            path="/projects/:projectId/batches/:batchId"
            element={
              <RootSpans
                annotatedRootSpans={annotatedRootSpans}
                onLoadRootSpans={loadRootSpansByBatch}
                isLoading={isLoading}
              />
            }
          />
          <Route
            path="/projects/:projectId/batches/create"
            element={
              <CreateBatch
                annotatedRootSpans={annotatedRootSpans}
                onLoadRootSpans={loadRootSpansByProject}
                onCreateBatch={handleCreateBatch}
                isLoading={isLoading}
              />
            }
          />
          <Route
            path="/projects/:projectId/batches/:batchId/edit"
            element={
              <EditBatch
                annotatedRootSpans={annotatedRootSpans}
                onLoadRootSpans={loadRootSpansByProject}
                onUpdateBatch={handleUpdateBatch}
                isLoading={isLoading}
              />
            }
          />

          <Route path="/projects/:projectId/batches/:batchId/rootSpans/:rootSpanId" element={<RootSpanDetails />} />
          <Route
            path="/projects/:projectId/batches/:batchId/annotation" // TODO: change to annotation/:rootSpanId
            element={
              <Annotation
                annotatedRootSpans={annotatedRootSpans}
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

  if (error) {
    return <>Error loading data: {error.message}</>
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppWithQuery />
    </QueryClientProvider>
  );
};

export default App;
