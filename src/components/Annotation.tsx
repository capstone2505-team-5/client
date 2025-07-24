import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, TextField, Chip } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import type { AnnotatedRootSpan, Rating } from "../types/types";



interface RootSpanProps {
  annotatedRootSpans: AnnotatedRootSpan[];
  onSave: (
    annotationId: string,
    rootSpanId: string,
    note: string,
    rating: Rating
  ) => Promise<void>;
}

const Annotation = ({ annotatedRootSpans, onSave }: RootSpanProps) => {
  const { id: queueId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentRootSpanIndex, setCurrentRootSpanIndex] = useState<number>(0);
  const [note, setNote] = useState<string>('');
  const [rating, setRating] = useState<'good' | 'bad' | null>(null);
  const annotatedRootSpan = annotatedRootSpans[currentRootSpanIndex] ?? {
    annotationId: '',
    traceId: '',
    input: '',
    output: '',
    note: '',
    rating: '',
    categories: [],
  };

  useEffect(() => {
    if (annotatedRootSpan) {
      setNote(annotatedRootSpan.note || '');
      setRating(annotatedRootSpan.rating === 'good' || annotatedRootSpan.rating === 'bad' ? annotatedRootSpan.rating : null);
    }
  }, [annotatedRootSpan]);

  const isSaveDisabled = rating === null || (rating === 'bad' && !note.trim());
  const handlePrev = (): void => setCurrentRootSpanIndex((i) => Math.max(0, i - 1));
  const handleNext = (): void => setCurrentRootSpanIndex((i) => Math.min(annotatedRootSpans.length - 1, i + 1));
  const handleSaveAnnotation = async (): Promise<void> => {
    onSave(
      annotatedRootSpan.annotationId,
      annotatedRootSpan.id,
      note,
      rating || 'none'
    );
  };



  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header + all three columns */}
      <Box>
        {/* Header - Title and back button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Annotation Queue
          </Typography>
          <Button variant="contained" onClick={() => navigate(`/queues/${queueId}`)}>
            Back to Root Spans
          </Button>
        </Box>

        {/* All three columns - Input | Output | Annotate */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Input */}
          <Box
            sx={{
              width: '30%',
              borderRadius: 2,
              border: '2px solid',
              borderColor: 'primary.light',
              height: '110vh',
              p: 2,
              overflow: 'auto',
            }}
          >
            <Typography variant="h4" component="h2" gutterBottom>
              Input
            </Typography>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{annotatedRootSpan.input}</pre>
          </Box>

          {/* Output */}
          <Box
            sx={{
              width: '40%',
              borderRadius: 2,
              border: '2px solid',
              borderColor: 'primary.light',
              height: '110vh',
              p: 2,
              overflow: 'auto',
            }}
          >
            <Typography variant="h4" component="h2" gutterBottom>
              Output
            </Typography>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{annotatedRootSpan.output}</pre>
          </Box>

          {/* Annotation + Rate Responses + Notes + Save + Navigation */}
          <Box>
            <Typography variant="h4" component="h2" gutterBottom>
              Annotation
            </Typography>

            <Box sx={{ textAlign: 'left', mb: 2 }}>
              <Typography variant="h5" component="h3" gutterBottom>Categories</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {annotatedRootSpan.categories.length > 0 ? (
                  annotatedRootSpan.categories.map(category => (
                    <Chip key={category} label={category} variant="outlined" />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">None</Typography>
                )}
              </Box>
            </Box>

            {/* Rate Responses */}
            <Box sx={{ textAlign: 'left', mb: 2 }}>
              <Typography variant="h5" component="h3" gutterBottom>Rate Response (Required)</Typography>
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

            {/* Notes */}
            <Typography variant="h5" component="h3" gutterBottom>Notes</Typography>
            <TextField
              multiline
              rows={12}
              fullWidth
              variant="outlined"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={rating === 'bad' ? 'Note required for bad rating.' : ''}
            />

            {/* Save */}
            <Button
              variant="contained"
              onClick={handleSaveAnnotation}
              sx={{ mt: 2, alignSelf: 'flex-end' }}
              disabled={isSaveDisabled}
              >
              Save Annotation
            </Button>

            {/* Navigation */}
            <Box sx={{ display: 'flex', justifyContent: 'left', alignItems: 'center', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handlePrev}
                disabled={currentRootSpanIndex === 0}
              >
                Previous
              </Button>
              <Typography>
                {currentRootSpanIndex + 1} of {annotatedRootSpans.length}
              </Typography>
              <Button
                variant="outlined"
                onClick={handleNext}
                disabled={currentRootSpanIndex === annotatedRootSpans.length - 1}
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