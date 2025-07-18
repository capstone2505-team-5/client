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


// I need to make these real API calls
// For now, just a mock functions to simulate

export const fetchAnnotationQueues = async (): Promise<{ 
  id: string;
  name: string;
  totalSpans: number;
  annotatedCount: number;
  goodCount: number; }[]> => {
  // const response = await axios.get('/api/annotationQueues');
  // return response.data;

  return [
    { id: '1', name: 'Categorizer', totalSpans: 100, annotatedCount: 30, goodCount: 30 },
    { id: '2', name: 'Recipe App', totalSpans: 200, annotatedCount: 150, goodCount: 120 },
    { id: '3', name: 'Sbotify', totalSpans: 300, annotatedCount: 250, goodCount: 200 },
    { id: '4', name: 'Wine RAG', totalSpans: 400, annotatedCount: 350, goodCount: 300 },
  ];
}

export const createAnnotationQueue = async (data: { name: string; rootSpanIds: string[] }) => {
  // const response = await axios.post('/api/annotationQueues', data);
  // return response.data;

  return [
    { id: '1', name: data.name, count: data.rootSpanIds.length },
  ]
}

export const fetchAnnotationQueue = async (id: string): Promise<{ id: string; name: string; rootSpanIds: string[] }> => {
  // const response = await axios.get(`/api/annotationQueues/${id}`);
  // return response.data;

  return { id, name: 'Categorizer - Example for now', rootSpanIds: ['7a96ff0c2b27d316', '5126fd534f21e310', 'e17e73a03d076e6f'] };
}

export const updateAnnotationQueue = async (id: string, data: { name: string; rootSpanIds: string[] }) => {
  // const response = await axios.patch(`/api/annotationQueues/${id}`, data);
  // return response.data;

  return { id, name: data.name, rootSpanIds: data.rootSpanIds };
} 