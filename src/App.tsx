import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Traces from './components/Traces'
import Annotation from './components/Annotation'
import TraceDetails from './components/TraceDetails'
import type { AnnotatedTrace, Rating } from './types/types';
import { fetchTraces, fetchAnnotations } from './services/services';
import { createAnnotation } from './services/services';

const App = () => {
  const [annotatedTraces, setAnnotatedTraces] = useState<AnnotatedTrace[]>([])

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
            rating: match?.rating ?? "none",
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

  const handleSaveAnnotation = async (traceId: string, note: string, rating: Rating): Promise<void> => {
    try {
      await createAnnotation(traceId, note || 'none', rating || 'none');
      setAnnotatedTraces((prev) => {
        return prev.map((trace) => {
          if (trace.traceId === traceId) {
          return {
            traceId: traceId,
            input: trace.input,
            output: trace.output,
            note: note,
            rating: rating,
            categories: trace.categories ?? [],
          };
        } else {
          return trace;
        }
        });
      });
      
      console.log('Annotation saved:', { traceId, note, rating });
    } catch (err) {
      console.error('Failed to save annotation', err);
    }
  };

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
        <Route path="/annotation" element={<Annotation annotatedTraces={annotatedTraces} onSave={handleSaveAnnotation} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App