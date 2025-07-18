import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { fetchAnnotationQueues } from "../services/services";

interface AnnotationQueue {
  id: string;
  name: string;
  count: number;
}

const Home = () => {
  const navigate = useNavigate();
  const [queues, setQueues] = useState<AnnotationQueue[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchAnnotationQueues();
      setQueues(data);
    };
    
    load();
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h3">Annotation Queues</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/create-queue")}
        >
          Create New Queue
        </Button>
      </Box>

      <List>
        {queues.map((q) => (
          <ListItem key={q.id} button>
            <ListItemText primary={q.name} secondary={`${q.count} spans`} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default Home;