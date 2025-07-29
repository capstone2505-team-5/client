import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Typography, Box, Paper, Chip, Button, useTheme as muiUseTheme } from "@mui/material";
import { useTheme } from "../contexts/ThemeContext";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { AnnotatedRootSpan } from "../types/types";

const RootSpanDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const annotatedRootSpan = location.state as AnnotatedRootSpan;
  const { isDarkMode } = useTheme();
  const theme = muiUseTheme();

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
      {/* Header with Back Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          variant="outlined"
          sx={{ mr: 3 }}
        >
          Back
        </Button>
        <Typography variant="h3" component="h1" sx={{ 
          fontWeight: 'bold',
          color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#212121'
        }}>
          Root Span Details
        </Typography>
      </Box>

      {/* CSS Grid Layout */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '1fr 1fr',
            lg: '2fr 3fr 1fr'
          },
          gridTemplateRows: {
            xs: 'auto auto auto auto auto',
            md: 'auto auto auto',
            lg: 'auto 1fr auto'
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
              "input output"
              "annotation annotation"
            `,
            lg: `
              "header header annotation"
              "input output annotation"
              "metadata metadata annotation"
            `
          },
          gap: 3,
          height: 'calc(100vh - 200px)',
          minHeight: '600px'
        }}
      >
        {/* Header Section */}
        <Paper
          elevation={2}
          sx={{
            gridArea: 'header',
            p: 2,
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
              : 'linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 100%)',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
              Span ID:
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                fontFamily: 'monospace',
                color: 'primary.main',
                fontWeight: 'bold'
              }}
            >
              {annotatedRootSpan.id}
            </Typography>
          </Box>
          {annotatedRootSpan.spanName && (
            <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
              {annotatedRootSpan.spanName}
            </Typography>
          )}
        </Paper>

        {/* Metadata Section */}
        <Paper
          elevation={2}
          sx={{
            gridArea: 'metadata',
            p: 2,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 2,
            backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fafafa'
          }}
        >
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Project
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {annotatedRootSpan.projectName || 'N/A'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Trace ID
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: 'monospace',
                color: 'text.primary',
                wordBreak: 'break-all'
              }}
            >
              {annotatedRootSpan.traceId}
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
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
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
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
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
          <Box sx={{ 
            p: 2, 
            backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#e1f5fe',
            borderBottom: '1px solid',
            borderBottomColor: 'divider'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'info.main' }}>
              Annotation Details
            </Typography>
          </Box>
          
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
                  annotatedRootSpan.annotation.categories.map((category, index) => (
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
                  minHeight: '120px',
                  maxHeight: '200px',
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
