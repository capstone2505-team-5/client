import axios from 'axios';
import type { AnnotatedRootSpan, Annotation, Rating, Project, Batch } from '../types/types';

export const fetchRootSpan = async (id: string): Promise<AnnotatedRootSpan> => {
  const response = await axios.get<AnnotatedRootSpan>(`/api/rootSpans/${id}`);
  return response.data;
}

export const fetchAnnotations = async (): Promise<Annotation[]> => {
  const response = await axios.get<Annotation[]>('/api/annotations')
  return response.data
}

export const fetchAnnotation = async (id: string): Promise<Annotation> => {
  const response = await axios.get<Annotation>(`/api/annotations/${id}`)
  return response.data
}

export const createAnnotation = async (rootSpanId: string, note: string, rating: Rating) => {
  const response = await axios.post(`/api/annotations`, {rootSpanId, note, rating})
  return response.data
}

export const updateAnnotation = async (annotationId: string, note: string, rating: Rating) => {
  const response = await axios.patch(`/api/annotations/${annotationId}`, {annotationId, note, rating})
  return response.data
}

export const deleteAnnotation = async (annotationId: string) => {
  const response = await axios.delete(`/api/annotations/${annotationId}`);
  return response.data;
}

export const categorizeAnnotations = async (batchId: string): Promise<
  Record<string, number>
> => {
  const response = await axios.post(`/api/categorize/${batchId}`);
  return response.data;
};

export const fetchBatches = async (projectId: string): Promise<Batch[]> => {
  const response = await axios.get(`/api/projects/${projectId}`);
  return response.data;
}



export const createBatch = async (data: { name: string; projectId: string; rootSpanIds: string[] }) => {
  const response = await axios.post('/api/batches', data);
  return response.data;
}

export const updateBatch = async (id: string, data: { name: string; rootSpanIds: string[] }) => {
  const response = await axios.put(`/api/batches/${id}`, data);
  return response.data;
} 

export const deleteBatch = async (id: string) => {
  const response = await axios.delete(`/api/batches/${id}`);
  return response.data;
}

export const deleteRootSpan = async (batchId: string, spanId: string) => {
  const response = await axios.delete(`/api/batches/${batchId}/spans/${spanId}`);
  return response.data;
}

export const getPhoenixDashboardUrl = async (): Promise<string> => {
  const response = await axios.get('/api/phoenixDashboardUrl');
  return response.data;
};

export const fetchProjects = async (): Promise<Project[]> => {
  const response = await axios.get('/api/projects');
  return response.data;
}

export const fetchRootSpansByBatch = async (batchId: string): Promise<{
  rootSpans: AnnotatedRootSpan[];
  batchSummary: { id: string; name: string; projectId: string; createdAt: string; validRootSpanCount: number; percentAnnotated: number | null; percentGood: number | null; categories: string[] } | null;
  totalCount: number;
}> => {
  const response = await axios.get(`/api/batches/${batchId}`, {
    params: {
      numPerPage: 100
    }
  });
  return response.data;
}

export const fetchRootSpansByProject = async (
  projectId: string, 
  page: number = 0, 
  pageSize: number = 100
): Promise<{ rootSpans: AnnotatedRootSpan[]; totalCount: number }> => {
  const config = {
    params: { 
      projectId,
      pageNumber: page + 1,  // Convert 0-based to 1-based indexing
      numPerPage: pageSize  // Fixed: backend expects 'numPerPage', not 'numberPerPage'
    }
  };
  
  const response = await axios.get('/api/rootSpans', config);
  
  // Your backend returns rootSpans in this case
  const spans = response.data.rootSpans || response.data.annotatedspans || [];
  
  return {
    rootSpans: spans,
    totalCount: response.data.totalCount || 0
  };
}

export const fetchUniqueSpanNames = async (projectId: string): Promise<string[]> => {
  const response = await axios.get(`/api/projects/${projectId}/spanNames`);
  return response.data.spanNames;
};

export const fetchRandomSpans = async (
  projectId: string
): Promise<{ rootSpans: AnnotatedRootSpan[]; totalCount: number }> => {
  const response = await axios.get(`/api/projects/${projectId}/randomSpans`);
  
  return {
    rootSpans: response.data.rootSpans || [],
    totalCount: response.data.totalCount || 0
  };
};

export const fetchRootSpansByProjectFiltered = async (
  projectId: string, 
  page: number = 0, 
  pageSize: number = 100,
  filters?: {
    searchText?: string;
    spanName?: string;
    dateFilter?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<{ rootSpans: AnnotatedRootSpan[]; totalCount: number }> => {
  const params: any = { 
    projectId,
    pageNumber: page + 1,  // Convert 0-based to 1-based indexing
    numPerPage: pageSize
  };
  
  // Add filter parameters
  if (filters?.searchText) params.searchText = filters.searchText;
  if (filters?.spanName) params.spanName = filters.spanName;
  if (filters?.dateFilter) params.dateFilter = filters.dateFilter;
  if (filters?.startDate) params.startDate = filters.startDate;
  if (filters?.endDate) params.endDate = filters.endDate;
  
  const response = await axios.get('/api/rootSpans', { params });
  
  const spans = response.data.rootSpans || response.data.annotatedspans || [];
  
  return {
    rootSpans: spans,
    totalCount: response.data.totalCount || 0
  };
};

export const fetchEditBatchSpans = async (
  batchId: string, 
  page: number = 0, 
  pageSize: number = 100,
  filters?: {
    searchText?: string;
    spanName?: string;
    dateFilter?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<{ rootSpans: AnnotatedRootSpan[]; totalCount: number }> => {
  const params: any = { 
    batchId,
    pageNumber: page + 1,  // Convert 0-based to 1-based indexing
    numPerPage: pageSize
  };
  
  // Add filter parameters
  if (filters?.searchText) params.searchText = filters.searchText;
  if (filters?.spanName) params.spanName = filters.spanName;
  if (filters?.dateFilter) params.dateFilter = filters.dateFilter;
  if (filters?.startDate) params.startDate = filters.startDate;
  if (filters?.endDate) params.endDate = filters.endDate;
  
  const response = await axios.get('/api/batches/edit', { params });
  
  const spans = response.data.editBatchRootSpans || [];
  
  return {
    rootSpans: spans,
    totalCount: response.data.totalCount || 0
  };
};