import { Container, Typography, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  return (
    <Container
      maxWidth="md"
      sx={{
        mt: 8,
        py: 6,
        backgroundColor: '#FFFDE7',
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Box textAlign="center">
        <Typography variant="h2" gutterBottom sx={{ color: 'primary.main' }}>
          🍋 Welcome to LLMonade! 🍋
        </Typography>
        
        <Typography variant="h5" gutterBottom sx={{ mb: 4, color: 'text.secondary' }}>
          Sweeten up your LLM app.
        </Typography>
        <Button
          variant="contained"
          color="success"
          size="large"
          onClick={() => navigate('/queues')}
          sx={{ fontWeight: 'bold' }}
        >
          View Queues
        </Button>
      </Box>
    </Container>
  );
};

export default Home;
