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

const Queues = () => {
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

      <List sx={{ padding: 0 }}>
        {queues.map((q) => (
          <Box
            key={q.id}
            sx={{
              borderRadius: 2,
              border: "2px solid",
              borderColor: "primary.light",
              "&:hover": { backgroundColor: "grey.200" },
              mb: 1,
            }}
          >
            <ListItem
              onClick={() => navigate(`/queues/${q.id}`)}
              sx={{ py: 1.5, px: 2 }}
            >
              <ListItemText
                primary={q.name}
                secondary={`${q.count} spans`}
              />
            </ListItem>
          </Box>
        ))}
      </List>
    </Container>
  );
};

export default Queues;