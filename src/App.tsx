import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Traces from './components/Traces'
import Annotation from './components/Annotation'
import { sampleTraces } from './sampleData/traces';
import type { Trace } from './types/types';

const App = () => {
  const [traces, setTraces] = useState<Trace[]>([])

  useEffect(() => {
    setTraces(sampleTraces)
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