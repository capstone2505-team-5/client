import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Traces from './components/Traces'
import Annotation from './components/Annotation'
import TraceDetails from './components/TraceDetails'
import type { AnnotatedTrace } from './types/types';
import { fetchTraces, fetchAnnotations } from './services/services';

const App = () => {
  const [annotatedTraces, setAnnotatedTraces] = useState<AnnotatedTrace[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [traces, annotations] = await Promise.all([
          fetchTraces(),
          fetchAnnotations(),
        ]);

        const combined: AnnotatedTrace[] = traces.map(trace => {
          const match = annotations.find(annotation => annotation.traceId === trace.id);

          return {
            traceId: trace.id,
            input: trace.input,
            output: trace.output,
            note: match?.note ?? "",
            rating: match?.rating ?? "",
            categories: match?.categories ?? [],
          };
        })

        setAnnotatedTraces(combined)
      } catch (error) {
        console.error("Failed to fetch traces or annotations", error)
      }
    }

    fetchData()
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Traces annotatedTraces={annotatedTraces} />}
        />
        <Route
          path="/traces/:id"
          element={<TraceDetails />}
        />
        <Route path="/annotation" element={<Annotation annotatedTraces={annotatedTraces} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App