import axios from 'axios';
import type { Trace } from '../types/types';

export const fetchTraces = async (): Promise<Trace[]> => {
  const response = await axios.get<Trace[]>('/api/traces');
  return response.data;
};