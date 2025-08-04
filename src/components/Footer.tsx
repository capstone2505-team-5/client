import { Box, Container, Typography, IconButton, Tooltip, useTheme } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [maxStepReached, setMaxStepReached] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const steps = [
    { title: 'Select a project', routes: ['/projects'] },
    { title: 'Create a Batch', routes: ['/projects/:projectId/batches/create'] },
    { title: 'Grade Batch', routes: ['/projects/:projectId/batches/:batchId/annotation'] },
    { title: 'Categorize Batch', routes: ['/projects/:projectId/batches/:batchId'] },
    { title: 'Inspect Results', routes: ['/projects/:projectId/batches/:batchId'] }
  ];

  // Determine current step based on route
  const getCurrentStep = () => {
    const path = location.pathname;
    
    if (path === '/projects') return 0;
    if (path.includes('/batches/create') || path.includes('/batches/') && path.includes('/edit')) return 1;
    if (path.includes('/annotation')) return 2;
    if (path.includes('/batches/') && !path.includes('/annotation') && !path.includes('/create') && !path.includes('/edit')) return 3;
    if (path.includes('/batches/') && path.includes('results')) return 4; // for future results page
    
    return -1; // No active step (home page, etc.)
  };

  const currentStep = getCurrentStep();

  // Load max step from localStorage on component mount
  useEffect(() => {
    const savedMaxStep = localStorage.getItem('llmonade-max-step');
    if (savedMaxStep) {
      setMaxStepReached(parseInt(savedMaxStep, 10));
    } else {
      setMaxStepReached(0);
    }
    
    // Load footer visibility state
    const savedFooterState = localStorage.getItem('llmonade-footer-hidden');
    if (savedFooterState) {
      setIsHidden(JSON.parse(savedFooterState));
    }
  }, []);

  // Update max step reached when current step changes
  useEffect(() => {
    if (!isResetting && currentStep > maxStepReached) {
      setMaxStepReached(currentStep);
      localStorage.setItem('llmonade-max-step', currentStep.toString());
    }
  }, [currentStep, maxStepReached, isResetting]);

  // Reset progress function
  const resetProgress = () => {
    // Set resetting flag to prevent useEffect interference
    setIsResetting(true);
    
    // Force clear localStorage and state immediately
    localStorage.removeItem('llmonade-max-step');
    setMaxStepReached(0);
    
    // Navigate and then clear the resetting flag
    navigate('/projects', { replace: true });
    
    // Clear resetting flag after navigation
    setTimeout(() => {
      setIsResetting(false);
    }, 100);
  };

  // Toggle footer visibility
  const toggleFooterVisibility = () => {
    const newHiddenState = !isHidden;
    setIsHidden(newHiddenState);
    localStorage.setItem('llmonade-footer-hidden', JSON.stringify(newHiddenState));
  };

  // Don't show footer on home/getting started page
  if (location.pathname === '/') {
    return null;
  }

  // Show minimal footer when hidden
  if (isHidden) {
    return (
      <Box
        component="footer"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000
        }}
      >
        <Tooltip title="Show Footer" arrow>
          <IconButton
            onClick={toggleFooterVisibility}
            sx={{
              backgroundColor: 'secondary.main',
              color: 'black',
              boxShadow: 2,
              '&:hover': {
                backgroundColor: 'secondary.dark',
                boxShadow: 4
              }
            }}
          >
            <ExpandLessIcon />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 2,
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderTopColor: 'divider',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.05)',
        position: 'relative'
      }}
    >
      {/* Hide Footer Button */}
      <Tooltip title="Hide Footer" arrow>
        <IconButton
          onClick={toggleFooterVisibility}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'text.secondary',
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': {
              backgroundColor: 'action.hover',
              borderColor: 'secondary.main',
              color: 'secondary.main'
            },
            zIndex: 1
          }}
        >
          <ExpandMoreIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Container maxWidth="xl">
        <Box 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            maxWidth: '1400px',
            mx: 'auto',
            px: 3
          }}
        >
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 1.5,
              flex: 1
            }}
          >
          {steps.map((step, index) => {
            const isCompleted = index <= maxStepReached;
            const isCurrent = index === currentStep;
            
            return (
              <Box
                key={step.title}
                sx={{
                  py: 1.25,
                  px: 1.5,
                  border: '1px solid',
                  borderColor: isCurrent 
                    ? 'secondary.main' 
                    : isCompleted 
                      ? theme.palette.mode === 'dark' ? 'rgba(254, 207, 44, 0.3)' : 'rgba(254, 207, 44, 0.4)'
                      : 'divider',
                  borderRadius: 2,
                  backgroundColor: isCurrent
                    ? theme.palette.mode === 'dark' ? 'rgba(254, 207, 44, 0.15)' : 'rgba(254, 207, 44, 0.1)'
                    : isCompleted 
                      ? theme.palette.mode === 'dark' ? 'rgba(254, 207, 44, 0.08)' : 'rgba(254, 207, 44, 0.04)'
                      : 'background.default',
                  textAlign: 'center',
                  transition: 'all 0.2s ease-in-out',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1.25,
                  opacity: isCurrent ? 1 : (isCompleted ? 0.9 : 0.5),
                  transform: isCurrent ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                {/* Step Number */}
                <Box
                  sx={{
                    backgroundColor: isCurrent 
                      ? 'secondary.main' 
                      : isCompleted 
                        ? 'secondary.dark'
                        : theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    color: isCurrent || isCompleted ? 'black' : theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}
                >
                  {index + 1}
                </Box>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: isCurrent ? 'bold' : isCompleted ? 'medium' : 'normal',
                    color: isCurrent 
                      ? theme.palette.text.primary
                      : isCompleted 
                        ? theme.palette.text.primary
                        : theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)',
                    fontSize: '0.875rem',
                    textAlign: 'left',
                    lineHeight: 1.2
                  }}
                >
                  {step.title}
                </Typography>
              </Box>
                         );
           })}
          </Box>
          
          {/* Reset Progress Button - only show if progressed past step 0 */}
          {maxStepReached > 0 && (
            <Tooltip title="Reset Progress" arrow>
              <IconButton
                onClick={resetProgress}
                size="small"
                sx={{
                  color: 'text.secondary',
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    borderColor: 'secondary.main',
                    color: 'secondary.main'
                  },
                  ml: 1
                }}
              >
                <RestartAltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        </Container>
    </Box>
  );
};

export default Footer; 