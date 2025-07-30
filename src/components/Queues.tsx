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
  LinearProgress,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from "@mui/icons-material/Delete";   // ← NEW
import { fetchQueues, deleteQueue } from "../services/services";
import type { Queue } from "../types/types";

interface QueueProps {
  onDeleteQueue: (queueId: string) => void;
}

const Queues = ({ onDeleteQueue }: QueueProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [queues, setQueues] = useState<Queue[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchQueues();
        setQueues(data);
      } catch (error) {
        console.error("Failed to fetch queues", error);
      }
    };
    fetchData();
  }, []);

  const getProgressColor = (percent: number) => {
    if (percent < 50) return theme.palette.error.main;
    if (percent < 80) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const handleDelete = async (queueId: string) => {
    if (window.confirm("Are you sure you want to delete this queue?")) {
      try {
        await deleteQueue(queueId);
        onDeleteQueue(queueId);
        setQueues((prev) => prev.filter((q) => q.id !== queueId));
      } catch (error) {
        console.error("Failed to delete queue", error);
      }
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
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
        {queues.map((queue) => {
          const annotatedPercent = queue.totalSpans
            ? Math.round((queue.annotatedCount / queue.totalSpans) * 100)
            : 0;
          const goodPercent = queue.annotatedCount
            ? Math.round((queue.goodCount / queue.annotatedCount) * 100)
            : 0;

          return (
            <Box
              key={queue.id}
              sx={{
                borderRadius: 2,
                border: "2px solid",
                borderColor: "primary.light",
                "&:hover": { backgroundColor: "grey.200" },
                mb: 2,
              }}
            >
              <ListItem
                onClick={() => navigate(`/queues/${queue.id}`)}
                sx={{ py: 1.5, px: 2, cursor: 'pointer' }}
              >
                <ListItemText
                  primary={queue.name}
                  secondary={`${queue.totalSpans} spans`}
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
                <IconButton
                  edge="end"
                  aria-label="delete"
                  sx={{ color: theme.palette.error.main, ml: 1 }}
                  onClick={async (e) => {
                    e.stopPropagation();
                    handleDelete(queue.id);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItem>

              <Box sx={{ px: 2, pb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Annotated: {annotatedPercent}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={annotatedPercent}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    mb: 1,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getProgressColor(annotatedPercent),
                    },
                  }}
                />

                <Typography variant="body2" gutterBottom>
                  Good Annotations: {goodPercent}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={goodPercent}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getProgressColor(goodPercent),
                    },
                  }}
                />
              </Box>
            </Box>
          );
        })}
      </List>
    </Container>
  );
};

export default Queues;
