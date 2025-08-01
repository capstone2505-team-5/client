import axios from 'axios';
import type { AnnotatedRootSpan, Annotation, Rating, Project } from '../types/types';

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

export const categorizeAnnotations = async (batchId: string): Promise<
  Record<string, number>
> => {
  const response = await axios.post(`/api/categorize/${batchId}`);
  return response.data;
};

export const fetchBatches = async (projectId: string): Promise<{ 
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
  spanCount: number;
  percentAnnotated: number;
  percentGood: number;
  categories: Record<string, number>; }[]> => {
  const response = await axios.get(`/api/projects/${projectId}`);
  return response.data;
}

export const fetchBatch = async (id: string): Promise<{ id: string; name: string; rootSpanIds: string[] }> => {
  const response = await axios.get(`/api/batches/${id}`);
  return response.data.batchSummary; // Backend returns { rootSpans, batchSummary, totalCount }
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
      numPerPage: 200
    }
  });
  return response.data.rootSpans; // Backend returns { rootSpans, batchSummary, totalCount }
}

export const fetchRootSpansByProject = async (projectId: string): Promise<AnnotatedRootSpan[]> => {
  const response = await axios.get('/api/rootSpans', {
    params: { 
      projectId,
      numPerPage: 2000 // Large number to get all spans
    }
  });
  return response.data.rootSpans; // Backend returns { rootSpans, totalCount }
}

// Fetch unbatched spans for a project (useful for CreateBatch)
export const fetchBatchlessSpansByProject = async (projectId: string): Promise<AnnotatedRootSpan[]> => {
  const response = await axios.get('/api/batches/unbatched', {
    params: { 
      projectId,
      numPerPage: 1000 // Large number to get all spans
    }
  });
  return response.data.batchlessRootSpans; // Backend returns { batchlessRootSpans, totalCount }
}