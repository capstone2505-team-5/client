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
import RootSpans from "./components/RootSpans";
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
  const { invalidateBatch, invalidateProject } = useRootSpanMutations();
  
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
    // Used by EditBatch component - keeping for backwards compatibility
    if (currentContext?.type !== 'project' || currentContext?.id !== projectId) {
      setCurrentContext({ type: 'project', id: projectId });
    }
    
    // Update the last fetched tracker
    lastFetchedProjectId.current = projectId;
  }, [currentContext]);

  const handleSaveAnnotation = async (
    annotationId: string,
    rootSpanId: string,
    note: string,
    rating: Rating | null
  ): Promise<{ isNew: boolean }> => {
    let res: any = null;
    const isNew = annotationId === "";
    
    try {
      if (isNew) {
        if (rating) {
          res = await createAnnotation(rootSpanId, note || "", rating);
        }
      } else {
        if (rating) {
          res = await updateAnnotation(annotationId, note || "", rating);
        }
      }

      // Instead of optimistic updates, just invalidate the relevant caches
      // This will trigger a refetch with fresh data from the server
      if (currentContext?.type === 'batch' && currentContext.id) {
        invalidateBatch(currentContext.id);
      } else if (currentContext?.type === 'project' && currentContext.id) {
        invalidateProject(currentContext.id);
      }

      if (res) {
        console.log(
          isNew ? "Annotation created:" : "Annotation updated:",
          res
        );
      }
      
      return { isNew };
    } catch (err) {
      console.error("Failed to save annotation", err);
      throw err; // Re-throw the error so the Annotation component can handle it
    }
  };

  const handleCreateBatch = useCallback(async (name: string, projectId: string, rootSpanIds: string[]) => {
    try {
      const { id: batchId } = await createBatch({ name, projectId, rootSpanIds });

      // Let the server handle the updates, just invalidate caches to refetch fresh data
      invalidateProject(projectId);
      
      // Also invalidate the batches query so the batches list updates
      queryClient.invalidateQueries({ queryKey: ['batches', projectId] });
      
      // Return the batch ID so the calling component can use it
      return batchId;
    } catch (error) {
      console.error("Failed to create batch", error);
      throw error; // Re-throw so calling component can handle the error
    }
  }, [invalidateProject, queryClient]);

  const handleUpdateBatch = async (
    batchId: string,
    name: string,
    rootSpanIds: string[]
  ) => {
    try {
      await updateBatch(batchId, { name, rootSpanIds });

      // Instead of optimistic updates, just invalidate the batch cache
      // This will trigger a refetch with fresh data from the server
      invalidateBatch(batchId);
    } catch (error) {
      console.error('Failed to update batch', error);
    }
  };

  // handleSpansOnDeleteBatch function removed - database handles cleanup automatically

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
          <Route path="/projects/:projectId" element={<Batches />} />
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
                onCreateBatch={handleCreateBatch}
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
            path="/projects/:projectId/batches/:batchId/annotation/:rootSpanId"
            element={
              <Annotation
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
