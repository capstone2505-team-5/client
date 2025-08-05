import { useState,useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  useTheme as muiUseTheme,
  InputAdornment,
  IconButton,
  Modal,
  Backdrop,
  Tooltip,
} from "@mui/material";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import { DataGrid, getGridDateOperators } from "@mui/x-data-grid";
import type { GridColDef, GridRowParams } from "@mui/x-data-grid";
import { useRootSpanMutations, useRootSpansByProjectFiltered, useUniqueSpanNames, useRandomSpans } from "../hooks/useRootSpans";

interface FilterFormData {
  searchText: string;
  spanName: string;
  dateFilter: 'all' | '12h' | '24h' | '1w' | 'custom';
  startDate: Date | null;
  endDate: Date | null;
}

interface CreateBatchProps {
  onCreateBatch: (name: string, projectId: string, rootSpanIds: string[]) => Promise<string>;
}

const CreateBatch = ({ onCreateBatch }: CreateBatchProps) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [selectedSet, setSelectedSet] = useState<Set<string>>(new Set());
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 50 });
  const selectedRootSpanIds = useMemo(() => Array.from(selectedSet), [selectedSet]);
  const location = useLocation();
  const { projectName } = location.state || {};
  const { projectId } = useParams<{ projectId: string }>();
  const theme = muiUseTheme();
  const [displaySpanDetails, setDisplaySpanDetails] = useState(false);
  const [selectedSpanForModal, setSelectedSpanForModal] = useState<any>(null);
  
  // Filter form setup
  const { control, handleSubmit, watch, reset, setValue } = useForm<FilterFormData>({
    defaultValues: {
      searchText: '',
      spanName: '',
      dateFilter: 'all',
      startDate: null,
      endDate: null,
    }
  });

  const watchedDateFilter = watch('dateFilter');
  const [isRandomMode, setIsRandomMode] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterFormData>({
    searchText: '',
    spanName: '',
    dateFilter: 'all',
    startDate: null,
    endDate: null,
  });
  
  // Get the invalidation functions from the mutations hook
  const { invalidateBatch, invalidateProject } = useRootSpanMutations();

  // Fetch unique span names for the dropdown
  const { data: spanNames = [] } = useUniqueSpanNames(projectId || null);

  // Use filtered data fetching instead of the basic pagination hook
  const { data: paginatedData, isLoading } = useRootSpansByProjectFiltered(
    projectId || null,
    paginationModel.page,
    paginationModel.pageSize,
    isRandomMode ? undefined : {
      searchText: appliedFilters.searchText || undefined,
      spanName: appliedFilters.spanName || undefined,
      dateFilter: appliedFilters.dateFilter !== 'all' ? appliedFilters.dateFilter : undefined,
      startDate: appliedFilters.startDate?.toISOString() || undefined,
      endDate: appliedFilters.endDate?.toISOString() || undefined,
    }
  );

  // Fetch random spans when in random mode
  const { data: randomData, isLoading: isRandomLoading } = useRandomSpans(
    projectId || null,
    isRandomMode
  );

  useEffect(() => {
    if (isRandomMode && randomData && !isRandomLoading) {
      // Auto-select all random spans once they're loaded
      const randomSpanIds = randomData.rootSpans.map(span => span.id);
      setSelectedSet(new Set(randomSpanIds));
    }
  }, [isRandomMode, randomData, isRandomLoading]);

  // Choose data source based on mode
  const currentData = isRandomMode ? randomData : paginatedData;
  const annotatedRootSpans = currentData?.rootSpans || [];
  const totalCount = currentData?.totalCount || 0;
  
  // Use the loading state to prevent DataGrid resets, but don't show completely empty data
  const stableLoading = (isRandomMode ? isRandomLoading : isLoading) && !currentData;

  const updateBatchSpans = useCallback((batchId: string) => {
    // Invalidate both the batch and project queries to refresh data
    invalidateBatch(batchId);
    if (projectId) {
      invalidateProject(projectId);
    }
  }, [invalidateBatch, invalidateProject, projectId]);

  // Filter form handlers
  const onFilterSubmit = useCallback((data: FilterFormData) => {
    console.log('Filter submitted:', data);
    setIsRandomMode(false);
    setAppliedFilters(data); // Update applied filters state
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
  }, [paginationModel.pageSize]);

  const handleRandomSpans = useCallback(() => {
    console.log('Random spans requested');
    setIsRandomMode(true);
    // Clear applied filters when switching to random mode
    setAppliedFilters({
      searchText: '',
      spanName: '',
      dateFilter: 'all',
      startDate: null,
      endDate: null,
    });
    setPaginationModel({ page: 0, pageSize: 50 });
  }, []);

  const handleClearFilters = useCallback(() => {
    reset();
    setIsRandomMode(false);
    setAppliedFilters({
      searchText: '',
      spanName: '',
      dateFilter: 'all',
      startDate: null,
      endDate: null,
    }); // Reset applied filters when clearing
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
  }, [reset, paginationModel.pageSize]);

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

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage < 0) {
      console.warn('⚠️ Prevented negative page:', newPage);
      return;
    }
    
    setPaginationModel(prev => ({ ...prev, page: newPage }));
  }, [paginationModel.page, selectedSet]);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPaginationModel({ page: 0, pageSize: newPageSize });
  }, [paginationModel.pageSize]);

  // Handle individual row selection (from checkbox clicks)
  const handleRowSelectionChange = useCallback((spanId: string, isSelected: boolean) => {
    setSelectedSet(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (isSelected) {
        newSelected.add(spanId);
      } else {
        newSelected.delete(spanId);
      }
      
      return newSelected;
    });
  }, []);

  // Handle select all for current page
  const handleSelectAllCurrentPage = useCallback(() => {
    const currentPageIds = annotatedRootSpans.map(span => span.id);
    const selectedOnCurrentPage = currentPageIds.filter(id => selectedSet.has(id));
    const shouldSelectAll = selectedOnCurrentPage.length < currentPageIds.length;
    
    setSelectedSet(prevSelected => {
      const newSelected = new Set(prevSelected);
      
      if (shouldSelectAll) {
        // Select all on current page
        currentPageIds.forEach(id => newSelected.add(id));
      } else {
        // Deselect all on current page
        currentPageIds.forEach(id => newSelected.delete(id));
      }
      
      return newSelected;
    });
  }, [annotatedRootSpans, selectedSet]);

  // Truncate text for display in columns
  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Format date with time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Calculate select all checkbox state
  const currentPageIds = annotatedRootSpans.map(span => span.id);
  const selectedOnCurrentPage = currentPageIds.filter(id => selectedSet.has(id));
  const isAllCurrentPageSelected = selectedOnCurrentPage.length === currentPageIds.length && currentPageIds.length > 0;
  const isSomeCurrentPageSelected = selectedOnCurrentPage.length > 0 && selectedOnCurrentPage.length < currentPageIds.length;

  const handleRowClick = (params: GridRowParams) => {
    setSelectedSpanForModal(params.row);
    setDisplaySpanDetails(true);
  };

  const handleCloseModal = () => {
    setDisplaySpanDetails(false);
    setSelectedSpanForModal(null);
  };

  const columns: GridColDef[] = [
    {
      field: '__checkbox__',
      headerName: '',
      width: 50,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderHeader: () => (
        <Checkbox
          checked={isAllCurrentPageSelected}
          indeterminate={isSomeCurrentPageSelected}
          onChange={handleSelectAllCurrentPage}
          onClick={(e) => e.stopPropagation()} // Prevent any header click issues
          sx={{ p: 0 }}
        />
      ),
      renderCell: (params) => (
        <Checkbox
          checked={selectedSet.has(params.row.id)}
          onChange={(e) => handleRowSelectionChange(params.row.id, e.target.checked)}
          onClick={(e) => e.stopPropagation()} // Prevent row click when checkbox is clicked
          sx={{ p: 0 }}
        />
      ),
    },
    {
      field: 'id',
      headerName: 'Span ID',
      flex: 0.8,
      minWidth: 120,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
            fontFamily: 'monospace',
            fontSize: '0.85rem'
          }}
        >
          {params.value.substring(0, 12)}...
        </Typography>
      ),
    },
    {
      field: 'spanName',
      headerName: 'Name',
      flex: 1,
      minWidth: 200,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => (
        <Typography variant="body1" sx={{ 
          color: theme.palette.mode === 'dark' ? 'white' : 'black' 
        }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'startTime',
      headerName: 'Date',
      flex: 1.2,
      minWidth: 180,
      headerAlign: 'center',
      align: 'center',
      type: 'date',
      valueGetter: (value) => new Date(value),
      filterOperators: getGridDateOperators().filter((operator) =>
        ['is', 'after', 'onOrAfter', 'before', 'onOrBefore'].includes(operator.value)
      ),
      renderCell: (params) => (
        <Typography variant="body2" sx={{ 
          color: theme.palette.mode === 'dark' ? 'white' : 'black' 
        }}>
          {formatDateTime(params.value)}
        </Typography>
      ),
    },
    {
      field: 'input',
      headerName: 'Input',
      flex: 2,
      minWidth: 250,
      headerAlign: 'left',
      align: 'left',
      sortable: false,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            color: theme.palette.mode === 'dark' ? 'white' : 'black',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {truncateText(params.value || '', 100)}
        </Typography>
      ),
    },
    {
      field: 'output',
      headerName: 'Output',
      flex: 2,
      minWidth: 250,
      headerAlign: 'left',
      align: 'left',
      sortable: false,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            color: theme.palette.mode === 'dark' ? 'white' : 'black',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {truncateText(params.value || '', 100)}
        </Typography>
      ),
    },
  ];

  return (
    <Container maxWidth={false} sx={{ mt: 1.5, mb: 1.5, px: 3 }}>
      <Box sx={{ mb: 1.5, position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
        {/* Project Name Box - Far Left */}
        {projectName && (
          <Box sx={{ 
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Box 
              onClick={() => navigate(`/projects/${projectId}`, { 
                state: { projectName: projectName, projectId: projectId } 
              })}
              sx={{
                px: 2,
                py: 0.75,
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(0, 0, 0, 0.4)' 
                  : 'rgba(255, 255, 255, 0.9)',
                borderRadius: 2,
                border: '2px solid',
                borderColor: 'secondary.main',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 2px 8px rgba(255, 235, 59, 0.2)'
                  : '0 2px 8px rgba(255, 235, 59, 0.3)',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'secondary.dark',
                  backgroundColor: 'rgba(255, 235, 59, 0.1)',
                },
              }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#212121',
                  fontWeight: 'medium',
                  fontSize: '0.875rem',
                  letterSpacing: '0.5px'
                }}
              >
                PROJECT
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#212121',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  mt: -0.5
                }}
              >
                {projectName}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Centered Title Content */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#212121',
              mb: 1
            }}
          >
            Create New Batch
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Select spans to include in your batch
          </Typography>
        </Box>

        {/* Create Batch Button - Top Right */}
        <Box sx={{ 
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}>
          <Tooltip
            title={
              !name && selectedRootSpanIds.length === 0 
                ? "Enter a batch name and select spans to create a batch"
                : !name 
                  ? "Enter a batch name to create the batch"
                  : selectedRootSpanIds.length === 0
                    ? "Select at least one span to create a batch"
                    : "Create batch with selected spans"
            }
            arrow
            placement="left"
          >
            <span>
              <Button
                variant="contained"
                onClick={handleCreateBatch}
                disabled={!name || selectedRootSpanIds.length === 0}
                size="large"
                sx={{ 
                  px: 3, 
                  minWidth: 200,
                  maxHeight: 40,
                  backgroundColor: 'secondary.main',
                  color: 'black',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'secondary.dark',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: 'grey.400',
                    color: 'grey.600',
                  }
                }}
              >
                Create Batch ({selectedRootSpanIds.length})
              </Button>
            </span>
          </Tooltip>
          
          <Button
            variant="outlined"
            onClick={() => navigate(`/projects/${projectId}`, { 
              state: { projectName: projectName, projectId: projectId } 
            })}
            size="large"
            sx={{ 
              px: 3, 
              minWidth: 200,
              maxHeight: 40,
              borderColor: 'grey.400',
              color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
              fontWeight: 600,
              '&:hover': {
                borderColor: 'grey.600',
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.08)' 
                  : 'rgba(0, 0, 0, 0.04)',
              }
            }}
          >
            Cancel
          </Button>
        </Box>
      </Box>

      {/* Batch Name Control */}
      <Box sx={{ mb: 3, display: 'flex', gap: 3, alignItems: 'flex-end' }}>
        <TextField
          label="New Batch Name"
          value={name}
          onChange={handleNameChange}
          sx={{ minWidth: 300 }}
          size="medium"
          required
          error={!name && name !== ""}
        />
      </Box>

      {/* Filter Form */}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Paper 
          elevation={0}
          sx={{ 
            mb: 2,
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.02)'
              : 'rgba(0, 0, 0, 0.02)',
          }}
        >
          <form onSubmit={handleSubmit(onFilterSubmit)}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Search Text Input - Full Width */}
              <Controller
                name="searchText"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    placeholder="Search spans by input, output, or span ID..."
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: field.value && (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setValue('searchText', '')}
                            edge="end"
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              {/* Row 2: Filters and Actions */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <Controller
                  name="spanName"
                  control={control}
                  render={({ field }) => (
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                      <InputLabel>Span Name</InputLabel>
                      <Select {...field} label="Span Name">
                        <MenuItem value="">All Spans</MenuItem>
                        {spanNames.map((name) => (
                          <MenuItem key={name} value={name}>
                            {name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />

                <Controller
                  name="dateFilter"
                  control={control}
                  render={({ field }) => (
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <InputLabel>Time Period</InputLabel>
                      <Select {...field} label="Time Period">
                        <MenuItem value="all">All Time</MenuItem>
                        <MenuItem value="12h">Last 12 Hours</MenuItem>
                        <MenuItem value="24h">Last 24 Hours</MenuItem>
                        <MenuItem value="1w">Last Week</MenuItem>
                        <MenuItem value="custom">Custom Range</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />

                {/* Custom Date Range - Show only when custom is selected */}
                {watchedDateFilter === 'custom' && (
                  <>
                    <Controller
                      name="startDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          label="Start Date"
                          slotProps={{
                            textField: {
                              size: 'small',
                              sx: { minWidth: 140 },
                            },
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="endDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          label="End Date"
                          slotProps={{
                            textField: {
                              size: 'small',
                              sx: { minWidth: 140 },
                            },
                          }}
                        />
                      )}
                    />
                  </>
                )}

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
                  <Button
                    type="submit"
                    variant="outlined"
                    size="small"
                    startIcon={<FilterListIcon />}
                    sx={{
                      borderColor: theme.palette.mode === 'dark' ? 'secondary.main' : 'primary.main',
                      color: theme.palette.mode === 'dark' ? 'secondary.main' : 'primary.main',
                      '&:hover': {
                        borderColor: theme.palette.mode === 'dark' ? 'secondary.dark' : 'primary.dark',
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? 'rgba(255, 235, 59, 0.1)' 
                          : 'rgba(25, 118, 210, 0.1)',
                      },
                    }}
                  >
                    Apply Filters
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    startIcon={<ShuffleIcon />}
                    onClick={handleRandomSpans}
                    disabled={annotatedRootSpans.length === 0 || annotatedRootSpans.length < 50}
                    sx={{
                      borderColor: theme.palette.mode === 'dark' ? 'secondary.main' : 'primary.main',
                      color: theme.palette.mode === 'dark' ? 'secondary.main' : 'primary.main',
                      '&:hover': {
                        borderColor: theme.palette.mode === 'dark' ? 'secondary.dark' : 'primary.dark',
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? 'rgba(255, 235, 59, 0.1)' 
                          : 'rgba(25, 118, 210, 0.1)',
                      },
                    }}
                  >
                    Random 50
                  </Button>
                  <Button
                    type="button"
                    variant="text"
                    size="small"
                    onClick={handleClearFilters}
                    sx={{ color: 'text.secondary' }}
                  >
                    Clear
                  </Button>
                </Box>
              </Box>
            </Box>
          </form>

          {/* Filter Status Indicator */}
          {(isRandomMode || Object.values(appliedFilters).some(value => 
            value && value !== '' && value !== 'all'
          )) && (
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              {isRandomMode ? (
                <>
                  <ShuffleIcon color="secondary" fontSize="small" />
                  <Typography variant="body2" color="secondary.main" sx={{ fontWeight: 'medium' }}>
                    Showing 50 random spans from recent data
                  </Typography>
                </>
              ) : (
                <>
                  <FilterListIcon color="primary" fontSize="small" />
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                    Filters applied:
                  </Typography>
                  {appliedFilters.searchText && (
                    <Typography variant="body2" color="primary.main" sx={{ 
                      backgroundColor: 'rgba(25, 118, 210, 0.1)', 
                      px: 1, 
                      py: 0.25, 
                      borderRadius: 1,
                      fontSize: '0.75rem'
                    }}>
                      Text: "{appliedFilters.searchText}"
                    </Typography>
                  )}
                  {appliedFilters.spanName && (
                    <Typography variant="body2" color="primary.main" sx={{ 
                      backgroundColor: 'rgba(25, 118, 210, 0.1)', 
                      px: 1, 
                      py: 0.25, 
                      borderRadius: 1,
                      fontSize: '0.75rem'
                    }}>
                      Span: {appliedFilters.spanName}
                    </Typography>
                  )}
                  {appliedFilters.dateFilter && appliedFilters.dateFilter !== 'all' && (
                    <Typography variant="body2" color="primary.main" sx={{ 
                      backgroundColor: 'rgba(25, 118, 210, 0.1)', 
                      px: 1, 
                      py: 0.25, 
                      borderRadius: 1,
                      fontSize: '0.75rem'
                    }}>
                      Time: {appliedFilters.dateFilter === 'custom' 
                        ? `${appliedFilters.startDate?.toLocaleDateString()} - ${appliedFilters.endDate?.toLocaleDateString()}`
                        : appliedFilters.dateFilter
                      }
                    </Typography>
                  )}
                </>
              )}
            </Box>
          )}
        </Paper>
      </LocalizationProvider>

      <Paper 
        elevation={0}
        sx={{ 
          width: '100%',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          '& .MuiDataGrid-root': {
            border: 'none',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(0, 0, 0, 0.04)',
            fontSize: '1rem',
            fontWeight: '600',
            color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#212121',
            borderBottom: '2px solid',
            borderBottomColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.12)'
              : 'rgba(0, 0, 0, 0.12)',
            borderRadius: '12px 12px 0 0',
          },
          '& .MuiDataGrid-row': {
            minHeight: '56px !important',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.08)'
                : '#f8f9fa',
              transform: 'scale(1.001)',
              transition: 'all 0.2s ease-in-out',
            },
            '&.Mui-selected': {
              backgroundColor: theme.palette.mode === 'dark'
                ? `${theme.palette.primary.main}14`
                : `${theme.palette.primary.main}1F`,
            },
          },
          '& .MuiDataGrid-cell': {
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.95rem',
            borderBottom: '1px solid',
            borderBottomColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.12)'
              : 'rgba(0, 0, 0, 0.12)',
            py: 1,
          },
          '& .MuiDataGrid-footerContainer': {
            backgroundColor: theme.palette.mode === 'dark' ? '#000000' : '#FFFFFF',
            borderTop: '1px solid',
            borderTopColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.12)'
              : 'rgba(0, 0, 0, 0.12)',
            minHeight: '56px',
            height: '56px',
            borderRadius: '0 0 12px 12px',
            color: theme.palette.text.primary,
          },
          '& .MuiTablePagination-root': {
            overflow: 'visible',
            color: theme.palette.text.primary,
          },
          '& .MuiTablePagination-toolbar': {
            minHeight: '56px',
            height: '56px',
            color: theme.palette.text.primary,
          },
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            color: theme.palette.text.primary,
          },
          '& .MuiTablePagination-select': {
            color: theme.palette.text.primary,
          },
          '& .MuiIconButton-root': {
            color: theme.palette.text.primary,
          },
          '& .MuiDataGrid-footerContainer .MuiSvgIcon-root': {
            color: theme.palette.text.primary,
          },
          // Custom scrollbar styling
          '& .MuiDataGrid-virtualScroller::-webkit-scrollbar': {
            width: '12px !important',
            height: '12px !important',
          },
          '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-track': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? '#1a1a1a !important' 
              : 'rgba(0, 0, 0, 0.05) !important',
            borderRadius: '6px',
          },
          '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? '#404040 !important' 
              : 'rgba(0, 0, 0, 0.9) !important',
            borderRadius: '6px',
            border: theme.palette.mode === 'dark' 
              ? '1px solid #555 !important' 
              : 'none',
          },
          '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb:hover': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? '#606060 !important' 
              : 'rgba(0, 0, 0, 0.7) !important',
          },
          '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-corner': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? '#1a1a1a !important' 
              : 'rgba(0, 0, 0, 0.05) !important',
          },
        }}
      >
        <Box sx={{ height: 'calc(100vh - 600px)' }}>
          <DataGrid
            rows={annotatedRootSpans}
            columns={columns}
            hideFooter
            getRowHeight={() => 56}
            getRowClassName={(params) => 
              selectedSet.has(params.row.id) ? 'Mui-selected' : ''
            }
            onRowClick={handleRowClick}
            loading={stableLoading}
            slots={{
              noRowsOverlay: () => (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  py: 4
                }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 1,
                      color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
                    }}
                  >
                    No root spans available
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{
                      color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    Try adjusting your time interval filter or check if the project has any data
                  </Typography>
                </Box>
              )
            }}
          />
        </Box>

                {/* Custom Pagination Controls */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          mt: 0, 
          px: 2,
          py: 1.5,
          backgroundColor: theme.palette.mode === 'dark' ? '#000000' : '#FFFFFF',
          borderTop: '1px solid',
          borderTopColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
          borderRadius: '0 0 12px 12px',
          minHeight: '56px'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <Select
                value={paginationModel.pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                sx={{ color: 'text.primary' }}
              >
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body1" sx={{ 
                color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#212121',
                fontWeight: 'medium'
              }}>
                {annotatedRootSpans.length > 0 && totalCount > 0
                  ? `${paginationModel.page * paginationModel.pageSize + 1}-${Math.min((paginationModel.page + 1) * paginationModel.pageSize, totalCount)} of ${totalCount}`
                  : totalCount > 0 
                    ? `0 of ${totalCount}`
                    : 'No data'
                }
              </Typography>
              
              {selectedSet.size > 0 && (
                <Typography variant="body2" sx={{ 
                  color: 'secondary.main',
                  fontWeight: 'bold',
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 235, 59, 0.1)' 
                    : 'rgba(255, 235, 59, 0.2)',
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'secondary.main'
                }}>
                  {selectedSet.size} selected across pages
                </Typography>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                onClick={() => handlePageChange(0)}
                disabled={paginationModel.page === 0 || stableLoading}
                sx={{ minWidth: 'auto', px: 1 }}
              >
                ⟪
              </Button>
              <Button
                size="small"
                onClick={() => handlePageChange(paginationModel.page - 1)}
                disabled={paginationModel.page === 0 || stableLoading}
                sx={{ minWidth: 'auto', px: 1 }}
              >
                ⟨
              </Button>
              <Typography variant="body2" sx={{ mx: 2, color: 'text.primary' }}>
                Page {paginationModel.page + 1} of {Math.ceil(totalCount / paginationModel.pageSize) || 1}
              </Typography>
              <Button
                size="small"
                onClick={() => handlePageChange(paginationModel.page + 1)}
                disabled={paginationModel.page >= Math.ceil(totalCount / paginationModel.pageSize) - 1 || stableLoading}
                sx={{ minWidth: 'auto', px: 1 }}
              >
                ⟩
              </Button>
              <Button
                size="small"
                onClick={() => handlePageChange(Math.ceil(totalCount / paginationModel.pageSize) - 1)}
                disabled={paginationModel.page >= Math.ceil(totalCount / paginationModel.pageSize) - 1 || stableLoading}
                sx={{ minWidth: 'auto', px: 1 }}
              >
                ⟫
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Span Details Modal */}
      <Modal
        open={displaySpanDetails}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: 800,
          maxHeight: '80vh',
          bgcolor: 'background.paper',
          border: '2px solid',
          borderColor: 'divider',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          overflow: 'auto',
        }}>
          {selectedSpanForModal && (
            <>
              <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
                Span Details
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 1 }}>
                    Span Name
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    p: 2, 
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    borderRadius: 1 
                  }}>
                    {selectedSpanForModal.spanName}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 1 }}>
                    Date
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    p: 2, 
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    borderRadius: 1 
                  }}>
                    {formatDateTime(selectedSpanForModal.startTime)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 1 }}>
                    Input
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    p: 2, 
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    borderRadius: 1,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {selectedSpanForModal.input || 'No input data'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 1 }}>
                    Output
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    p: 2, 
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    borderRadius: 1,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {selectedSpanForModal.output || 'No output data'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button 
                  onClick={handleCloseModal}
                  variant="contained"
                  sx={{
                    backgroundColor: 'secondary.main',
                    color: 'black',
                    '&:hover': {
                      backgroundColor: 'secondary.dark',
                    }
                  }}
                >
                  Close
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Container>
  );
};

export default CreateBatch; 