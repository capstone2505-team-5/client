import { useState, useMemo, useEffect, useCallback } from "react";
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
import type { SelectChangeEvent } from "@mui/material";
import type { AnnotatedRootSpan, Project } from "../types/types";
import { fetchProjects } from "../services/services";

interface CreateBatchProps {
  annotatedRootSpans: AnnotatedRootSpan[];
  onCreateBatch: (name: string, rootSpanIds: string[]) => void;
}

const CreateBatch = ({ annotatedRootSpans: rootSpans, onCreateBatch }: CreateBatchProps) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [selectedSet, setSelectedSet] = useState<Set<string>>(new Set());
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [timeInterval, setTimeInterval] = useState<'all' | '1h' | '24h' | '7d'>('all');
  const selectedRootSpanIds = useMemo(() => Array.from(selectedSet), [selectedSet]);
  const [projects, setProjects] = useState<Project[]>([]);
  console.log(projects)
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
      .filter(span => span.startTime !== null) // Filter out spans with null startTime
      .filter(span =>
        (projectFilter === 'all' || span.projectId === projectFilter) &&
        (threshold === 0 || new Date(span.startTime!).getTime() >= threshold)
      )
      .sort((a, b) => new Date(b.startTime!).getTime() - new Date(a.startTime!).getTime());
  }, [rootSpans, projectFilter, timeInterval, now]);

  // unique projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projects = await fetchProjects();
        setProjects(projects);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    };
    
    loadProjects();
  }, []);

  const allSelected = useMemo(() =>
    displayedSpans.length > 0 &&
    displayedSpans.every(s => selectedSet.has(s.id)),
    [displayedSpans, selectedSet]
  );

  const handleSelectAll = useCallback(() =>
    setSelectedSet(prev => {
      const next = new Set(prev);

      if (allSelected) {
        displayedSpans.forEach(s => next.delete(s.id));
      } else {
        displayedSpans.forEach(s => next.add(s.id));
      }
      return next;
    }),
    [allSelected, displayedSpans]
  );

  const toggle = useCallback((id: string) =>
    setSelectedSet(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    }),
    []
  );

  const handleSubmit = useCallback(async () => {
    if (!name || selectedRootSpanIds.length === 0) return;
    onCreateBatch(name, selectedRootSpanIds);
    navigate("/batches");
  }, [name, selectedRootSpanIds, onCreateBatch, navigate]);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const handleProjectFilterChange = useCallback((e: SelectChangeEvent) => {
    setProjectFilter(e.target.value);
  }, []);

  const handleTimeIntervalChange = useCallback((e: SelectChangeEvent) => {
    setTimeInterval(e.target.value as 'all' | '1h' | '24h' | '7d');
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Typography variant="h4" mb={2}>
        Create New Batch
      </Typography>
      <Box mb={3}>
                  <TextField
            fullWidth
            label="Batch Name"
            value={name}
            onChange={handleNameChange}
          />
      </Box>

      {/* Project & Time Interval Filters */}
      <Box mb={3} display="flex" gap={2}>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Project</InputLabel>
          <Select
            value={projectFilter}
            label="Project"
            onChange={handleProjectFilterChange}
          >
            <MenuItem value="all">All Projects</MenuItem>
            {projects.map((proj) => (
              <MenuItem key={proj.id} value={proj.id}>{proj.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Time Interval</InputLabel>
          <Select
            value={timeInterval}
            label="Time Interval"
            onChange={handleTimeIntervalChange}
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
              <ListItemText primary={`${rootSpan.traceId} — ${rootSpan.spanName}`} />
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
          Create Batch
        </Button>
      </Box>
    </Container>
  );
};

export default CreateBatch; 