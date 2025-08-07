import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Container, Typography, Box, Button, TextField, Chip, Paper, useTheme as muiUseTheme, Tooltip, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import type { Rating as RatingType } from "../types/types";
import { useRootSpansByBatch } from "../hooks/useRootSpans";
import { getPhoenixDashboardUrl } from "../services/services";
import ReactMarkdown from 'react-markdown';

interface Props {
  onSave: (annotationId: string, rootSpanId: string, note: string, rating: RatingType | null, batchId: string) => Promise<{ isNew: boolean }>;
}

const Annotation = ({ onSave}: Props) => {
  const { projectId, batchId, rootSpanId } = useParams<{ projectId: string, batchId: string, rootSpanId: string }>();
  const navigate = useNavigate();
  const theme = muiUseTheme();
  const [note, setNote] = useState("");
  const [rating, setRating] = useState<RatingType | null>(null);
  const location = useLocation();
  const { projectName, batchName } = location.state || {};
  const notesFieldRef = useRef<HTMLTextAreaElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });
  const [hotkeyModalOpen, setHotkeyModalOpen] = useState(false);
  const [displayFormattedInput, setDisplayFormattedInput] = useState(false);
  const [displayFormattedOutput, setDisplayFormattedOutput] = useState(false);
  const [displayConfirmCategorize, setDisplayConfirmCategorize] = useState(false);
  const [isFooterHidden, setIsFooterHidden] = useState(false);

  // Track original values to detect changes
  const [originalAnnotation, setOriginalAnnotation] = useState<{
    rating: RatingType | null;
    note: string;
  }>({ rating: null, note: "" });

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

  // Helper function to render key combinations
  const renderKeyCombo = (modifier: string, key: string) => (
    <>
      {renderKey(modifier)} + {renderKey(key)}
    </>
  );

  // Get the appropriate modifier key for the platform
  const getModifierKey = () => {
    const isMac = navigator.platform.toUpperCase().includes("MAC");
    return isMac ? "⌘" : "Ctrl";
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };


  const {data: batchData, isLoading: isLoadingSpans} = useRootSpansByBatch(batchId || null);
  const annotatedRootSpans = batchData?.rootSpans || [];

  // Debug effect to track when batch data changes
  useEffect(() => {
    if (batchData) {
      console.log('Batch data updated:', {
        batchId,
        totalSpans: batchData.rootSpans.length,
        annotatedSpans: batchData.rootSpans.filter(span => span.annotation?.rating).length,
        timestamp: new Date().toISOString()
      });
    }
  }, [batchData, batchId]);

  // Find current span and its index
  const currentSpanIndex = annotatedRootSpans.findIndex(span => 
    span.id === rootSpanId
  );

  const currentSpan = annotatedRootSpans[currentSpanIndex];

  // Sync local state with current span's annotation data
  useEffect(() => {
    if (currentSpan?.annotation) {
      const rating = currentSpan.annotation.rating || null;
      const note = currentSpan.annotation.note || "";
      setRating(rating);
      setNote(note);
      // Track original values
      setOriginalAnnotation({ rating, note });
    } else {
      setRating(null);
      setNote("");
      // Track original values
      setOriginalAnnotation({ rating: null, note: "" });
    }
    
    // Auto-select formatted when available
    if (currentSpan?.formattedInput) {
      setDisplayFormattedInput(true);
    } else {
      setDisplayFormattedInput(false);
    }
    
    if (currentSpan?.formattedOutput) {
      setDisplayFormattedOutput(true);
    } else {
      setDisplayFormattedOutput(false);
    }
    
    // Auto-focus the notes field when span changes
    // Use a small delay to ensure the component has rendered
    const timer = setTimeout(() => {
      if (notesFieldRef.current) {
        notesFieldRef.current.focus();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [currentSpan?.id]);

  // Check for pending toast after navigation (similar to RootSpans)
  useEffect(() => {
    const timer = setTimeout(() => {
      const pending = sessionStorage.getItem('pendingAnnotationToast');
      if (pending) {
        sessionStorage.removeItem('pendingAnnotationToast');
        const toastData = JSON.parse(pending);
        setSnackbar(toastData);
      } 
    }, 200); // delay in ms (adjust as needed)
    return () => clearTimeout(timer); // cleanup if span changes quickly
  }, [currentSpan?.id]); // Trigger when span changes
  
  
  // Use the span from the API data if available, otherwise fall back to the passed one
  // const currentSpan = annotatedRootSpans[currentSpanIndex];

  // Check if annotation has changed
  const hasAnnotationChanged = () => {
    return (
      rating !== originalAnnotation.rating ||
      note !== originalAnnotation.note
    );
  };

  // Auto-save function
  const autoSave = async (shouldStoreSuccessToast: boolean = true) => {
    // Check if there are changes to save
    if (currentSpan && rating && hasAnnotationChanged() && batchId) {
      // Validate: bad ratings require notes
      if (rating === 'bad' && !note.trim()) {
        // Show immediate error toast (don't use sessionStorage since we're not navigating)
        setSnackbar({
          open: true,
          message: 'Note required for bad rating. Please add a note before continuing.',
          severity: 'error'
        });
        return false; // Block navigation
      }

      try {
        setIsSaving(true);
        console.log('Auto-saving annotation:', {
          annotationId: currentSpan.annotation?.id || "",
          rootSpanId: currentSpan.id,
          note,
          rating,
          batchId
        });
        
        const result = await onSave(currentSpan.annotation?.id || "", currentSpan.id, note, rating, batchId);
        
        console.log('Annotation save result:', result);

        // Reset auto-categorize flag so a new grading session can auto-start categorization again
        if (batchId) {
          sessionStorage.removeItem(`hasAutoStarted_${batchId}`);
        }

        // Only store success toast in sessionStorage if requested (survives navigation)
        if (shouldStoreSuccessToast) {
          sessionStorage.setItem('pendingAnnotationToast', JSON.stringify({
            open: true,
            message: result.isNew 
              ? 'Annotation created successfully!' 
              : 'Annotation updated successfully!',
            severity: 'success'
          }));
        }
        
        return true; // Indicate successful save
      } catch (error: any) {
        console.error("Failed to auto-save annotation", error);
        
        // Show immediate error toast (don't use sessionStorage since we're not navigating)
        setSnackbar({
          open: true,
          message: error?.response?.data?.error || error?.message || 'Failed to save annotation',
          severity: 'error'
        });
        
        return false; // Block navigation
      } finally {
        setIsSaving(false);
      }
    }
    return true; // No changes or no rating, allow navigation
  };



  // Navigation functions
  const goToPreviousSpan = async () => {
    if (currentSpanIndex > 0) {
      const success = await autoSave();
      if (success) {
        const previousSpan = annotatedRootSpans[currentSpanIndex - 1];
        navigate(`/projects/${projectId}/batches/${batchId}/annotation/${previousSpan.id}`, {
          state: { projectName, batchName, annotatedRootSpan: previousSpan }
        });
      }
    }
  };

  const goToNextSpan = async () => {
    if (currentSpanIndex < annotatedRootSpans.length - 1) {
      const success = await autoSave();
      if (success) {
        const nextSpan = annotatedRootSpans[currentSpanIndex + 1];
        navigate(`/projects/${projectId}/batches/${batchId}/annotation/${nextSpan.id}`, {
          state: { projectName, batchName, annotatedRootSpan: nextSpan }
        });
      }
    }
  };



  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
  
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const modKey = isMac ? event.metaKey : event.ctrlKey;

      // Handle Escape key for going back to batch (with auto-save)
      if (event.key === 'Escape') {
        event.preventDefault();
        const success = await autoSave();
        if (success) {
          const isLastSpan = currentSpanIndex === annotatedRootSpans.length - 1;
          navigate(`/projects/${projectId}/batches/${batchId}`, { 
            state: { 
              projectName, 
              batchName,
              ...(isLastSpan && { startCategorization: true })
            } 
          });
        }
        return;
      }

      // Only handle when modifier is held
      if (modKey && event.key.startsWith('Arrow')) {
        event.preventDefault(); // stop OS/browser handling (e.g. jump to start/end)
        switch (event.key) {
          case 'ArrowLeft':
            await goToPreviousSpan();
            break;
          case 'ArrowRight':
            // If on last span, show confirmation dialog
            if (currentSpanIndex === annotatedRootSpans.length - 1) {
              setDisplayConfirmCategorize(true);
            } else {
              await goToNextSpan();
            }
            break;
          case 'ArrowUp':
            setRating('good');
            break;
          case 'ArrowDown':
            setRating('bad');
            break;
          default:
            break;
        }
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSpanIndex, annotatedRootSpans, navigate, projectId, batchId, projectName, batchName, setRating, autoSave, goToPreviousSpan, goToNextSpan]);



  // Monitor footer visibility from localStorage
  useEffect(() => {
    const checkFooterVisibility = () => {
      const savedFooterState = localStorage.getItem('llmonade-footer-hidden');
      const footerHidden = savedFooterState ? JSON.parse(savedFooterState) : false;
      setIsFooterHidden(footerHidden);
    };

    // Check initially
    checkFooterVisibility();

    // Listen for storage changes (in case footer is toggled in another tab/component)
    window.addEventListener('storage', checkFooterVisibility);
    
    // Also listen for custom events from the footer component
    window.addEventListener('footerVisibilityChanged', checkFooterVisibility);

    return () => {
      window.removeEventListener('storage', checkFooterVisibility);
      window.removeEventListener('footerVisibilityChanged', checkFooterVisibility);
    };
  }, []);

    const displayPrevOrDoneButton = () => {
      if (currentSpanIndex === annotatedRootSpans.length - 1) {
        return (
          <Button
            variant="outlined"
            onClick={() => setDisplayConfirmCategorize(true)}
            disabled={isSaving}
            size="medium"
            fullWidth
            sx={{ 
              py: 0.5,
              fontSize: '1rem',
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
            {isSaving ? 'Saving...' : 'Categorize!'}
          </Button>
        )
      } else {
        return (
          <Button
            variant="outlined"
            onClick={goToNextSpan}
            disabled={currentSpanIndex === annotatedRootSpans.length - 1 || isSaving}
            size="medium"
            fullWidth
            sx={{ 
              py: 0.5,
              fontSize: '1rem',
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
            {isSaving ? 'Saving...' : 'Next'}
          </Button>
        )
      }
    }

  // If no current span, show a message
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
    <Container disableGutters maxWidth={false} sx={{ py: 2, px: 3}}>
      {/* CSS Grid Layout */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '1fr 1fr',
            lg: '1fr 2fr 2fr 1fr'
          },
          gridTemplateRows: {
            xs: 'auto auto auto auto auto',
            md: 'auto auto auto 2fr auto',
            lg: 'auto 1fr 1fr auto'
          },
          gridTemplateAreas: {
            xs: `
              "header"
              "input"
              "controls"
              "output"
              "annotation"
            `,
            md: `
              "header header"
              "input input"
              "controls controls"
              "output output"
              "annotation annotation"
            `,
            lg: `
              "header header header header"
              "input output context controls"
              "input output context annotation"
              "input output context annotation"
            `
          },
          gap: 3,
          height: isFooterHidden ? 'calc(100vh - 120px)' : 'calc(100vh - 200px)',
          minHeight: '600px'
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            gridArea: 'header',
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'start',
            gap: 2,
            py: 1
          }}
        >
          {/* Left Section - Breadcrumbs */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-start', alignSelf: 'center' }}>
            {/* Project Box */}
            {projectName && (
            <>
              <Tooltip title={<>Back to project</>} arrow>
                <Box 
                onClick={async () => {
                  const success = await autoSave();
                  if (success) {
                    navigate(`/projects/${projectId}`, { 
                      state: { projectName, batchName } 
                    });
                  }
                }}
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
              </Tooltip>
              <ChevronRightIcon sx={{ color: 'text.secondary', fontSize: '1.5rem' }} />
            </>
          )}

          {/* Batch Box */}
          {batchName && (
            <>
              <Tooltip title={<>Back to batch {renderKey('Esc')}</>} arrow>
                <Box 
                onClick={async () => {
                  const success = await autoSave();
                  if (success) {
                    navigate(`/projects/${projectId}/batches/${batchId}`, { 
                      state: { projectName, batchName } 
                    });
                  }
                }}
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
              </Tooltip>
            </>
          )}
          </Box>

                    {/* Center Section - Progress */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '400px', alignSelf: 'center' }}>
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

          {/* Right Section - Hotkey Info */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, justifyContent: 'flex-end' }}>
            <Tooltip title="View keyboard shortcuts" arrow>
              <Button
                variant="outlined"
                startIcon={<KeyboardIcon />}
                onClick={() => setHotkeyModalOpen(true)}
                size="small"
                sx={{ 
                  px: 2,
                  borderColor: 'secondary.main',
                  color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: 'secondary.dark',
                    backgroundColor: 'rgba(255, 235, 59, 0.1)',
                  }
                }}
              >
                Shortcuts
              </Button>
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
            borderBottomColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#212121' }}>
              Input
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant={!displayFormattedInput ? "contained" : "outlined"}
                size="small"
                sx={{
                  px: 3,
                  minWidth: 50,
                  borderColor: 'secondary.main',
                  color: !displayFormattedInput 
                    ? (theme.palette.mode === 'dark' ? '#000000' : '#FFFFFF')
                    : (theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000'),
                  backgroundColor: !displayFormattedInput 
                    ? 'secondary.main'
                    : 'transparent',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: 'secondary.dark',
                    backgroundColor: !displayFormattedInput 
                      ? 'secondary.dark'
                      : 'rgba(255, 235, 59, 0.1)',
                  }
                }}
                onClick={() => setDisplayFormattedInput(false)}
              >
                Raw
              </Button>
              <Tooltip 
                title={!currentSpan.formattedInput ? "Formatting in process..." : "View formatted input"}
                arrow
              >
                <span>
                  <Button 
                    variant={displayFormattedInput ? "contained" : "outlined"}
                    size="small"
                    disabled={!currentSpan.formattedInput}
                    sx={{
                      px: 3,
                      minWidth: 75,
                      borderColor: 'secondary.main',
                      color: displayFormattedInput 
                        ? (theme.palette.mode === 'dark' ? '#000000' : '#FFFFFF')
                        : (theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000'),
                      backgroundColor: displayFormattedInput 
                        ? 'secondary.main'
                        : 'transparent',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: 'secondary.dark',
                        backgroundColor: displayFormattedInput 
                          ? 'secondary.dark'
                          : 'rgba(255, 235, 59, 0.1)',
                      },
                      '&.Mui-disabled': {
                        borderColor: 'text.disabled',
                        color: 'text.disabled',
                        backgroundColor: 'transparent'
                      }
                    }}
                    onClick={() => setDisplayFormattedInput(true)}
                  >
                    Formatted
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </Box>
          <Box sx={{ 
            p: 2, 
            flex: 1, 
            overflow: 'auto',
            backgroundColor: theme.palette.background.paper
          }}>
            {displayFormattedInput ? (
              <Box sx={{
                '& p': {
                  margin: '0.5em 0',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                },
                '& code': {
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  padding: '2px 4px',
                  borderRadius: '3px',
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  fontSize: '0.9em',
                  whiteSpace: 'pre-wrap'
                },
                '& pre': {
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                  padding: '12px',
                  borderRadius: '6px',
                  overflow: 'auto',
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre',
                  wordBreak: 'normal',
                  overflowWrap: 'normal'
                },
                '& pre code': {
                  backgroundColor: 'transparent',
                  padding: 0,
                  whiteSpace: 'pre'
                }
              }}>
                <ReactMarkdown>{currentSpan.formattedInput || ''}</ReactMarkdown>
              </Box>
            ) : (
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                margin: 0, 
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                fontSize: '0.9rem',
                lineHeight: 1.5
              }}>
                {currentSpan.input}
              </pre>
            )}
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
                variant={!displayFormattedOutput ? "contained" : "outlined"}
                size="small"
                sx={{
                  px: 3,
                  minWidth: 100,
                  borderColor: 'secondary.main',
                  color: !displayFormattedOutput 
                    ? (theme.palette.mode === 'dark' ? '#000000' : '#FFFFFF')
                    : (theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000'),
                  backgroundColor: !displayFormattedOutput 
                    ? 'secondary.main'
                    : 'transparent',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: 'secondary.dark',
                    backgroundColor: !displayFormattedOutput 
                      ? 'secondary.dark'
                      : 'rgba(255, 235, 59, 0.1)',
                  }
                }}
                onClick={() => setDisplayFormattedOutput(false)}
              >
                Raw
              </Button>
              <Tooltip 
                title={!currentSpan.formattedOutput ? "Formatting in process..." : "View formatted output"}
                arrow
              >
                <span>
                  <Button 
                    variant={displayFormattedOutput ? "contained" : "outlined"}
                    size="small"
                    disabled={!currentSpan.formattedOutput}
                    sx={{
                      px: 3,
                      minWidth: 100,
                      borderColor: 'secondary.main',
                      color: displayFormattedOutput 
                        ? (theme.palette.mode === 'dark' ? '#000000' : '#FFFFFF')
                        : (theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000'),
                      backgroundColor: displayFormattedOutput 
                        ? 'secondary.main'
                        : 'transparent',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: 'secondary.dark',
                        backgroundColor: displayFormattedOutput 
                          ? 'secondary.dark'
                          : 'rgba(255, 235, 59, 0.1)',
                      },
                      '&.Mui-disabled': {
                        borderColor: 'text.disabled',
                        color: 'text.disabled',
                        backgroundColor: 'transparent'
                      }
                    }}
                    onClick={() => setDisplayFormattedOutput(true)}
                  >
                    Formatted
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </Box>
          <Box sx={{ 
            p: 2, 
            flex: 1, 
            overflow: 'auto',
            backgroundColor: theme.palette.background.paper
          }}>
            {displayFormattedOutput ? (
              <ReactMarkdown>{currentSpan.formattedOutput || ''}</ReactMarkdown>
            ) : (
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                margin: 0,
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                fontSize: '0.9rem',
                lineHeight: 1.5
              }}>
                {currentSpan.output}
              </pre>
            )}
          </Box>
        </Paper>

        {/* Context Section */}
        <Paper
          elevation={2}
          sx={{
            gridArea: 'context',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ 
            p: 2, 
            backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#e8f5e8',
            borderBottom: '1px solid',
            borderBottomColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#212121' }}>
              Context
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant={!displayFormattedInput ? "contained" : "outlined"}
                size="small"
                sx={{
                  px: 3,
                  minWidth: 50,
                  borderColor: 'secondary.main',
                  color: !displayFormattedInput 
                    ? (theme.palette.mode === 'dark' ? '#000000' : '#FFFFFF')
                    : (theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000'),
                  backgroundColor: !displayFormattedInput 
                    ? 'secondary.main'
                    : 'transparent',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: 'secondary.dark',
                    backgroundColor: !displayFormattedInput 
                      ? 'secondary.dark'
                      : 'rgba(255, 235, 59, 0.1)',
                  }
                }}
                onClick={() => setDisplayFormattedInput(false)}
              >
                Raw
              </Button>
              <Tooltip 
                title={!currentSpan.formattedInput ? "Formatting in process..." : "View formatted input"}
                arrow
              >
                <span>
                  <Button 
                    variant={displayFormattedInput ? "contained" : "outlined"}
                    size="small"
                    disabled={!currentSpan.formattedInput}
                    sx={{
                      px: 3,
                      minWidth: 75,
                      borderColor: 'secondary.main',
                      color: displayFormattedInput 
                        ? (theme.palette.mode === 'dark' ? '#000000' : '#FFFFFF')
                        : (theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000'),
                      backgroundColor: displayFormattedInput 
                        ? 'secondary.main'
                        : 'transparent',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: 'secondary.dark',
                        backgroundColor: displayFormattedInput 
                          ? 'secondary.dark'
                          : 'rgba(255, 235, 59, 0.1)',
                      },
                      '&.Mui-disabled': {
                        borderColor: 'text.disabled',
                        color: 'text.disabled',
                        backgroundColor: 'transparent'
                      }
                    }}
                    onClick={() => setDisplayFormattedInput(true)}
                  >
                    Formatted
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </Box>
          <Box sx={{ 
            p: 2, 
            flex: 1, 
            overflow: 'auto',
            backgroundColor: theme.palette.background.paper
          }}>
            {displayFormattedInput ? (
              <Box sx={{
                '& p': {
                  margin: '0.5em 0',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                },
                '& code': {
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  padding: '2px 4px',
                  borderRadius: '3px',
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  fontSize: '0.9em',
                  whiteSpace: 'pre-wrap'
                },
                '& pre': {
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                  padding: '12px',
                  borderRadius: '6px',
                  overflow: 'auto',
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre',
                  wordBreak: 'normal',
                  overflowWrap: 'normal'
                },
                '& pre code': {
                  backgroundColor: 'transparent',
                  padding: 0,
                  whiteSpace: 'pre'
                }
              }}>
                <ReactMarkdown>{currentSpan.formattedInput || ''}</ReactMarkdown>
              </Box>
            ) : (
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                margin: 0, 
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                fontSize: '0.9rem',
                lineHeight: 1.5
              }}>
                {currentSpan.input}
              </pre>
            )}
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
            {/* Rate Response */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Rate Response
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Tooltip title={<>Good {renderKeyCombo(getModifierKey(), '↑')}</>} arrow>
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
                <Tooltip title={<>Bad {renderKeyCombo(getModifierKey(), '↓')}</>} arrow>
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
                inputRef={notesFieldRef}
                sx={{ 
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme.palette.background.paper,
                  }
                }}
              />
            </Box>

                        {/* Navigation */}
            <Box>
              {/* Span Progress Counter */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                mb: 1.5
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    fontWeight: 500,
                    fontSize: '0.875rem'
                  }}
                >
                  Span {currentSpanIndex + 1} of {annotatedRootSpans.length}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Tooltip title={<>Previous span {renderKeyCombo(getModifierKey(), '←')} (auto-saves changes)</>} arrow>
                  <span style={{ flex: 1 }}>
                    <Button
                      variant="outlined"  
                      onClick={goToPreviousSpan}
                      disabled={currentSpanIndex === 0 || isSaving}
                      size="medium"
                      fullWidth
                      sx={{ 
                        py: 0.5,
                        fontSize: '1rem',
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
                      {isSaving ? 'Saving...' : 'Previous'}
                    </Button>
                  </span>
                </Tooltip>
                <Tooltip title={
                  currentSpanIndex === annotatedRootSpans.length - 1 
                    ? <>Save & Categorize {renderKeyCombo(getModifierKey(), '→')} (auto-saves and categorizes)</>
                    : <>Next span {renderKeyCombo(getModifierKey(), '→')} (auto-saves changes)</>
                } arrow>
                  <span style={{ flex: 1 }}>
                    {displayPrevOrDoneButton()}
                  </span>
                </Tooltip>
              </Box>
            </Box>

            {/* Auto-save status indicator */}
            {hasAnnotationChanged() && (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                gap: 0.5,
                p: 2,
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 235, 59, 0.1)' 
                  : 'rgba(255, 235, 59, 0.2)',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'secondary.main'
              }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#212121',
                    fontWeight: 600,
                    fontSize: '1rem',
                    textAlign: 'center'
                  }}
                >
                  {isSaving ? 'Saving changes...' : 'Unsaved changes'}
                </Typography>
                {!isSaving && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      fontWeight: 400,
                      fontSize: '0.75rem',
                      textAlign: 'center'
                    }}
                  >
                    Auto-saves on navigation
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

             {/* Confirm Categorize Modal */}
       <Dialog
         open={displayConfirmCategorize}
         onClose={() => setDisplayConfirmCategorize(false)}
         aria-labelledby="confirm-categorize-dialog-title"
         maxWidth="sm"
         fullWidth
         PaperProps={{
           sx: {
             borderRadius: 3,
             boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
           }
         }}
       >
         <DialogTitle 
           id="confirm-categorize-dialog-title"
           sx={{ 
             color: 'primary.main',
             fontWeight: 'bold',
             pb: 1,
             textAlign: 'center'
           }}
         >
           Confirm Categorize
         </DialogTitle>
         <DialogContent sx={{ pt: 2, pb: 3, textAlign: 'center' }}>
          {(() => {
            const annotatedCount = annotatedRootSpans.filter(span => span.annotation?.rating).length;
            // Check if current annotation has changed and has a rating - if so, this would complete the batch
            const willCompleteAfterSave = hasAnnotationChanged() && rating && 
              (annotatedCount + 1) === annotatedRootSpans.length;
            
            return (annotatedCount === annotatedRootSpans.length || willCompleteAfterSave) ? (
              <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                You finished grading this batch!! Do you want to categorize now?
              </Typography>
            ) : (
              <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                You haven't graded all the spans in this batch. Are you sure you want to categorize?
              </Typography>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 2, justifyContent: 'center' }}>
          <Button 
            onClick={() => setDisplayConfirmCategorize(false)}
            variant="outlined"
            sx={{ 
              minWidth: '100px',
              borderColor: 'grey.400',
              color: 'text.secondary'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={async () => {
              // Save annotation if it has changed, then navigate
              const success = await autoSave(false); // Pass false for categorize flow (no toast)
              if (success) {
                navigate(`/projects/${projectId}/batches/${batchId}`, { 
                  state: { 
                    projectName, 
                    batchName,
                    startCategorization: true
                  } 
                });
              }
              setDisplayConfirmCategorize(false);
            }}
            variant="contained"
            color="primary"
            sx={{ 
              minWidth: '100px',
              fontWeight: 'bold'
            }}
          >
            Categorize
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hotkey Info Modal */}
      <Dialog
        open={hotkeyModalOpen}
        onClose={() => setHotkeyModalOpen(false)}
        aria-labelledby="hotkey-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle 
          id="hotkey-dialog-title"
          sx={{ 
            color: 'primary.main',
            fontWeight: 'bold',
            pb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            alignSelf: 'center'
          }}
        >
          <KeyboardIcon />
          Keyboard Shortcuts & Auto-Save
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          {/* Navigation Shortcuts */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'text.primary', textAlign: 'center' }}>
            Navigation
          </Typography>
          <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, width: '280px' }}>
              <Typography variant="body2">Previous span</Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {renderKey(getModifierKey())} + {renderKey('←')}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, width: '280px' }}>
              <Typography variant="body2">Next span</Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {renderKey(getModifierKey())} + {renderKey('→')}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, width: '280px' }}>
              <Typography variant="body2">Back to batch</Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {renderKey('Esc')}
              </Box>
            </Box>
          </Box>

          {/* Rating Shortcuts */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'text.primary', textAlign: 'center' }}>
            Rating
          </Typography>
          <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, width: '280px' }}>
              <Typography variant="body2">Rate as Good</Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {renderKey(getModifierKey())} + {renderKey('↑')}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, width: '280px' }}>
              <Typography variant="body2">Rate as Bad</Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {renderKey(getModifierKey())} + {renderKey('↓')}
              </Box>
            </Box>
          </Box>

          {/* Auto-Save Info */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'text.primary', textAlign: 'center' }}>
            Auto-Save
          </Typography>
          <Box sx={{ 
            p: 2, 
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 235, 59, 0.1)' 
              : 'rgba(255, 235, 59, 0.2)',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'secondary.main'
          }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, textAlign: 'center' }}>
              Your annotations are automatically saved when you:
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, textAlign: 'center' }}>
              • Navigate to previous or next span
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, textAlign: 'center' }}>
              • Return to batch (Esc key or breadcrumb)
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, textAlign: 'center' }}>
              • Navigate to project (breadcrumb)
            </Typography>
            <Typography variant="body2" sx={{ mt: 1.5, fontStyle: 'italic', color: 'text.secondary', textAlign: 'center' }}>
              Note: Bad ratings require a note before auto-save will proceed.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'center' }}>
          <Button 
            onClick={() => setHotkeyModalOpen(false)}
            variant="contained"
            color="primary"
            sx={{ 
              minWidth: '100px',
              fontWeight: 'bold'
            }}
          >
            Got it
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ 
          top: '24px !important', // Position near the top
          zIndex: 9999
        }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Annotation;