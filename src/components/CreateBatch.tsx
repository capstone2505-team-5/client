import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
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
import { useRootSpanMutations } from "../hooks/useRootSpans";

interface CreateBatchProps {
  annotatedRootSpans: AnnotatedRootSpan[];
  onLoadRootSpans: (projectId: string) => void;
  onCreateBatch: (name: string, projectId: string, rootSpanIds: string[]) => Promise<string>;
  isLoading: boolean;
}

const CreateBatch = ({ annotatedRootSpans, onLoadRootSpans, onCreateBatch, isLoading }: CreateBatchProps) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [selectedSet, setSelectedSet] = useState<Set<string>>(new Set());
  const [timeInterval, setTimeInterval] = useState<'all' | '1h' | '24h' | '7d'>('all');
  const selectedRootSpanIds = useMemo(() => Array.from(selectedSet), [selectedSet]);
  const location = useLocation();
  const { projectName, batchId } = location.state || {};
  const { projectId } = useParams<{ projectId: string }>();
  
  // Get the invalidation functions from the mutations hook
  const { invalidateBatch, invalidateProject } = useRootSpanMutations();
  
  useEffect(() => {
    if (projectId) {
      onLoadRootSpans(projectId);
    }
  }, [projectId, onLoadRootSpans]);

  const now = useMemo(() => new Date(), []);
  const displayedSpans = useMemo(() => {
    const threshold = (() => {
      if (timeInterval === 'all') return 0;
      const t = now.getTime();
      if (timeInterval === '1h')  return t - 3600_000;
      if (timeInterval === '24h') return t - 86_400_000;
      return t - 604_800_000; // 7d
    })();

    return annotatedRootSpans
      .filter(span => span.startTime !== null) // Filter out spans with null startTime
      .filter(span =>
        (threshold === 0 || new Date(span.startTime!).getTime() >= threshold)
      )
      .sort((a, b) => new Date(b.startTime!).getTime() - new Date(a.startTime!).getTime());
  }, [annotatedRootSpans, timeInterval, now]);



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

  const updateBatchSpans = useCallback((batchId: string) => {
    // Invalidate both the batch and project queries to refresh data
    invalidateBatch(batchId);
    if (projectId) {
      invalidateProject(projectId);
    }
  }, [invalidateBatch, invalidateProject, projectId]);

  const startListeningForSSE = (batchId: string) => {
    const eventSource = new EventSource(`/api/batches/${batchId}/events`);
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('SSE Event received:', data);
      
      // Handle different event types from the server
      if (data.status === 'completed') {
        updateBatchSpans(batchId);
      }
    };
    eventSource.onerror = (event) => {
      console.error('SSE connection error:', event);
      eventSource.close();
    };

    // Set a timeout to close connection after 2 minutes
    setTimeout(() => {
      if (eventSource.readyState === EventSource.OPEN) {
        eventSource.close();
        console.log(`SSE timeout for batch ${batchId}`);
      }
    }, 120000); // 2 minutes timeout
    
  }

  const handleCreateBatch = useCallback(async () => {
    if (!name || selectedRootSpanIds.length === 0 || !projectId) return;
    
    try {
      const batchId = await onCreateBatch(name, projectId, selectedRootSpanIds);
      // Start SSE connection
      startListeningForSSE(batchId);
      
      // Navigate to the newly created batch (good UX)
      navigate(`/projects/${projectId}/batches/${batchId}`, { 
        state: { projectName: projectName, projectId: projectId, batchName: name } 
      });
      
    } catch (error) {
      console.error("Failed to create batch:", error);
    }
  }, [name, selectedRootSpanIds, onCreateBatch, navigate, projectId, projectName, startListeningForSSE]);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
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
              <Checkbox 
                checked={selectedSet.has(rootSpan.id)} 
              />
              <ListItemText primary={`${rootSpan.traceId} — ${rootSpan.spanName}`} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
        <Button onClick={() => navigate(`/projects/${projectId}`, { 
          state: { projectName, projectId} 
        })}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!name || selectedRootSpanIds.length === 0}
          onClick={handleCreateBatch}
        >
          Create Batch
        </Button>
      </Box>
    </Container>
  );
};

export default CreateBatch; 