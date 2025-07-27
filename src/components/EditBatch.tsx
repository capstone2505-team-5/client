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
import { fetchBatch, deleteBatch } from "../services/services";
import type { AnnotatedRootSpan } from "../types/types";

interface EditBatchProps {
  annotatedRootSpans: AnnotatedRootSpan[];
  onUpdateBatch: (id: string, name: string, rootSpanIds: string[]) => void;
}

const EditBatch = ({ annotatedRootSpans: rootSpans, onUpdateBatch }: EditBatchProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [timeInterval, setTimeInterval] = useState<'all' | '1h' | '24h' | '7d'>('all');
  const [selectedSet, setSelectedSet] = useState<Set<string>>(new Set());
  const selectedRootSpanIds = useMemo(() => Array.from(selectedSet), [selectedSet]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const batch = await fetchBatch(id);
        setName(batch.name);
        setSelectedSet(new Set(batch.rootSpanIds));
      } catch (error) { 
        console.error("Failed to fetch batch", error);
        navigate(`/batches`);
      }
    };
    fetchData();
  }, [id]);

  // filtered + sorted spans
  const now = useMemo(() => new Date(), []);
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

  // toggle individual
  const toggle = (id: string) =>
    setSelectedSet(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
  });

  // save
  const handleSubmit = async () => {
    if (!id) return;
    onUpdateBatch(id, name, selectedRootSpanIds);
    navigate("/batches");
  };

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
    
      <Box mb={2} display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h4">
          Edit Batch
        </Typography>
        <Button
          color="error"
          variant="contained"
          onClick={async () => {
            if (!id) return;
            const confirm = window.confirm('Delete this batch?  This cannot be undone.');
            if (!confirm) return;
            await deleteBatch(id);
            navigate('/batches');
          }}
        >
          Delete Batch
        </Button>
      </Box>

      <Box mb={3}>
        <TextField
          fullWidth
          label="Batch Name"
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
              <Checkbox checked={selectedSet.has(span.id)} />
              <ListItemText primary={`${span.id} — ${span.spanName}`} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
        <Button onClick={() => navigate("/batches")}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!name || selectedRootSpanIds.length === 0}
          onClick={handleSubmit}
        >
          Save Batch
        </Button>
      </Box>
    </Container>
  );
};

export default EditBatch; 