import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Container, Typography, Button, Box, TextField } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import type { AnnotatedTrace } from "../types/types";

interface tracesProps {
  annotatedTraces: AnnotatedTrace[];
}

const Annotation = ({ annotatedTraces }: tracesProps) => {
  const navigate = useNavigate();
  const [currentTraceIndex, setCurrentTraceIndex] = useState<number>(0);
  const [annotation, setAnnotation] = useState<string>('');
  const [rating, setRating] = useState<'good' | 'bad' | null>(null);
  const trace = annotatedTraces[currentTraceIndex] ?? { id: '', input: '', output: '' };

  const handlePrev = (): void => setCurrentTraceIndex((i) => Math.max(0, i - 1));
  const handleNext = (): void => setCurrentTraceIndex((i) => Math.min(annotatedTraces.length - 1, i + 1));
  const handleSaveAnnotation = (): void => {
    // TODO: implement save logic
    console.log('Saved annotation for', trace.traceId, annotation);
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
            <Box sx={{ textAlign: 'left', mb: 2 }}>
              <Typography variant="h5" component="h3" gutterBottom>Rate Response</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'left', gap: 2 }}>
                <Button
                  variant={rating === 'good' ? 'contained' : 'outlined'}
                  color="success"
                  startIcon={<ThumbUpIcon />}
                  onClick={() => setRating('good')}
                >Good</Button>
                <Button
                  variant={rating === 'bad' ? 'contained' : 'outlined'}
                  color="error"
                  startIcon={<ThumbDownIcon />}
                  onClick={() => setRating('bad')}
                >Bad</Button>
              </Box>
            </Box>
            <Typography variant="h5" component="h3" gutterBottom>Notes</Typography>
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
            <Box sx={{ display: 'flex', justifyContent: 'left', alignItems: 'center', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handlePrev}
                disabled={currentTraceIndex === 0}
              >
                Previous
              </Button>
              <Typography>
                {currentTraceIndex + 1} of {annotatedTraces.length}
              </Typography>
              <Button
                variant="outlined"
                onClick={handleNext}
                disabled={currentTraceIndex === annotatedTraces.length - 1}
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