import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';

const Annotation = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Annotation
      </Typography>
      <Typography variant="body1" paragraph>
        This is the annotation page
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
        >
          Back to Traces
        </Button>
      </Box>
    </Container>
  );
};

export default Annotation;
