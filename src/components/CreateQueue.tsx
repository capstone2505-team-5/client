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
import type { AnnotatedRootSpan } from "../types/types";

interface CreateQueueProps {
  annotatedRootSpans: AnnotatedRootSpan[];
  onCreateQueue: (name: string, rootSpanIds: string[]) => void;
}

const CreateQueue = ({ annotatedRootSpans: rootSpans, onCreateQueue }: CreateQueueProps) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [selectedSet, setSelectedSet] = useState<Set<string>>(new Set());
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [timeInterval, setTimeInterval] = useState<'all' | '1h' | '24h' | '7d'>('all');
  const selectedRootSpanIds = useMemo(() => Array.from(selectedSet), [selectedSet]);

  const now = useMemo(() => new Date(), []);
  const displayedSpans = useMemo(() => {
    const threshold = (() => {
      if (timeInterval === 'all') return 0;
      const t = now.getTime();
      if (timeInterval === '1h')  return t - 3600_000;
      if (timeInterval === '24h') return t - 86_400_000;
      return t - 604_800_000; // 7d
    })();

    return rootSpans
      .filter(span =>
        (projectFilter === 'all' || span.projectName === projectFilter) &&
        (threshold === 0 || span.tsStart >= threshold)
      )
      .sort((a, b) => b.tsStart - a.tsStart);
  }, [rootSpans, projectFilter, timeInterval, now]);

  // unique projects
  const projects = useMemo(
    () => Array.from(new Set(rootSpans.map((s) => s.projectName))),
    [rootSpans]
  );

  const allSelected =
    displayedSpans.length > 0 &&
    displayedSpans.every(s => selectedSet.has(s.id));

  const handleSelectAll = () =>
    setSelectedSet(prev => {
      const next = new Set(prev);

      if (allSelected) {
        displayedSpans.forEach(s => next.delete(s.id));
      } else {
        displayedSpans.forEach(s => next.add(s.id));
      }
      return next;
  });

  const toggle = (id: string) =>
    setSelectedSet(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
  });

  const handleSubmit = async () => {
    if (!name || selectedRootSpanIds.length === 0) return;
    onCreateQueue(name, selectedRootSpanIds);
    navigate("/queues");
  };

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
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
              <Checkbox checked={selectedSet.has(rootSpan.id)} />
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
