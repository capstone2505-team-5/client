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
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from '@mui/icons-material/Edit';
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
    const fetchQueues = async () => {
      const data = await fetchAnnotationQueues();
      setQueues(data);
    };
    
    fetchQueues();
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h3">Queues</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/create-queue")}
        >
          Create New Queue
        </Button>
      </Box>

      <List sx={{ padding: 0 }}>
        {queues.map((queue) => (
          <Box
            key={queue.id}
            sx={{
              borderRadius: 2,
              border: "2px solid",
              borderColor: "primary.light",
              "&:hover": { backgroundColor: "grey.200" },
              mb: 1,
            }}
          >
            <ListItem
              onClick={() => navigate(`/queues/${queue.id}`)}
              sx={{ py: 1.5, px: 2 }}
            >
              <ListItemText
                primary={queue.name}
                secondary={`${queue.count} spans`}
              />
              <IconButton
                edge="end"
                aria-label="edit"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/edit-queue/${queue.id}`);
                }}
              >
                <EditIcon />
              </IconButton>
            </ListItem>
          </Box>
        ))}
      </List>
    </Container>
  );
};

export default Queues;