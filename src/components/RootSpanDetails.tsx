import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Container, Typography, Box, Paper, Chip, Button, useTheme as muiUseTheme, Tooltip } from "@mui/material";
import { useTheme } from "../contexts/ThemeContext";
import { getPhoenixDashboardUrl } from "../services/services";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { AnnotatedRootSpan } from "../types/types";
import RateReviewIcon from '@mui/icons-material/RateReview';
import { useRootSpansByBatch } from "../hooks/useRootSpans";
import { useEffect } from "react";

const RootSpanDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const theme = muiUseTheme();
  const { projectId, batchId, rootSpanId } = params;
  const { projectName, batchName, annotatedRootSpan } = location.state || {};

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

  // Fetch all root spans for the batch to enable navigation
  const { data: batchData, isLoading: isLoadingSpans } = useRootSpansByBatch(batchId || null);
  const allRootSpans = batchData?.rootSpans || [];

  // Find current span and its index
  const currentSpanIndex = allRootSpans.findIndex(span => 
    span.id === rootSpanId || span.id === annotatedRootSpan?.id
  );
  
  // Use the span from the API data if available, otherwise fall back to the passed one
  const currentSpan = allRootSpans[currentSpanIndex] || annotatedRootSpan;

  // Navigation functions
  const goToPreviousSpan = () => {
    if (currentSpanIndex > 0) {
      const previousSpan = allRootSpans[currentSpanIndex - 1];
      navigate(`/projects/${projectId}/batches/${batchId}/rootSpans/${previousSpan.id}`, {
        state: { projectName, batchName, annotatedRootSpan: previousSpan }
      });
    }
  };

  const goToNextSpan = () => {
    if (currentSpanIndex < allRootSpans.length - 1) {
      const nextSpan = allRootSpans[currentSpanIndex + 1];
      navigate(`/projects/${projectId}/batches/${batchId}/rootSpans/${nextSpan.id}`, {
        state: { projectName, batchName, annotatedRootSpan: nextSpan }
      });
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle navigation keys if no input elements are focused
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          goToPreviousSpan();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          goToNextSpan();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentSpanIndex, allRootSpans.length]);

  if (!currentSpan || isLoadingSpans) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography variant="h5" color="text.secondary">Loading...</Typography>
        </Box>
      </Container>
    );
  }

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
              "metadata"
              "input"
              "output"
              "annotation"
            `,
            md: `
              "header header"
              "metadata metadata"
              "input input"
              "output output"
              "annotation annotation"
            `,
            lg: `
              "header header header"
              "metadata output annotation"
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

          {/* Center Section - Title */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 'bold',
                color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#212121',
                textAlign: 'center'
              }}
            >
              Span Details
            </Typography>
            {allRootSpans.length > 0 && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  mt: 0.5,
                  fontSize: '0.875rem'
                }}
              >
                {currentSpanIndex + 1} of {allRootSpans.length}
              </Typography>
            )}
          </Box>

          {/* Right Section - Action Buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<RateReviewIcon />}
            onClick={() => navigate(`/projects/${projectId}/batches/${batchId}/annotation/${currentSpan.id}`, { 
              state: { projectName: projectName, batchName: batchName, annotatedRootSpan: currentSpan } 
            })}
            size="large"
            sx={{ 
              px: 3, 
              minWidth: 345,
              backgroundColor: 'secondary.main',
              color: 'black',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'secondary.dark',
              },
            }}
          >
            Edit Grade
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title={<>Previous span {renderKey('←')}{renderKey('↑')}</>} arrow>
              <span>
                <Button
                  variant="outlined"
                  onClick={goToPreviousSpan}
                  disabled={currentSpanIndex <= 0}
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
                  Prev
                </Button>
              </span>
            </Tooltip>
            <Tooltip title={<>Next span {renderKey('→')}{renderKey('↓')}</>} arrow>
              <span>
                <Button
                  variant="outlined"
                  onClick={goToNextSpan}
                  disabled={currentSpanIndex >= allRootSpans.length - 1}
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
        </Box>

        {/* Metadata Section */}
        <Paper
          elevation={2}
          sx={{
            gridArea: 'metadata',
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
              Start Time
            </Typography>
            <Typography variant="body1">
              {currentSpan.startTime ? new Date(currentSpan.startTime).toLocaleString() : "N/A"}
            </Typography>
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
            borderBottomColor: 'divider'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#212121' }}>
              Output
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
            {/* Rating */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Rating
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getRatingIcon(currentSpan.annotation?.rating || '')}
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {getRatingLabel(currentSpan.annotation?.rating || '')}
                </Typography>
              </Box>
            </Box>

            {/* Categories */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Categories
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {currentSpan.annotation?.categories && currentSpan.annotation.categories.length > 0 ? (
                  currentSpan.annotation.categories.map((category: string, index: number) => (
                    <Chip
                      key={index}
                      label={category}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No categories assigned
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Notes */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Notes
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  backgroundColor: theme.palette.background.paper,
                  minHeight: '250px',
                  maxHeight: '400px',
                  overflow: 'auto'
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {currentSpan.annotation?.note || 'No notes available'}
                </Typography>
              </Paper>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RootSpanDetail;
