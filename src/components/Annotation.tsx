import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Container, Typography, Box, Button, TextField, Chip, Paper, useTheme as muiUseTheme, Tooltip } from "@mui/material";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import type { Rating as RatingType } from "../types/types";
import { useRootSpansByBatch } from "../hooks/useRootSpans";
import { getPhoenixDashboardUrl } from "../services/services";

interface Props {
  onSave: (annotationId: string, rootSpanId: string, note: string, rating: RatingType | null) => void;
}

const Annotation = ({ onSave}: Props) => {
  const { projectId, batchId, rootSpanId } = useParams<{ projectId: string, batchId: string, rootSpanId: string }>();
  const navigate = useNavigate();
  const theme = muiUseTheme();
  const [note, setNote] = useState("");
  const [rating, setRating] = useState<RatingType | null>(null);
  const location = useLocation();
  const { projectName, batchName } = location.state || {};

  // Helper function to render keyboard keys
  const renderKey = (key: string) => (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        px: 0.75,
        py: 0.25,
        mx: 0.5,
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.12)',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        color: theme.palette.mode === 'dark' ? '#fff' : '#333',
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 1px 0 rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          : '0 1px 0 rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
      }}
    >
      {key}
    </Box>
  );


  const {data: annotatedRootSpans = [], isLoading: isLoadingSpans} = useRootSpansByBatch(batchId || null);

  // Find current span and its index
  const currentSpanIndex = annotatedRootSpans.findIndex(span => 
    span.id === rootSpanId
  );

  const currentSpan = annotatedRootSpans[currentSpanIndex];

  // Sync local state with current span's annotation data
  useEffect(() => {
    if (currentSpan?.annotation) {
      setRating(currentSpan.annotation.rating || null);
      setNote(currentSpan.annotation.note || "");
    } else {
      setRating(null);
      setNote("");
    }
  }, [currentSpan?.id]);
  
  // Use the span from the API data if available, otherwise fall back to the passed one
  // const currentSpan = annotatedRootSpans[currentSpanIndex];

  // Navigation functions
  const goToPreviousSpan = () => {
    if (currentSpanIndex > 0) {
      const previousSpan = annotatedRootSpans[currentSpanIndex - 1];
      navigate(`/projects/${projectId}/batches/${batchId}/annotation/${previousSpan.id}`, {
        state: { projectName, batchName, annotatedRootSpan: previousSpan }
      });
    }
  };

  const goToNextSpan = () => {
    if (currentSpanIndex < annotatedRootSpans.length - 1) {
      const nextSpan = annotatedRootSpans[currentSpanIndex + 1];
      navigate(`/projects/${projectId}/batches/${batchId}/annotation/${nextSpan.id}`, {
        state: { projectName, batchName, annotatedRootSpan: nextSpan }
      });
    }
  };


  const isSaveDisabled = !rating || (rating === 'bad' && !note.trim());
  
  const handleSave = () => {
    if (currentSpan && rating) {
      onSave(currentSpan.annotation?.id || "", currentSpan.id, note, rating);
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'good':
        return <CheckCircleIcon sx={{ color: 'success.main', fontSize: '1.5rem' }} />;
      case 'bad':
        return <CancelIcon sx={{ color: 'error.main', fontSize: '1.5rem' }} />;
      default:
        return <CheckCircleOutlineIcon sx={{ color: 'text.disabled', fontSize: '1.5rem' }} />;
    }
  };

  const getRatingLabel = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'Good';
      case 'bad':
        return 'Bad';
      default:
        return 'Not Rated';
    }
  };

  if (!currentSpan) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography variant="h5" color="text.secondary">No spans available</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* CSS Grid Layout */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '1fr 1fr',
            lg: '1fr 2fr 1fr'
          },
          gridTemplateRows: {
            xs: 'auto auto auto auto auto',
            md: 'auto auto auto 2fr auto',
            lg: 'auto auto 1fr 1fr'
          },
          gridTemplateAreas: {
            xs: `
              "header"
              "controls"
              "input"
              "output"
              "annotation"
            `,
            md: `
              "header header"
              "controls controls"
              "input input"
              "output output"
              "annotation annotation"
            `,
            lg: `
              "header header header"
              "controls output annotation"
              "input output annotation"
              "input output annotation"
            `
          },
          gap: 3,
          height: 'calc(100vh - 200px)',
          minHeight: '600px'
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            gridArea: 'header',
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: 2,
            py: 1
          }}
        >
          {/* Left Section - Breadcrumbs */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-start' }}>
            {/* Project Box */}
            {projectName && (
            <>
              <Box 
              onClick={() => navigate(`/projects/${projectId}`, { 
                state: { projectName, batchName } 
              })}
              sx={{
                px: 2,
                py: 0.75,
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(0, 0, 0, 0.4)' 
                  : 'rgba(255, 255, 255, 0.9)',
                borderRadius: 2,
                border: '2px solid',
                borderColor: 'secondary.main',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 2px 8px rgba(255, 235, 59, 0.2)'
                  : '0 2px 8px rgba(255, 235, 59, 0.3)',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'secondary.dark',
                  backgroundColor: 'rgba(255, 235, 59, 0.1)',
                },
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#212121',
                    fontWeight: 'medium',
                    fontSize: '0.875rem',
                    letterSpacing: '0.5px'
                  }}
                >
                  PROJECT
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#212121',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    mt: -0.5
                  }}
                >
                  {projectName}
                </Typography>
              </Box>
              <ChevronRightIcon sx={{ color: 'text.secondary', fontSize: '1.5rem' }} />
            </>
          )}

          {/* Batch Box */}
          {batchName && (
            <>
              <Box 
              onClick={() => navigate(`/projects/${projectId}/batches/${batchId}`, { 
                state: { projectName, batchName } 
              })}
              sx={{
                px: 2,
                py: 0.75,
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(0, 0, 0, 0.4)' 
                  : 'rgba(255, 255, 255, 0.9)',
                borderRadius: 2,
                border: '2px solid',
                borderColor: 'secondary.main',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 2px 8px rgba(33, 150, 243, 0.2)'
                  : '0 2px 8px rgba(33, 150, 243, 0.3)',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'secondary.dark',
                  backgroundColor: 'rgba(255, 235, 59, 0.1)',
                },
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#212121',
                    fontWeight: 'medium',
                    fontSize: '0.875rem',
                    letterSpacing: '0.5px'
                  }}
                >
                  BATCH
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#212121',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    mt: -0.5
                  }}
                >
                  {batchName}
                </Typography>
              </Box>
            </>
          )}
          </Box>

                    {/* Center Section - Progress */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '400px' }}>
            {annotatedRootSpans.length > 0 && (() => {
              // Calculate how many spans have been annotated (have a rating)
              const annotatedCount = annotatedRootSpans.filter(span => span.annotation?.rating).length;
              const progressPercentage = (annotatedCount / annotatedRootSpans.length) * 100;
              
              return (
                <>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#212121', mb: 1 }}>
                    Grading Progress
                  </Typography>
                  
                  {/* Enhanced Progress Bar Container */}
                  <Box sx={{ 
                    position: 'relative', 
                    width: '100%', 
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                    border: '2px solid',
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.12)',
                    overflow: 'hidden',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {/* Progress Fill */}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        width: `${progressPercentage}%`,
                        background: `linear-gradient(135deg, 
                          ${theme.palette.secondary.main} 0%, 
                          ${theme.palette.secondary.light} 50%, 
                          ${theme.palette.secondary.main} 100%)`,
                        borderRadius: 'inherit',
                        transition: 'width 0.3s ease-in-out',
                        boxShadow: '0 2px 8px rgba(255, 235, 59, 0.3)'
                      }}
                    />
                    
                    {/* Percentage Text Overlay */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#212121',
                          textShadow: theme.palette.mode === 'dark' 
                            ? '0 1px 2px rgba(0,0,0,0.8)' 
                            : '0 1px 2px rgba(255,255,255,0.8)',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {Math.round(progressPercentage)}%
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      mt: 1,
                      fontSize: '0.875rem',
                      fontWeight: 'medium'
                    }}
                  >
                    {annotatedCount} of {annotatedRootSpans.length} spans annotated
                  </Typography>
                </>
              );
            })()}
          </Box>

          {/* Right Section - Navigation */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
            <Tooltip title={<>Previous span {renderKey('A')}</>} arrow>
              <span>
                <Button
                  variant="outlined"  
                  onClick={goToPreviousSpan}
                  disabled={currentSpanIndex === 0}
                  size="small"
                  sx={{ 
                    px: 3, 
                    minWidth: 165,
                    borderColor: 'secondary.main',
                    color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: 'secondary.dark',
                      backgroundColor: 'rgba(255, 235, 59, 0.1)',
                    },
                    '&.Mui-disabled': {
                      borderColor: 'text.disabled',
                      color: 'text.disabled',
                    }
                  }}
                >
                  Previous
                </Button>
              </span>
            </Tooltip>
            <Tooltip title={<>Next span {renderKey('D')}</>} arrow>
              <span>
                <Button
                  variant="outlined"
                  onClick={goToNextSpan}
                  disabled={currentSpanIndex === annotatedRootSpans.length - 1}
                  size="small"
                  sx={{ 
                    px: 3, 
                    minWidth: 165,
                    borderColor: 'secondary.main',
                    color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: 'secondary.dark',
                      backgroundColor: 'rgba(255, 235, 59, 0.1)',
                    },
                    '&.Mui-disabled': {
                      borderColor: 'text.disabled',
                      color: 'text.disabled',
                    }
                  }}
                >
                  Next
                </Button>
              </span>
            </Tooltip>
          </Box>
        </Box>

        {/* Controls Section */}
        <Paper
          elevation={2}
          sx={{
            gridArea: 'controls',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ 
            p: 2, 
            flex: 1, 
            overflow: 'auto',
            backgroundColor: theme.palette.background.paper,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 2
          }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Span ID
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {currentSpan.id || 'N/A'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Span Name
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {currentSpan.spanName || 'N/A'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Categories
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {currentSpan.annotation?.categories && currentSpan.annotation.categories.length > 0 ? (
                currentSpan.annotation.categories.map(category => (
                  <Chip key={category} label={category} size="small" variant="outlined" />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">None</Typography>
              )}
            </Box>
            
          </Box>
          <Box>

            <Button
              variant="text"
              size="medium"
              sx={{ 
                p: 0,
                minWidth: 'auto',
                textTransform: 'none',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'transparent',
                  textDecoration: 'underline'
                }
              }}
              onClick={async () => {
                try {
                  const phoenixUrl = await getPhoenixDashboardUrl();
                  // Open Phoenix dashboard in a new tab
                  window.open(`${phoenixUrl}/projects/${projectId}/spans/${currentSpan.traceId}`, '_blank');
                } catch (error) {
                  console.error('Failed to get Phoenix dashboard URL:', error);
                }
              }}
            >
              View Details in Phoenix →
            </Button>
          </Box>
          </Box>
        </Paper>

        {/* Input Section */}
        <Paper
          elevation={2}
          sx={{
            gridArea: 'input',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ 
            p: 2, 
            backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#e8f5e8',
            borderBottom: '1px solid',
            borderBottomColor: 'divider'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#212121' }}>
              Input
            </Typography>
          </Box>
          <Box sx={{ 
            p: 2, 
            flex: 1, 
            overflow: 'auto',
            backgroundColor: theme.palette.background.paper
          }}>
            <pre style={{ 
              whiteSpace: 'pre-wrap', 
              margin: 0, 
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: '0.9rem',
              lineHeight: 1.5
            }}>
              {currentSpan.input}
            </pre>
          </Box>
        </Paper>

        {/* Output Section */}
        <Paper
          elevation={2}
          sx={{
            gridArea: 'output',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ 
            p: 2, 
            backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#fff3e0',
            borderBottom: '1px solid',
            borderBottomColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#212121' }}>
              Output
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                size="small"
                sx={{
                  px: 3,
                  minWidth: 100,
                  borderColor: 'secondary.main',
                  color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: 'secondary.dark',
                    backgroundColor: 'rgba(255, 235, 59, 0.1)',
                  }
                }}
              >
                Raw
              </Button>
              <Button 
                variant="outlined" 
                size="small"
                sx={{
                  px: 3,
                  minWidth: 100,
                  borderColor: 'secondary.main',
                  color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: 'secondary.dark',
                    backgroundColor: 'rgba(255, 235, 59, 0.1)',
                  }
                }}
              >
                Formatted
              </Button>
            </Box>
          </Box>
          <Box sx={{ 
            p: 2, 
            flex: 1, 
            overflow: 'auto',
            backgroundColor: theme.palette.background.paper
          }}>
            <pre style={{ 
              whiteSpace: 'pre-wrap', 
              margin: 0,
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: '0.9rem',
              lineHeight: 1.5
            }}>
              {currentSpan.output}
            </pre>
          </Box>
        </Paper>

        {/* Annotation Section */}
        <Paper
          elevation={2}
          sx={{
            gridArea: 'annotation',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5'
          }}
        >          
          <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Notes */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Notes
              </Typography>
              <TextField
                multiline
                rows={8}
                fullWidth
                variant="outlined"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={rating === 'bad' ? 'Note required for bad rating.' : 'Add your notes here...'}
                sx={{ 
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme.palette.background.paper,
                  }
                }}
              />
            </Box>

            {/* Rate Response */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Rate Response
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Tooltip title={<>Good {renderKey('S')}</>} arrow>
                  <Button
                    variant={rating === 'good' ? 'contained' : 'outlined'}
                    color="success"
                    startIcon={<ThumbUpIcon />}
                    onClick={() => setRating('good')}
                    size="medium"
                    sx={{
                      flex: 1,
                      py: 0.5,
                      fontSize: '1rem',
                      fontWeight: 600
                    }}
                  >
                    Good
                  </Button>
                </Tooltip>
                <Tooltip title={<>Bad {renderKey('W')}</>} arrow>
                  <Button
                    variant={rating === 'bad' ? 'contained' : 'outlined'}
                    color="error"
                    startIcon={<ThumbDownIcon />}
                    onClick={() => setRating('bad')}
                    size="medium"
                    sx={{
                      flex: 1,
                      py: 0.5,
                      fontSize: '1rem',
                      fontWeight: 600
                    }}
                  >
                    Bad
                  </Button>
                </Tooltip>
              </Box>
            </Box>

            {/* Save Button */}
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={isSaveDisabled}
              size="large"
              sx={{ 
                backgroundColor: 'secondary.main',
                color: 'black',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'secondary.dark',
                },
                '&.Mui-disabled': {
                  backgroundColor: 'text.disabled',
                  color: 'rgba(0, 0, 0, 0.26)',
                }
              }}
            >
              Save Annotation
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Annotation;