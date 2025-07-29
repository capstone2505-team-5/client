import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Typography, Box, Button, TextField, Chip } from "@mui/material";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import type { AnnotatedRootSpan, Rating as RatingType } from "../types/types";

interface Props {
  annotatedRootSpans: AnnotatedRootSpan[];
  onSave: (annotationId: string, rootSpanId: string, note: string, rating: RatingType | null) => void;
}

const Annotation = ({ annotatedRootSpans, onSave }: Props) => {
  const { id: batchId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState("");
  const [rating, setRating] = useState<RatingType | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentSpan = annotatedRootSpans[currentIndex];

  useEffect(() => {
    if (currentSpan) {
      setNote(currentSpan.annotation?.note || '');
      setRating(currentSpan.annotation?.rating === 'good' || currentSpan.annotation?.rating === 'bad' ? currentSpan.annotation.rating : null);
    }
  }, [currentSpan]);

  const isSaveDisabled = rating === 'bad' && !note.trim();
  
  const handleSave = () => {
    if (currentSpan && rating) {
      onSave(currentSpan.annotation?.id || "", currentSpan.id, note, rating);
    }
  };

  const handleNext = () => {
    if (currentIndex < annotatedRootSpans.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (!currentSpan) {
    return <div>No spans available</div>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header + all three columns */}
      <Box>
        {/* Header - Title and back button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Annotation Queue
          </Typography>
          <Button variant="contained" onClick={() => navigate(`/batches/${batchId}`)}>
            Back to Batch
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
              height: '70vh',
              p: 2,
              overflow: 'auto',
            }}
          >
            <Typography variant="h4" component="h2" gutterBottom>
              Input
            </Typography>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{currentSpan.input}</pre>
          </Box>

          {/* Output */}
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
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{currentSpan.output}</pre>
          </Box>

          {/* Annotation + Rate Responses + Notes + Save + Navigation */}
          <Box>
            <Typography variant="h4" component="h2" gutterBottom>
              Annotation
            </Typography>

            <Box sx={{ textAlign: 'left', mb: 2 }}>
              <Typography variant="h5" component="h3" gutterBottom>Categories</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {currentSpan.annotation?.categories && currentSpan.annotation.categories.length > 0 ? (
                  currentSpan.annotation.categories.map(category => (
                    <Chip key={category} label={category} variant="outlined" />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">None</Typography>
                )}
              </Box>
            </Box>

            {/* Rate Responses */}
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

            {/* Notes */}
            <Typography variant="h5" component="h3" gutterBottom>Notes</Typography>
            <TextField
              multiline
              rows={12}
              fullWidth
              variant="outlined"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={rating === 'bad' ? 'Note required for bad rating.' : ''}
            />

            {/* Save */}
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{ mt: 2, alignSelf: 'flex-end' }}
              disabled={isSaveDisabled || !rating}
            >
              Save Annotation
            </Button>

            {/* Navigation */}
            <Box sx={{ display: 'flex', justifyContent: 'left', alignItems: 'center', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                Previous
              </Button>
              <Typography>
                {currentIndex + 1} of {annotatedRootSpans.length}
              </Typography>
              <Button
                variant="outlined"
                onClick={handleNext}
                disabled={currentIndex === annotatedRootSpans.length - 1}
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