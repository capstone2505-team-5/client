import axios from 'axios';
import type { Trace, RootSpan, Annotation } from '../types/types';

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

export const createAnnotation = async (traceId: string, note: string, rating: string) => {
  const response = await axios.post(`/api/annotations`, {traceId, note, rating})
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