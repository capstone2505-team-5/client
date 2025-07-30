import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Typography, Box, Paper, Chip, Button, useTheme as muiUseTheme } from "@mui/material";
import { useTheme } from "../contexts/ThemeContext";
import { getPhoenixDashboardUrl } from "../services/services";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { AnnotatedRootSpan } from "../types/types";
import RateReviewIcon from '@mui/icons-material/RateReview';

const RootSpanDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const theme = muiUseTheme();
  const { projectName, projectId, batchName, batchId, annotatedRootSpan } = location.state || {};

  if (!annotatedRootSpan) {
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
    <Container maxWidth="xl" sx={{ py: 4 }}>

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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            py: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Project Box */}
            {projectName && (
            <>
              <Box 
              onClick={() => navigate(`/batches/${batchId}`, { 
                state: { projectName, projectId, batchName, batchId } 
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
              onClick={() => navigate(`/batches/${batchId}`, { 
                state: { projectName, projectId, batchName, batchId } 
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
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<RateReviewIcon />}
            onClick={() => navigate(`/batches/${batchId}/annotation`, { 
              state: { projectName: projectName } 
            })}
            size="large"
            sx={{ 
              px: 3, 
              minWidth: 225,
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
                     <Button
             variant="outlined"
             onClick={() => {}} // TODO: Add logic to go to previous span
             size="small"
             sx={{ 
               px: 3, 
               minWidth: 102,
               borderColor: 'secondary.main',
               color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
               fontWeight: 600,
               '&:hover': {
                 borderColor: 'secondary.dark',
                 backgroundColor: 'rgba(255, 235, 59, 0.1)',
               },
             }}
           >
             Prev
           </Button>
           <Button
             variant="outlined"
             onClick={() => {}} // TODO: Add logic to go to next span
             size="small"
             sx={{ 
               px: 3, 
               minWidth: 102,
               borderColor: 'secondary.main',
               color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
               fontWeight: 600,
               '&:hover': {
                 borderColor: 'secondary.dark',
                 backgroundColor: 'rgba(255, 235, 59, 0.1)',
               },
             }}
           >
             Next
           </Button>
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
              {annotatedRootSpan.id || 'N/A'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Span Name
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {annotatedRootSpan.spanName || 'N/A'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Start Time
            </Typography>
            <Typography variant="body1">
              {annotatedRootSpan.startTime ? new Date(annotatedRootSpan.startTime).toLocaleString() : "N/A"}
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
                  window.open(`${phoenixUrl}/projects/${projectId}/spans/${annotatedRootSpan.traceId}`, '_blank');
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
              {annotatedRootSpan.input}
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
              {annotatedRootSpan.output}
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
                {getRatingIcon(annotatedRootSpan.annotation?.rating || '')}
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {getRatingLabel(annotatedRootSpan.annotation?.rating || '')}
                </Typography>
              </Box>
            </Box>

            {/* Categories */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Categories
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {annotatedRootSpan.annotation?.categories && annotatedRootSpan.annotation.categories.length > 0 ? (
                  annotatedRootSpan.annotation.categories.map((category: string, index: number) => (
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
                  {annotatedRootSpan.annotation?.note || 'No notes available'}
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
