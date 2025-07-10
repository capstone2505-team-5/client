import axios from 'axios';
import type { Trace, Annotation } from '../types/types';

export const fetchTraces = async (): Promise<Trace[]> => {
  const response = await axios.get<Trace[]>('/api/traces');
  return response.data;
};

export const fetchTrace = async (id: string): Promise<Trace> => {
  const response = await axios.get<Trace>(`api/traces/${id}`)
  return response.data
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

