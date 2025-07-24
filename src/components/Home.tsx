// src/components/Home.tsx
import { Container, Typography, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import logo from "/logo.png";

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container
      maxWidth="md"
      sx={{
        mt: 8,
        py: 6,
        backgroundColor: "#FFFDE7",
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Box textAlign="center">
        <Box
          component="img"
          src={logo}
          alt="LLMonade Logo"
          sx={{
            width: 420,
            height: "auto",
            mb: 2,
          }}
        />
        <Typography variant="h5" gutterBottom sx={{ mb: 4, color: "text.secondary" }}>
          An evaluation tool for refreshing your LLM app.
        </Typography>
        <Button
          variant="contained"
          color="success"
          size="large"
          onClick={() => navigate("/queues")}
          sx={{ fontWeight: "bold" }}
        >
          View Queues
        </Button>
      </Box>
    </Container>
  );
};

export default Home;