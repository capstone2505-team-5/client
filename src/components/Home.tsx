// src/components/Home.tsx
import { useState, useEffect } from "react";
import { Container, Typography, Box, Card, CardContent, Button, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { getPhoenixDashboardUrl } from "../services/services";

const Home = () => {
  const navigate = useNavigate();
  const [phoenixDashboardUrl, setPhoenixDashboardUrl] = useState<string>('');

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
    additionalContent?: React.ReactNode;
  }> = [
    {
      title: 'Select a project',
      description: 'Choose from your available projects traced in Phoenix to begin the evaluation process.',
      additionalContent: (
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mt: 1 }}>
          Don't have any project traced? Access your{' '}
          {phoenixDashboardUrl ? (
            <Link 
              href={phoenixDashboardUrl} 
              target="_blank" 
              rel="noopener noreferrer"
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
      title: 'Create a Batch', 
      description: "A Batch is simply a group of root spans you've collected from Phoenix that you wish to manually grade.\n\n Create a new batch and filter for spans that are problematic or get a random selection of recent spans to get started."
    },
    {
      title: 'Manually Grade Batch',
      description: "Manually reviewing the inputs and outputs of your LLM application is the best way to understand any issues with LLM outputs your users are experiencing.\n\n We've made this process as frictionless as possible so you can easily perform manual coding. Simple up/down grading and freeform notes for each span lets you focus on issues that matter."
    },
    {
      title: 'Categorize Batch',
      description: 'We take your freeform notes and automatically organize them into meaningful categories that apply to your specific application.\n\n These categories are directly applied to your root spans so you can easily see which spans are problematic and and why.'
    },
    {
      title: 'Inspect Results',
      description: 'Inspect the results of categorization to see the most common issues with your LLM application and prioritize your next steps.'
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
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}
        >
          Welcome to LLMonade
        </Typography>
        
        <Typography 
          variant="h5" 
          color="text.secondary" 
          sx={{ mb: 2, maxWidth: '600px', mx: 'auto' }}
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
              color: 'primary.main'
            }}
          >
            Getting Started with LLMonade
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ textAlign: 'center', mb: 2 }}
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
                sx={{
                  p: 2.5,
                  border: '2px solid',
                  borderColor: 'primary.light',
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 4px 16px rgba(33, 150, 243, 0.15)',
                    borderColor: 'primary.main',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {/* Step Title with Number Badge */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      backgroundColor: 'primary.main',
                      color: 'white',
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
                        color: 'primary.main',
                        fontSize: '1.1rem'
                      }}
                    >
                    {step.title}
                  </Typography>
                </Box>

                {/* Step Description */}
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ lineHeight: 1.6, whiteSpace: 'pre-line' }}
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
              variant="outlined"
              size="large"
              onClick={() => navigate("/projects")}
              sx={{ 
                px: 3,
                py: 1,
                fontSize: '1rem',
                borderRadius: 2
              }}
            >
              Go To Projects
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Home; 