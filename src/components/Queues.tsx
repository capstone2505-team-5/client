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
import { fetchQueues } from "../services/services";
import type { Queue } from "../types/types";

const Queues = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [queues, setQueues] = useState<Queue[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchQueues();
      setQueues(data);
    };
    fetchData();
  }, []);

  const getProgressColor = (percent: number) => {
    if (percent < 50) return theme.palette.error.main;
    if (percent < 80) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

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
