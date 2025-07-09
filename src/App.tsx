import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Traces from './components/Traces'
import Annotation from './components/Annotation'
import type { Trace } from './types/types';
import { fetchTraces } from './services/services';

const App = () => {
  const [traces, setTraces] = useState<Trace[]>([])

  useEffect(() => {
    const getTraces = async () => {
      try {
        const traces = await fetchTraces()
        setTraces(traces)
      } catch (error) {
        console.error(`Error fetching traces: ${error}`)
      }
    }

    getTraces()
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Traces traces={traces} />} />
        <Route path="/annotation" element={<Annotation />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App