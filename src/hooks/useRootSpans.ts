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
    queryFn: async () => {
      if (!projectId) return [];
      const result = await fetchRootSpansByProject(projectId);
      // Handle both old and new response formats
      return Array.isArray(result) ? result : result.rootSpans;
    },
    enabled: !!projectId, // Only run query if projectId exists
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
  });
};

// Hook for fetching root spans by project with pagination (for CreateBatch)
export const useRootSpansByProjectPaginated = (
  projectId: string | null,
  page: number = 0,
  pageSize: number = 50
) => {
  console.log('🎯 useRootSpansByProjectPaginated called:', { projectId, page, pageSize });
  
  return useQuery({
    queryKey: ['rootSpans', 'project', projectId, 'paginated', page, pageSize],
    queryFn: async () => {
      console.log('🚀 Query function executing for:', { projectId, page, pageSize });
      if (!projectId) return { rootSpans: [], totalCount: 0 };
      const result = await fetchRootSpansByProject(projectId, page, pageSize);
      console.log('✅ Query function result:', {
        rootSpansCount: result.rootSpans.length,
        totalCount: result.totalCount,
        firstSpanId: result.rootSpans[0]?.id || 'none'
      });
      return result;
    },
    enabled: !!projectId,
    staleTime: 0, // No stale time - always refetch when params change
    gcTime: 1000 * 60 * 2, // Keep in cache for 2 minutes
    refetchOnWindowFocus: false // Don't refetch on window focus
  });
};

// Unified context hook that routes to the appropriate query based on context
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
      throw new Error(`Unsupported context type: ${(context as any).type}`);
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

  return {
    invalidateAll,
    invalidateBatch,
    invalidateProject,
  };
}; 