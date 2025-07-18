import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  Checkbox,
} from "@mui/material";
import { fetchRootSpans, createAnnotationQueue } from "../services/services";
import type { RootSpan } from "../types/types";

const CreateQueue = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [spans, setSpans] = useState<RootSpan[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const data = await fetchRootSpans();
      setSpans(data);
    })();
  }, []);

  const toggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    await createAnnotationQueue({ name, rootSpanIds: selectedIds });
    navigate("/");
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" mb={2}>
        Create New Annotation Queue
      </Typography>
      <Box mb={3}>
        <TextField
          fullWidth
          label="Queue Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Box>

      <Typography variant="h6" mb={1}>
        Select Root Spans
      </Typography>
      <List sx={{ maxHeight: 400, overflowY: "auto" }}>
        {spans.map((s) => (
          <ListItem key={s.id} button onClick={() => toggle(s.id)}>
            <Checkbox checked={selectedIds.includes(s.id)} />
            <Typography>
              {s.id} — {s.spanName}
            </Typography>
          </ListItem>
        ))}
      </List>

      <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
        <Button onClick={() => navigate("/")}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!name || selectedIds.length === 0}
          onClick={handleSubmit}
        >
          Create Queue
        </Button>
      </Box>
    </Container>
  );
};

export default CreateQueue;