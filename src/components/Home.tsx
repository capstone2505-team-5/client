// src/components/Home.tsx
import { useState, useEffect } from "react";
import { Container, Typography, Box, Card, CardContent, Button, Link, Modal, IconButton, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CloseIcon from '@mui/icons-material/Close';
import { getPhoenixDashboardUrl } from "../services/services";

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [phoenixDashboardUrl, setPhoenixDashboardUrl] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  const handleStepClick = (stepIndex: number) => {
    setSelectedStep(stepIndex);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedStep(null);
  };

  useEffect(() => {
    const fetchPhoenixUrl = async () => {
      try {
        const url = await getPhoenixDashboardUrl();
        setPhoenixDashboardUrl(url);
      } catch (error) {
        console.error('Failed to fetch Phoenix dashboard URL:', error);
      }
    };
    
    fetchPhoenixUrl();
  }, []);

  const steps: Array<{
    title: string;
    description: string;
    videoPath: string;
    additionalContent?: React.ReactNode;
  }> = [
    {
      title: 'Select a project',
      description: 'Choose from your available projects traced in Phoenix to begin the evaluation process.',
              videoPath: '/CreateBatchMVP.mp4',
      additionalContent: (
        <Typography 
          variant="body2" 
          sx={{ 
            lineHeight: 1.6, 
            mt: 1,
            color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
          }}
        >
          Don't have any project traced? Access your{' '}
          {phoenixDashboardUrl ? (
            <Link 
              href={phoenixDashboardUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              sx={{ color: 'primary.main', textDecoration: 'underline' }}
            >
              Phoenix Dashboard
            </Link>
          ) : (
            'Phoenix Dashboard'
          )}
          {' '}and follow instructions from the "Trace" button in the top right corner of the Phoenix UI to get started.
        </Typography>
      )
    },
    {
      title: 'Create Batch', 
      description: "A Batch is simply a group of root spans you've collected from Phoenix that you wish to manually grade.\n\n Create a new batch and filter for spans that are problematic or get a random selection of recent spans to get started.",
      videoPath: '/CreateBatchMVP.mp4'
    },
    {
      title: 'Grade Batch',
      description: "Manually reviewing the inputs and outputs of your LLM application is the best way to understand any issues with LLM outputs your users are experiencing.\n\n We've made this process as frictionless as possible so you can easily perform manual coding. Simple up/down grading and freeform notes for each span lets you focus on issues that matter.",
      videoPath: '/CreateBatchMVP.mp4'
    },
    {
      title: 'Categorize Batch',
      description: 'We take your freeform notes and automatically organize them into meaningful categories that apply to your specific application.\n\n These categories are directly applied to your root spans so you can easily see which spans are problematic and and why.',
      videoPath: '/CreateBatchMVP.mp4'
    },
    {
      title: 'Inspect Results',
      description: 'Inspect the results of categorization to see the most common issues with your LLM application and prioritize your next steps.',
      videoPath: '/CreateBatchMVP.mp4'
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 1 }}>
      {/* Welcome Section */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold',
            color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#212121',
            mb: 2
          }}
        >
          Welcome to LLMonade
        </Typography>
        
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 2, 
            maxWidth: '600px', 
            mx: 'auto',
            color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)'
          }}
        >
          Refreshingly simple evals to get you started improving your LLM powered applications.
        </Typography>
      </Box>
      
      {/* How to Use Section */}
                                                       <Card elevation={3} sx={{ mt: 2 }}>
        <CardContent sx={{ p: 3 }}>
          
        <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            sx={{ 
              textAlign: 'center', 
              mb: 1, 
              fontWeight: 'bold',
              color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#212121'
            }}
          >
            Getting Started with LLMonade
          </Typography>
          <Typography 
            variant="body1"
            sx={{ 
              textAlign: 'center', 
              mb: 2,
              color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)'
            }}
          >
            Follow these simple steps to start evaluating your LLM application:
          </Typography>


          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 2,
              pb: 2,
              width: '100%'
            }}
          >
            {steps.map((step, index) => (
              <Box
                key={step.title}
                onClick={() => handleStepClick(index)}
                sx={{
                  p: 2.5,
                  border: '1px solid',
                  borderColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.12)'
                    : 'rgba(0, 0, 0, 0.12)',
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  transition: 'all 0.2s ease-in-out',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 4px 16px rgba(254, 207, 44, 0.25)'
                      : '0 4px 16px rgba(254, 207, 44, 0.2)',
                    borderColor: 'secondary.main',
                    transform: 'translateY(-2px)',
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(254, 207, 44, 0.08)'
                      : 'rgba(254, 207, 44, 0.05)'
                  }
                }}
              >
                {/* Step Title with Number Badge */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      backgroundColor: 'secondary.main',
                      color: 'black',
                      borderRadius: '50%',
                      width: 28,
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                      mr: 1.5
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#212121',
                      fontSize: '1.1rem'
                    }}
                  >
                    {step.title}
                  </Typography>
                </Box>

                {/* Step Description */}
                <Typography 
                  variant="body2"
                  sx={{ 
                    lineHeight: 1.6, 
                    whiteSpace: 'pre-line',
                    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
                  }}
                >
                  {step.description}
                </Typography>
                
                {/* Additional Content (for Phoenix Dashboard link) */}
                {step.additionalContent && step.additionalContent}
              </Box>
            ))}
          </Box>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/projects")}
              sx={{ 
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                borderRadius: 2,
                backgroundColor: 'secondary.main',
                color: 'black',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(254, 207, 44, 0.4)',
                '&:hover': {
                  backgroundColor: 'secondary.dark',
                  boxShadow: '0 4px 12px rgba(254, 207, 44, 0.5)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Go To Projects
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Video Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="step-video-modal"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 0,
            maxWidth: '90vw',
            maxHeight: '90vh',
            outline: 'none',
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              zIndex: 1,
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.9)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* Video Player */}
          {selectedStep !== null && (
            <video
              src={steps[selectedStep].videoPath}
              autoPlay
              loop
              muted
              controls
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '80vh',
                borderRadius: '8px',
              }}
            />
          )}
        </Box>
      </Modal>
    </Container>
  );
};

export default Home; 