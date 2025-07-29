import axios from 'axios';
import type { AnnotatedRootSpan, Annotation, Rating, Project } from '../types/types';

export const fetchRootSpans = async (): Promise<AnnotatedRootSpan[]> => {
  const response = await axios.get<AnnotatedRootSpan[]>('/api/rootSpans')
  return response.data
}

export const fetchRootSpan = async (id: string): Promise<AnnotatedRootSpan> => {
  const response = await axios.get<AnnotatedRootSpan>(`/api/rootSpan/${id}`);
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

export const categorizeAnnotations = async (): Promise<
  { rootSpanId: string; categories: string[] }[]
> => {
  const response = await axios.post("/api/categorize");
  return response.data;
};

export const fetchBatches = async (): Promise<{ 
  id: string;
  name: string;
  totalSpans: number;
  annotatedCount: number;
  goodCount: number; }[]> => {
  const response = await axios.get('/api/batches');
  return response.data;
}

export const fetchBatch = async (id: string): Promise<{ id: string; name: string; rootSpanIds: string[] }> => {
  const response = await axios.get(`/api/batches/${id}`);
  return response.data;
}

export const createBatch = async (data: { name: string; rootSpanIds: string[] }) => {
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
  const response = await axios.get('/api/phoenix/dashboard-url');
  return response.data;
};

export const fetchProjects = async (): Promise<Project[]> => {
  const response = await axios.get('/api/projects');
  return response.data;
}