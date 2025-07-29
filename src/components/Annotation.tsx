import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Typography, Box, Button, TextField, Rating, Stack, Chip } from "@mui/material";
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
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Annotate Spans</Typography>
        <Button variant="contained" onClick={() => navigate(`/batches/${batchId}`)}>
          Back to Batch
        </Button>
      </Box>

      <Box mb={2}>
        <Typography variant="h6">
          Span {currentIndex + 1} of {annotatedRootSpans.length}
        </Typography>
      </Box>

      <Box mb={3} p={2} border="1px solid #ccc" borderRadius={2}>
        <Typography variant="h6" gutterBottom>Input</Typography>
        <Typography variant="body1" sx={{ mb: 2, backgroundColor: '#f5f5f5', p: 1, borderRadius: 1 }}>
          {currentSpan.input}
        </Typography>
        
        <Typography variant="h6" gutterBottom>Output</Typography>
        <Typography variant="body1" sx={{ mb: 2, backgroundColor: '#f5f5f5', p: 1, borderRadius: 1 }}>
          {currentSpan.output}
        </Typography>

        <Typography variant="h6" gutterBottom>Trace ID</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {currentSpan.traceId}
        </Typography>

        <Typography variant="h6" gutterBottom>Start Time</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {currentSpan.startTime ? new Date(currentSpan.startTime).toLocaleString() : "N/A"}
        </Typography>
      </Box>

      <Box mb={3}>
        <Typography variant="h6" gutterBottom>Rating</Typography>
        <Rating
          value={rating === 'good' ? 1 : rating === 'bad' ? 0 : null}
          max={1}
          onChange={(_, newValue) => {
            setRating(newValue === 1 ? 'good' : newValue === 0 ? 'bad' : null);
          }}
        />
      </Box>

      <Box mb={3}>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Box>

      {/* Categories Display */}
      {currentSpan.annotation?.categories && currentSpan.annotation.categories.length > 0 ? (
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>Categories</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {currentSpan.annotation.categories.map(category => (
              <Chip key={category} label={category} variant="outlined" />
            ))}
          </Stack>
        </Box>
      ) : (
        <Box mb={3}>
          <Typography variant="body2" color="text.secondary">
            No categories assigned yet
          </Typography>
        </Box>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Button 
            onClick={handlePrevious} 
            disabled={currentIndex === 0}
            sx={{ mr: 1 }}
          >
            Previous
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={currentIndex === annotatedRootSpans.length - 1}
          >
            Next
          </Button>
        </Box>
        
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={!rating}
        >
          Save Annotation
        </Button>
      </Box>
    </Container>
  );
};

export default Annotation;