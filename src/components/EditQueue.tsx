import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { fetchRootSpans, fetchAnnotationQueue, updateAnnotationQueue } from "../services/services";
import type { RootSpan } from "../types/types";

const EditQueue = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [rootSpans, setRootSpans] = useState<RootSpan[]>([]);
  const [selectedRootSpanIds, setSelectedRootSpanIds] = useState<string[]>([]);
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [timeInterval, setTimeInterval] = useState<'all' | '1h' | '24h' | '7d'>('all');

  // fetch queue details + spans on mount
  useEffect(() => {
    (async () => {
      if (!id) return;
      const queue = await fetchAnnotationQueue(id);
      setName(queue.name);
      setSelectedRootSpanIds(queue.rootSpanIds);
      const spans = await fetchRootSpans();
      setRootSpans(spans);
    })();
  }, [id]);

  // memoized current time
  const now = useMemo(() => new Date(), []);

  // filtered + sorted spans
  const displayedSpans = useMemo(() => {
    return rootSpans
      .filter(s => projectFilter === "all" || s.projectName === projectFilter)
      .filter(s => {
        if (timeInterval === 'all') return true;
        const threshold = new Date(now);
        if (timeInterval === '1h') threshold.setHours(now.getHours() - 1);
        if (timeInterval === '24h') threshold.setDate(now.getDate() - 1);
        if (timeInterval === '7d') threshold.setDate(now.getDate() - 7);
        return new Date(s.startTime) >= threshold;
      })
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [rootSpans, projectFilter, timeInterval, now]);

  // distinct projects for dropdown
  const projects = useMemo(
    () => Array.from(new Set(rootSpans.map(s => s.projectName))),
    [rootSpans]
  );

  // select all logic
  const allSelected = displayedSpans.length > 0 &&
    displayedSpans.every(s => selectedRootSpanIds.includes(s.id));
  const handleSelectAll = () => {
    if (allSelected) setSelectedRootSpanIds([]);
    else setSelectedRootSpanIds(displayedSpans.map(s => s.id));
  };

  // toggle individual
  const toggle = (id: string) => {
    setSelectedRootSpanIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // save
  const handleSubmit = async () => {
    if (!id) return;
    await updateAnnotationQueue(id, { name, rootSpanIds: selectedRootSpanIds });
    navigate("/queues");
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" mb={2}>
        Edit Queue
      </Typography>

      <Box mb={3}>
        <TextField
          fullWidth
          label="Queue Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </Box>

      {/* Project & Time Interval Filters */}
      <Box mb={3} display="flex" gap={2}>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Project</InputLabel>
          <Select
            value={projectFilter}
            label="Project"
            onChange={e => setProjectFilter(e.target.value)}
          >
            <MenuItem value="all">All Projects</MenuItem>
            {projects.map(proj => (
              <MenuItem key={proj} value={proj}>{proj}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Time Interval</InputLabel>
          <Select
            value={timeInterval}
            label="Time Interval"
            onChange={e => setTimeInterval(e.target.value as any)}
          >
            <MenuItem value="all">All Time</MenuItem>
            <MenuItem value="1h">Last 1 Hour</MenuItem>
            <MenuItem value="24h">Last 24 Hours</MenuItem>
            <MenuItem value="7d">Last 7 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>

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

      <Typography variant="h6" mb={1}>
        Select Root Spans
      </Typography>
      <List sx={{ maxHeight: 400, overflowY: "auto", padding: 0 }}>
        {displayedSpans.map(span => (
          <ListItem key={span.id} disablePadding>
            <ListItemButton onClick={() => toggle(span.id)} sx={{ py: 1, px: 2 }}>
              <Checkbox checked={selectedRootSpanIds.includes(span.id)} />
              <ListItemText primary={`${span.id} — ${span.spanName}`} />
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
          Save Queue
        </Button>
      </Box>
    </Container>
  );
};

export default EditQueue;
