import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
} from "@mui/material";
import { createQueue } from "../services/services";
import type { AnnotatedRootSpan } from "../types/types";

interface CreateQueueProps {
  annotatedRootSpans: AnnotatedRootSpan[];
}

const CreateQueue = ({ annotatedRootSpans: rootSpans }: CreateQueueProps) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [selectedRootSpanIds, setSelectedRootSpanIds] = useState<string[]>([]);
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [timeInterval, setTimeInterval] = useState<'all' | '1h' | '24h' | '7d'>('all');

  const now = useMemo(() => new Date(), []);
  const displayedSpans = useMemo(() => {
    let list = rootSpans
      .filter((rootSpan) => projectFilter === "all" || rootSpan.projectName === projectFilter)
      .filter((rootSpan) => {
        if (timeInterval === 'all') return true;
        const threshold = new Date(now);
        if (timeInterval === '1h') threshold.setHours(now.getHours() - 1);
        if (timeInterval === '24h') threshold.setDate(now.getDate() - 1);
        if (timeInterval === '7d') threshold.setDate(now.getDate() - 7);
        return new Date(rootSpan.startTime) >= threshold;
      });

    return list.sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }, [rootSpans, projectFilter, timeInterval, now]);

  // unique projects
  const projects = useMemo(
    () => Array.from(new Set(rootSpans.map((s) => s.projectName))),
    [rootSpans]
  );

  const allSelected = displayedSpans.length > 0 &&
    displayedSpans.every((rootSpan) => selectedRootSpanIds.includes(rootSpan.id));

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedRootSpanIds([]);
    } else {
      setSelectedRootSpanIds(displayedSpans.map((rootSpan) => rootSpan.id));
    }
  };

  const toggle = (selectedId: string) => {
    setSelectedRootSpanIds((prev) =>
      prev.includes(selectedId) ? prev.filter((prevId) => prevId !== selectedId) : [...prev, selectedId]
    );
  };

  const handleSubmit = async () => {
    try {
      await createQueue({ name, rootSpanIds: selectedRootSpanIds });
    } catch (error) {
      console.error("Failed to create queue", error);
    }

    navigate("/queues");
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" mb={2}>
        Create New Queue
      </Typography>
      <Box mb={3}>
        <TextField
          fullWidth
          label="Queue Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Box>

      {/* Project & Time Interval Filters */}
      <Box mb={3} display="flex" gap={2}>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Project</InputLabel>
          <Select
            value={projectFilter}
            label="Project"
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <MenuItem value="all">All Projects</MenuItem>
            {projects.map((proj) => (
              <MenuItem key={proj} value={proj}>{proj}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Time Interval</InputLabel>
          <Select
            value={timeInterval}
            label="Time Interval"
            onChange={(e) => setTimeInterval(e.target.value as any)}
          >
            <MenuItem value="all">All Time</MenuItem>
            <MenuItem value="1h">Last Hour</MenuItem>
            <MenuItem value="24h">Last 24 Hours</MenuItem>
            <MenuItem value="7d">Last 7 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Typography variant="h6" mb={1}>
        Select Root Spans
      </Typography>

      {/* Select All */}
      <FormControlLabel
        control={
          <Checkbox
            checked={allSelected}
            indeterminate={!allSelected && selectedRootSpanIds.length > 0}
            onChange={handleSelectAll}
          />
        }
        label="Select All"
      />

      <List sx={{ maxHeight: 400, overflowY: "auto", padding: 0 }}>
        {displayedSpans.map((rootSpan) => (
          <ListItem key={rootSpan.id} disablePadding>
            <ListItemButton onClick={() => toggle(rootSpan.id)} sx={{ py: 1, px: 2 }}>
              <Checkbox checked={selectedRootSpanIds.includes(rootSpan.id)} />
              <ListItemText primary={`${rootSpan.id} — ${rootSpan.spanName}`} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
        <Button onClick={() => navigate("/queues")}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!name || selectedRootSpanIds.length === 0}
          onClick={handleSubmit}
        >
          Create Queue
        </Button>
      </Box>
    </Container>
  );
};

export default CreateQueue;
