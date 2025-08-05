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

export const fetchBatch = async (id: string): Promise<{ id: string; name: string; rootSpanIds: string[] }> => {
  const response = await axios.get(`/api/batches/${id}`);
  return response.data.batchSummary;
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

export const fetchRootSpansByBatch = async (batchId: string): Promise<AnnotatedRootSpan[]> => {
  const response = await axios.get(`/api/batches/${batchId}`, {
    params: {
      numPerPage: 100
    }
  });
  return response.data.rootSpans;
}

export const fetchRootSpansByProject = async (
  projectId: string, 
  page: number = 0, 
  pageSize: number = 100
): Promise<{ rootSpans: AnnotatedRootSpan[]; totalCount: number }> => {
  console.log('🔄 Service API call:', { projectId, frontendPage: page, backendPageNumber: page + 1, pageSize });
  
  const config = {
    params: { 
      projectId,
      pageNumber: page + 1,  // Convert 0-based to 1-based indexing
      numberPerPage: pageSize  // Fix parameter name
    }
  };
  
  // Log the actual URL that will be called
  const url = new URL('/api/rootSpans', window.location.origin);
  Object.entries(config.params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });
  console.log('🌐 Actual URL being called:', url.toString());
  
  const response = await axios.get('/api/rootSpans', config);
  
  console.log('📥 Service API response structure:', {
    hasRootSpans: !!response.data.rootSpans,
    hasAnnotatedSpans: !!response.data.annotatedspans,
    rootSpansCount: response.data.rootSpans?.length || 0,
    annotatedSpansCount: response.data.annotatedspans?.length || 0,
    totalCount: response.data.totalCount,
    firstSpanId: response.data.annotatedspans?.[0]?.id || response.data.rootSpans?.[0]?.id || 'none'
  });
  
  // Your backend returns rootSpans in this case
  const spans = response.data.rootSpans || response.data.annotatedspans || [];
  
  return {
    rootSpans: spans,
    totalCount: response.data.totalCount || 0
  };
}