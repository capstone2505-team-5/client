// src/components/Home.tsx
import { Container, Typography, Box, Card, CardContent, Stepper, Step, StepLabel, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const Home = () => {
  const navigate = useNavigate();

  const steps = [
    'Select a project',
    'Create root span batch', 
    'Annotate root span batch',
    'Categorize the batch',
    'Inspect results'
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
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
            mb: 3
          }}
        >
          Welcome to LLMonade
        </Typography>
        
        <Typography 
          variant="h5" 
          color="text.secondary" 
          sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}
        >
          Refreshingly simple LLM evaluations to get you started.
        </Typography>
      </Box>
      <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            sx={{ 
              textAlign: 'center', 
              mb: 2, 
              fontWeight: 'bold',
              color: 'primary.main'
            }}
          >
            How to Use LLMonade
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ textAlign: 'center', mb: 4 }}
          >
            Follow these simple steps to analyze your LLM application:
          </Typography>
      {/* How to Use Section */}
      <Card elevation={3} sx={{ mt: 6 }}>
        <CardContent sx={{ p: 4 }}>
          
          


          <Stepper 
            activeStep={-1} 
            orientation="vertical" 
            sx={{ 
              '& .MuiStepLabel-root': {
                pb: 2
              }
            }}
          >
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>
                  <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                    {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
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
              Projects
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Home; 