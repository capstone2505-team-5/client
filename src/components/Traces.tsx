import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';

const Traces = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Traces
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Button 
          variant="contained" 
          onClick={() => navigate('/annotation')}
          sx={{ mr: 2 }}
        >
          Go to Annotation
        </Button>
      </Box>
    </Container>
  )
}

export default Traces