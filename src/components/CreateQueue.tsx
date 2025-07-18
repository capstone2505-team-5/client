// components/CreateQueue.tsx
import { useState, useEffect, useMemo } from "react";
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
import { fetchRootSpans, createAnnotationQueue } from "../services/services";
import type { RootSpan } from "../types/types";

const CreateQueue = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [spans, setSpans] = useState<RootSpan[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [timeInterval, setTimeInterval] = useState<'all' | '1h' | '24h' | '7d'>('all');

  useEffect(() => {
    (async () => {
      const data = await fetchRootSpans();
      setSpans(data);
    })();
  }, []);

  // derive filtered & sorted spans
  const now = useMemo(() => new Date(), []);
  const displayedSpans = useMemo(() => {
    let list = spans
      .filter((s) => projectFilter === "all" || s.projectName === projectFilter)
      .filter((s) => {
        if (timeInterval === 'all') return true;
        const threshold = new Date(now);
        if (timeInterval === '1h') threshold.setHours(now.getHours() - 1);
        if (timeInterval === '24h') threshold.setDate(now.getDate() - 1);
        if (timeInterval === '7d') threshold.setDate(now.getDate() - 7);
        return new Date(s.startTime) >= threshold;
      });
    return list.sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }, [spans, projectFilter, timeInterval, now]);

  // unique projects
  const projects = useMemo(
    () => Array.from(new Set(spans.map((s) => s.projectName))),
    [spans]
  );

  // select/deselect logic
  const allSelected = displayedSpans.length > 0 &&
    displayedSpans.every((s) => selectedIds.includes(s.id));

  const handleSelectAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(displayedSpans.map((s) => s.id));
  };

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
            <MenuItem value="1h">Last 1 Hour</MenuItem>
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
            indeterminate={!allSelected && selectedIds.length > 0}
            onChange={handleSelectAll}
          />
        }
        label="Select All"
      />

      <List sx={{ maxHeight: 400, overflowY: "auto", padding: 0 }}>
        {displayedSpans.map((s) => (
          <ListItem key={s.id} disablePadding>
            <ListItemButton onClick={() => toggle(s.id)} sx={{ py: 1, px: 2 }}>
              <Checkbox checked={selectedIds.includes(s.id)} />
              <ListItemText primary={`${s.id} — ${s.spanName}`} />
            </ListItemButton>
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
