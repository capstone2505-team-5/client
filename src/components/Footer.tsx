import { Box, Container, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";

const Footer = () => {
  const location = useLocation();

  const steps = [
    { title: 'Select a project', routes: ['/projects'] },
    { title: 'Create a Batch', routes: ['/create-queue'] },
    { title: 'Manually Code Batch', routes: ['/queues/:id/annotation'] },
    { title: 'Categorize the batch', routes: ['/queues/:id'] },
    { title: 'Inspect results', routes: ['/queues/:id'] }
  ];

  // Determine current step based on route
  const getCurrentStep = () => {
    const path = location.pathname;
    
    if (path === '/projects') return 0;
    if (path === '/create-queue' || path.startsWith('/edit-queue')) return 1;
    if (path.includes('/annotation')) return 2;
    if (path.startsWith('/queues/') && !path.includes('/annotation')) return 3;
    if (path.startsWith('/queues/') && path.includes('results')) return 4;
    
    return -1; // No active step (home page, etc.)
  };

  const activeStep = getCurrentStep();

  // Don't show footer on home/getting started page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 3,
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderTopColor: 'divider',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.05)'
      }}
    >
      <Container maxWidth="xl">
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 2,
            maxWidth: '1200px',
            mx: 'auto'
          }}
        >
          {steps.map((step, index) => (
            <Box
              key={step.title}
              sx={{
                p: 2,
                border: '2px solid',
                borderColor: index === activeStep ? 'primary.main' : 'divider',
                borderRadius: 2,
                backgroundColor: index === activeStep ? 'primary.light' : 'background.default',
                textAlign: 'center',
                transition: 'all 0.2s ease-in-out',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}
            >
              {/* Step Number */}
              <Box
                sx={{
                  backgroundColor: index === activeStep ? 'primary.main' : 'text.secondary',
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
                  fontWeight: index === activeStep ? 'bold' : 'medium',
                  color: index === activeStep ? 'primary.dark' : 'text.primary',
                  fontSize: '0.95rem',
                  textAlign: 'left'
                }}
              >
                {step.title}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 