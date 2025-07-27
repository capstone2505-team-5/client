import { Box, Container, Typography, IconButton, Tooltip } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [maxStepReached, setMaxStepReached] = useState(0);

  const steps = [
    { title: 'Select a project', routes: ['/projects'] },
    { title: 'Create a Batch', routes: ['/create-queue'] },
    { title: 'Manually Grade Batch', routes: ['/queues/:id/annotation'] },
    { title: 'Categorize Batch', routes: ['/queues/:id'] },
    { title: 'Inspect Results', routes: ['/queues/:id'] }
  ];

  // Determine current step based on route
  const getCurrentStep = () => {
    const path = location.pathname;
    
    if (path === '/projects') return 0;
    if (path === '/create-queue' || path.startsWith('/edit-queue') || path === '/queues') return 1;
    if (path.includes('/annotation')) return 2;
    if (path.startsWith('/queues/') && !path.includes('/annotation')) return 3; // need to add logic if annotation is done for the batch
    if (path.startsWith('/queues/') && path.includes('results')) return 4; // need to add logic if categorization is done for the batch
    
    return -1; // No active step (home page, etc.)
  };

  const currentStep = getCurrentStep();

  // Load max step from localStorage on component mount
  useEffect(() => {
    const savedMaxStep = localStorage.getItem('llmonade-max-step');
    if (savedMaxStep) {
      setMaxStepReached(parseInt(savedMaxStep, 10));
    }
  }, []);

  // Update max step reached when current step changes
  useEffect(() => {
    if (currentStep > maxStepReached) {
      setMaxStepReached(currentStep);
      localStorage.setItem('llmonade-max-step', currentStep.toString());
    }
  }, [currentStep, maxStepReached]);

  // Reset progress function
  const resetProgress = () => {
    localStorage.removeItem('llmonade-max-step');
    setMaxStepReached(0);
    navigate('/projects');
  };

  // Don't show footer on home/getting started page
  if (location.pathname === '/') {
    return null;
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
        boxShadow: '0 -2px 8px rgba(0,0,0,0.05)'
      }}
    >
      <Container maxWidth="xl">
        <Box 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            maxWidth: '1200px',
            mx: 'auto'
          }}
        >
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 2,
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
                  p: 1.5,
                  border: '2px solid',
                  borderColor: isCompleted ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  backgroundColor: isCompleted ? 'primary.light' : 'background.default',
                  textAlign: 'center',
                  transition: 'all 0.2s ease-in-out',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  opacity: isCurrent ? 1 : (isCompleted ? 0.85 : 0.6),
                  transform: isCurrent ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                {/* Step Number */}
                <Box
                  sx={{
                    backgroundColor: isCompleted ? 'primary.main' : 'text.secondary',
                    color: 'white',
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
                    fontWeight: isCompleted ? 'bold' : 'medium',
                    color: isCompleted ? 'primary.dark' : 'text.primary',
                    fontSize: '0.95rem',
                    textAlign: 'left'
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
                    borderColor: 'primary.main',
                    color: 'primary.main'
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