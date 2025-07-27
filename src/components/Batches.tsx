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
import DeleteIcon from "@mui/icons-material/Delete";
import { fetchBatches, deleteBatch } from "../services/services";
import type { Batch } from "../types/types";

interface BatchProps {
  onDeleteBatch: (batchId: string) => void;
}

const Batches = ({ onDeleteBatch }: BatchProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [batches, setBatches] = useState<Batch[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchBatches();
        setBatches(data);
      } catch (error) {
        console.error("Failed to fetch batches", error);
      }
    };
    fetchData();
  }, []);

  const getProgressColor = (percent: number) => {
    if (percent < 50) return theme.palette.error.main;
    if (percent < 80) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const handleDelete = async (batchId: string) => {
    if (window.confirm("Are you sure you want to delete this batch?")) {
      try {
        await deleteBatch(batchId);
        setBatches((prev) => prev.filter((b) => b.id !== batchId));
        onDeleteBatch(batchId);
      } catch (error) {
        console.error("Failed to delete batch", error);
      }
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h3">Batches</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/create-batch")}
        >
          Create New Batch
        </Button>
      </Box>

      <List sx={{ padding: 0 }}>
        {batches.map((batch) => {
          const annotatedPercent = batch.totalSpans
            ? Math.round((batch.annotatedCount / batch.totalSpans) * 100)
            : 0;
          const goodPercent = batch.annotatedCount
            ? Math.round((batch.goodCount / batch.annotatedCount) * 100)
            : 0;

          return (
            <Box
              key={batch.id}
              sx={{
                borderRadius: 2,
                border: "2px solid",
                borderColor: "primary.light",
                "&:hover": { backgroundColor: "grey.200" },
                mb: 2,
              }}
            >
              <ListItem
                onClick={() => navigate(`/batches/${batch.id}`)}
                sx={{ py: 1.5, px: 2, cursor: 'pointer' }}
              >
                <ListItemText
                  primary={batch.name}
                  secondary={`${batch.totalSpans} spans`}
                />
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/edit-batch/${batch.id}`);
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
                    handleDelete(batch.id);
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

export default Batches; 