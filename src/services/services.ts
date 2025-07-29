import axios from 'axios';
import type { RootSpan, Annotation } from '../types/types';

export const fetchRootSpans = async (): Promise<RootSpan[]> => {
  const response = await axios.get<RootSpan[]>('/api/rootSpans');
  return response.data;
}

export const fetchRootSpan = async (id: string): Promise<RootSpan> => {
  const response = await axios.get<RootSpan>(`/api/rootSpan/${id}`);
  return response.data;
}

export const fetchAnnotations = async (): Promise<Annotation[]> => {
  const response = await axios.get<Annotation[]>('/api/annotations')
  return response.data;
}

export const fetchAnnotation = async (id: string): Promise<Annotation> => {
  const response = await axios.get<Annotation>(`/api/annotations/${id}`)
  return response.data
}

export const createAnnotation = async (rootSpanId: string, note: string, rating: string) => {
  const response = await axios.post(`/api/annotations`, {rootSpanId, note, rating})
  return response.data
}

export const updateAnnotation = async (annotationId: string, note: string, rating: string) => {
  const response = await axios.patch(`/api/annotations/${annotationId}`, {annotationId, note, rating})
  return response.data
}

export const categorizeAnnotations = async (): Promise<
  { rootSpanId: string; categories: string[] }[]
> => {
  const response = await axios.post("/api/categorize");
  return response.data;
};

export const fetchQueues = async (): Promise<{ 
  id: string;
  name: string;
  totalSpans: number;
  annotatedCount: number;
  goodCount: number; }[]> => {
  const response = await axios.get('/api/queues');
  return response.data;
}

export const fetchQueue = async (id: string): Promise<{ id: string; name: string; rootSpanIds: string[] }> => {
  const response = await axios.get(`/api/queues/${id}`);
  return response.data;
}

export const createQueue = async (data: { name: string; rootSpanIds: string[] }) => {
  const response = await axios.post('/api/queues', data);
  return response.data;
}

export const updateQueue = async (id: string, data: { name: string; rootSpanIds: string[] }) => {
  const response = await axios.put(`/api/queues/${id}`, data);
  return response.data;
} 

export const deleteQueue = async (id: string) => {
  const response = await axios.delete(`/api/queues/${id}`);
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