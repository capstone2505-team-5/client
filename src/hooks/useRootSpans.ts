import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  fetchRootSpansByBatch, 
  fetchRootSpansByProject 
} from '../services/services';
import type { AnnotatedRootSpan } from '../types/types';

// Query keys for different contexts
export const rootSpanKeys = {
  batch: (batchId: string) => ['rootSpans', 'batch', batchId] as const,
  project: (projectId: string) => ['rootSpans', 'project', projectId] as const,
};

// Hook for fetching root spans by batch
export const useRootSpansByBatch = (batchId: string | null) => {
  return useQuery({
    queryKey: batchId ? rootSpanKeys.batch(batchId) : ['rootSpans', 'batch', 'null'],
    queryFn: () => batchId ? fetchRootSpansByBatch(batchId) : Promise.resolve([]),
    enabled: !!batchId, // Only run query if batchId exists
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
  });
};

// Hook for fetching root spans by project
export const useRootSpansByProject = (projectId: string | null) => {
  return useQuery({
    queryKey: projectId ? rootSpanKeys.project(projectId) : ['rootSpans', 'project', 'null'],
    queryFn: () => projectId ? fetchRootSpansByProject(projectId) : Promise.resolve([]),
    enabled: !!projectId, // Only run query if projectId exists
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Unified hook that handles project and batch contexts only
export const useRootSpansContext = (context: {
  type: 'batch' | 'project';
  id?: string;
} | null) => {
  // Always call hooks (Rules of Hooks) - but with null when no context
  const batchQuery = useRootSpansByBatch(
    context?.type === 'batch' ? context.id || null : null
  );
  const projectQuery = useRootSpansByProject(
    context?.type === 'project' ? context.id || null : null
  );

  // If no context, return empty state
  if (!context) {
    return { data: [], isLoading: false, error: null };
  }

  // Return the relevant query based on context
  // This is what becomes your `annotatedRootSpans` data
  switch (context.type) {
    case 'batch':
      return batchQuery;     // ← Data from fetchRootSpansByBatch(context.id)
    case 'project':
      return projectQuery;   // ← Data from fetchRootSpansByProject(context.id)
    default:
      // This should never happen now
      throw new Error(`Unsupported context type: ${context.type}`);
  }
};

// Utility hook for invalidating queries when data changes
export const useRootSpanMutations = () => {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['rootSpans'] });
  };

  const invalidateBatch = (batchId: string) => {
    queryClient.invalidateQueries({ queryKey: rootSpanKeys.batch(batchId) });
  };

  const invalidateProject = (projectId: string) => {
    queryClient.invalidateQueries({ queryKey: rootSpanKeys.project(projectId) });
  };

  // Update cached data optimistically without refetching
  const updateRootSpanInCache = (
    rootSpanId: string, 
    updater: (span: AnnotatedRootSpan) => AnnotatedRootSpan
  ) => {
    // Update in all relevant caches
    queryClient.setQueriesData(
      { queryKey: ['rootSpans'] },
      (oldData: AnnotatedRootSpan[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(span => 
          span.id === rootSpanId ? updater(span) : span
        );
      }
    );
  };

  return {
    invalidateAll,
    invalidateBatch,
    invalidateProject,
    updateRootSpanInCache,
  };
}; 