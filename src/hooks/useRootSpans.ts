import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  fetchRootSpansByBatch, 
  fetchRootSpansByProject,
  fetchUniqueSpanNames,
  fetchRandomSpans,
  fetchRootSpansByProjectFiltered,
  fetchEditBatchSpans
} from '../services/services';

// Query keys for different contexts
export const rootSpanKeys = {
  batch: (batchId: string) => ['rootSpans', 'batch', batchId] as const,
  project: (projectId: string) => ['rootSpans', 'project', projectId] as const,
};

// Hook for fetching root spans by batch
export const useRootSpansByBatch = (batchId: string | null) => {
  return useQuery({
    queryKey: batchId ? rootSpanKeys.batch(batchId) : ['rootSpans', 'batch', 'null'],
    queryFn: () => batchId ? fetchRootSpansByBatch(batchId) : Promise.resolve({ rootSpans: [], batchSummary: null, totalCount: 0 }),
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
  
  return useQuery({
    queryKey: ['rootSpans', 'project', projectId, 'paginated', page, pageSize],
    queryFn: async () => {
      if (!projectId) return { rootSpans: [], totalCount: 0 };
      const result = await fetchRootSpansByProject(projectId, page, pageSize);
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
      return {
        ...batchQuery,
        data: batchQuery.data ? batchQuery.data.rootSpans : []
      };     // ← Data from fetchRootSpansByBatch(context.id)
    case 'project':
      return {
        ...projectQuery,
        data: projectQuery.data || []
      };   // ← Data from fetchRootSpansByProject(context.id) - already converted to array
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

// Hook for fetching unique span names for a project
export const useUniqueSpanNames = (projectId: string | null) => {
  return useQuery({
    queryKey: ['spanNames', projectId],
    queryFn: () => projectId ? fetchUniqueSpanNames(projectId) : Promise.resolve([]),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 10, // Consider data fresh for 10 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });
};

// Hook for fetching random spans
export const useRandomSpans = (
  projectId: string | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['randomSpans', projectId],
    queryFn: () => 
      projectId 
        ? fetchRandomSpans(projectId)
        : Promise.resolve({ rootSpans: [], totalCount: 0 }),
    enabled: !!projectId && enabled,
    staleTime: 0, // Always fresh - random should be different each time
    gcTime: 1000 * 60 * 1, // Keep in cache for 1 minute only
  });
};

// Hook for fetching filtered root spans with pagination
export const useRootSpansByProjectFiltered = (
  projectId: string | null,
  page: number = 0,
  pageSize: number = 50,
  filters?: {
    searchText?: string;
    spanName?: string;
    dateFilter?: string;
    startDate?: string;
    endDate?: string;
  }
) => {
  return useQuery({
    queryKey: [
      'rootSpans', 
      'project', 
      projectId, 
      'filtered', 
      page, 
      pageSize, 
      filters?.searchText,
      filters?.spanName,
      filters?.dateFilter,
      filters?.startDate,
      filters?.endDate
    ],
    queryFn: async () => {
      if (!projectId) return { rootSpans: [], totalCount: 0 };
      return await fetchRootSpansByProjectFiltered(projectId, page, pageSize, filters);
    },
    enabled: !!projectId,
    staleTime: 1000 * 30, // Consider data fresh for 30 seconds
    gcTime: 1000 * 60 * 2, // Keep in cache for 2 minutes
    refetchOnWindowFocus: false
  });
};



// Hook for fetching edit batch spans with filtering
export const useEditBatchSpans = (
  batchId: string | null,
  page: number = 0,
  pageSize: number = 50,
  filters?: {
    searchText?: string;
    spanName?: string;
    dateFilter?: string;
    startDate?: string;
    endDate?: string;
  }
) => {
  return useQuery({
    queryKey: [
      'rootSpans', 
      'editBatch', 
      batchId, 
      'filtered', 
      page, 
      pageSize, 
      filters?.searchText,
      filters?.spanName,
      filters?.dateFilter,
      filters?.startDate,
      filters?.endDate
    ],
    queryFn: async () => {
      if (!batchId) return { rootSpans: [], totalCount: 0 };
      return await fetchEditBatchSpans(batchId, page, pageSize, filters);
    },
    enabled: !!batchId,
    staleTime: 1000 * 30, // Consider data fresh for 30 seconds
    gcTime: 1000 * 60 * 2, // Keep in cache for 2 minutes
    refetchOnWindowFocus: false
  });
}; 