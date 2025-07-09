import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Container, Typography, Button, Box, TextField } from '@mui/material';
import type { Trace } from "../types/types";

interface tracesProps {
  traces: Trace[];
}

const Annotation = ({ traces }: tracesProps) => {
  const navigate = useNavigate();
  const [currentTraceIndex, setCurrentTraceIndex] = useState<number>(0);
  const [annotation, setAnnotation] = useState<string>('');
  const trace = traces[currentTraceIndex] ?? { id: '', input: '', output: '' };

  const handlePrev = (): void => setCurrentTraceIndex((i) => Math.max(0, i - 1));
  const handleNext = (): void => setCurrentTraceIndex((i) => Math.min(traces.length - 1, i + 1));
  const handleSaveAnnotation = (): void => {
    // TODO: implement save logic
    console.log('Saved annotation for', trace.id, annotation);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Annotation Queue
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')}>
            Back to Traces
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box
            sx={{
              width: '30%',
              borderRadius: 2,
              border: '2px solid',
              borderColor: 'primary.light',
              height: '70vh',
              p: 2,
              overflow: 'auto',
            }}
          >
            <Typography variant="h4" component="h2" gutterBottom>
              Input
            </Typography>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{trace.input}</pre>
          </Box>

          <Box
            sx={{
              width: '40%',
              borderRadius: 2,
              border: '2px solid',
              borderColor: 'primary.light',
              height: '70vh',
              p: 2,
              overflow: 'auto',
            }}
          >
            <Typography variant="h4" component="h2" gutterBottom>
              Output
            </Typography>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{trace.output}</pre>
          </Box>

          <Box>
            <Typography variant="h4" component="h2" gutterBottom>
              Annotation
            </Typography>
            <TextField
              multiline
              rows={12}
              fullWidth
              variant="outlined"
              value={annotation}
              onChange={e => setAnnotation(e.target.value)}
            />
            <Button variant="contained" onClick={handleSaveAnnotation} sx={{ mt: 2, alignSelf: 'flex-end' }}>
              Save Annotation
            </Button>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handlePrev}
                disabled={currentTraceIndex === 0}
              >
                Previous
              </Button>
              <Typography>
                {currentTraceIndex + 1} of {traces.length}
              </Typography>
              <Button
                variant="outlined"
                onClick={handleNext}
                disabled={currentTraceIndex === traces.length - 1}
              >
                Next
              </Button>
            </Box>
            
          </Box>
          

        </Box>

      </Box>
    </Container>
  );
};

export default Annotation;