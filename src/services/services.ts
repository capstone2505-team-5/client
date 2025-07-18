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

export const fetchAnnotationQueues = async (): Promise<{ id: string; name: string; count: number }[]> => {
  // const response = await axios.get('/api/annotationQueues');
  // return response.data;

  return [
    { id: '1', name: 'Queue 1', count: 5 },
    { id: '2', name: 'Queue 2', count: 3 },
    { id: '3', name: 'Queue 3', count: 8 },
    { id: '4', name: 'Queue 4', count: 2 },
    { id: '5', name: 'Queue 5', count: 10 },
  ];
}

export const createAnnotationQueue = async (data: { name: string; rootSpanIds: string[] }) => {
  const response = await axios.post('/api/annotationQueues', data);
  return response.data;
}