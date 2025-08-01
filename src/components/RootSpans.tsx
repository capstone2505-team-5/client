import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useMemo, useEffect, Fragment } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Backdrop,
  Snackbar,
  Alert,
  useTheme as muiUseTheme,
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { DataGrid, getGridDateOperators } from "@mui/x-data-grid";
import type { GridColDef, GridFilterOperator, GridFilterInputValueProps } from "@mui/x-data-grid";
import RateReviewIcon from '@mui/icons-material/RateReview';
import CategoryIcon from '@mui/icons-material/Category';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import type { AnnotatedRootSpan } from "../types/types";
import { useQueryClient } from "@tanstack/react-query";
import { categorizeAnnotations, deleteRootSpan, deleteAnnotation } from "../services/services";

// Custom Rating Filter Component
const RatingFilterInputValue = (props: GridFilterInputValueProps) => {
  const { item, applyValue } = props;

  const handleFilterChange = (event: any) => {
    applyValue({ ...item, value: event.target.value });
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'good':
        return <CheckCircleIcon sx={{ color: 'success.main', fontSize: '1.25rem' }} />;
      case 'bad':
        return <CancelIcon sx={{ color: 'error.main', fontSize: '1.25rem' }} />;
      case 'none':
        return <CheckCircleOutlineIcon sx={{ color: 'text.disabled', fontSize: '1.25rem' }} />;
      default:
        return null;
    }
  };

  const getRatingLabel = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'Good';
      case 'bad':
        return 'Bad';
      case 'none':
        return 'Not Rated';
      default:
        return 'All';
    }
  };

  return (
    <FormControl fullWidth size="small">
      <Select
        value={item.value || ''}
        onChange={handleFilterChange}
        displayEmpty
        sx={{ minWidth: 120 }}
      >
        <MenuItem value="">
          <ListItemText primary="All" />
        </MenuItem>
        <MenuItem value="good">
          <ListItemIcon sx={{ minWidth: '32px !important' }}>
            {getRatingIcon('good')}
          </ListItemIcon>
          <ListItemText primary={getRatingLabel('good')} />
        </MenuItem>
        <MenuItem value="bad">
          <ListItemIcon sx={{ minWidth: '32px !important' }}>
            {getRatingIcon('bad')}
          </ListItemIcon>
          <ListItemText primary={getRatingLabel('bad')} />
        </MenuItem>
        <MenuItem value="none">
          <ListItemIcon sx={{ minWidth: '32px !important' }}>
            {getRatingIcon('none')}
          </ListItemIcon>
          <ListItemText primary={getRatingLabel('none')} />
        </MenuItem>
      </Select>
    </FormControl>
  );
};

// Custom filter operators for rating
const ratingFilterOperators: GridFilterOperator[] = [
  {
    label: 'is',
    value: 'is',
    getApplyFilterFn: (filterItem) => {
      if (!filterItem.value) {
        return null;
      }
      return (value) => {
        // Handle the case where unrated spans have null/undefined rating
        if (filterItem.value === 'none') {
          return !value || value === 'none' || value === null || value === undefined;
        }
        return value === filterItem.value;
      };
    },
          InputComponent: RatingFilterInputValue,
  },
];

interface RootSpansProps {
  annotatedRootSpans: AnnotatedRootSpan[];
  onLoadRootSpans: (batchId: string) => void;
  isLoading: boolean;
}

const RootSpans = ({ annotatedRootSpans, onLoadRootSpans, isLoading }: RootSpansProps) => {
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [rootSpanToDelete, setRootSpanToDelete] = useState<string | null>(null);
  const [categorizeModalOpen, setCategorizeModalOpen] = useState(false);
  const [categorizeResults, setCategorizeResults] = useState<Record<string, number> | null>(null);
  const navigate = useNavigate();
  const { projectId, batchId } = useParams<{ projectId: string, batchId: string }>();
  const location = useLocation();
  const { projectName, batchName } = location.state || {};
  const theme = muiUseTheme();
  const queryClient = useQueryClient();
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  useEffect(() => {
    if (batchId) {
      onLoadRootSpans(batchId);
    }
  }, [batchId, onLoadRootSpans]);



  const handleClose = () => {
    setOpen(false);
    setRootSpanToDelete(null);
  };

  const handleCategorizeModalClose = () => {
    setCategorizeModalOpen(false);
    setCategorizeResults(null);
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev: typeof snackbar) => ({ ...prev, open: false }));
  };

  // Check for pending toast after re-renders (from React Query refetch)
  useEffect(() => {
    const pending = sessionStorage.getItem('pendingToast');
    if (pending) {
      sessionStorage.removeItem('pendingToast');
      const toastData = JSON.parse(pending);
      setSnackbar(toastData);
    }
  }, [annotatedRootSpans]); // Trigger when data changes

  const handleConfirmDelete = async () => {
    if (rootSpanToDelete) {
      await handleDelete(rootSpanToDelete);
      handleClose();
    }
  };

  const handleView = (annotatedRootSpan: AnnotatedRootSpan) => {
    navigate(`rootSpans/${annotatedRootSpan.traceId}`, { state: { projectName, projectId, batchName, batchId: batchId, annotatedRootSpan } });
  };

  const handleCategorize = async () => {
    try {
      if (batchId) {  
        setIsCategorizing(true);
        const result = await categorizeAnnotations(batchId);
        
        // Check if no categories were created (no bad annotations)
        if (!result || Object.keys(result).length === 0) {
          // Still show modal to inform user
          setCategorizeResults({});
          setCategorizeModalOpen(true);
        } else {
          setCategorizeResults(result);
          setCategorizeModalOpen(true);
        }
        
        // Reload the root spans data to reflect updated annotations
        queryClient.invalidateQueries({ queryKey: ['rootSpans', 'batch', batchId] });
        // Also reload batches data to update category counts
        queryClient.invalidateQueries({ queryKey: ['batches', projectId] });
        
        // Reload the current data
        if (batchId) {
          onLoadRootSpans(batchId);
        }
      }
    } catch (error: any) {
      console.error("Failed to categorize annotations", error);
      
      // Show error in results modal
      setCategorizeResults(null);
      setCategorizeModalOpen(true);
      
      // Store error for display
      const errorMessage = error?.response?.data?.error || error?.message || 'Categorization failed';
      setCategorizeResults({ __error: errorMessage } as any);
    } finally {
      setIsCategorizing(false);
    }
  };

  const handleDelete = async (rootSpanId: string) => {
    try {
      if (!batchId) return;
      
      // Delete root span from batch (always succeeds)
      await deleteRootSpan(batchId, rootSpanId);
      
      // Try to delete annotation (may not exist)
      try {
        await deleteAnnotation(rootSpanId);
      } catch (annotationError) {
        // Ignore if annotation doesn't exist
        console.log("No annotation to delete for span:", rootSpanId);
      }
      
      handleClose();
      
      // Store success toast in sessionStorage (survives re-renders)
      sessionStorage.setItem('pendingToast', JSON.stringify({
        open: true,
        message: 'Root span successfully removed from batch',
        severity: 'success'
      }));
      
      // Refresh data immediately
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['rootSpans', 'batch', batchId] }),
        queryClient.invalidateQueries({ queryKey: ['batches', projectId] })
      ]);
    } catch (error) {
      console.error("Failed to delete root span", error);
      
      // Show error toast
      setSnackbar({
        open: true,
        message: 'Failed to remove root span from batch',
        severity: 'error'
      });
    }
  };

  // Filter root spans based on search term
  const filteredRootSpans = useMemo(() => {
    if (!searchTerm.trim()) return annotatedRootSpans;
    
    return annotatedRootSpans.filter(rootSpan =>
      rootSpan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rootSpan.spanName && rootSpan.spanName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (rootSpan.input && rootSpan.input.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (rootSpan.output && rootSpan.output.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [annotatedRootSpans, searchTerm]);

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

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Span',
      flex: 1,
      minWidth: 200,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            fontFamily: 'monospace',
            color: 'white',
            fontWeight: 'medium'
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'spanName',
      headerName: 'Name',
      flex: 1,
      minWidth: 150,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => (
        <Typography variant="body1" sx={{ color: 'white' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'rating',
      headerName: 'Rating',
      width: 80,
      headerAlign: 'center',
      align: 'center',
      sortable: true,
      filterable: true,
      type: 'singleSelect',
      valueOptions: [
        { value: 'good', label: 'Good' },
        { value: 'bad', label: 'Bad' },
        { value: 'none', label: 'Not Rated' },
      ],
        valueGetter: (value, row) => row.annotation?.rating || 'none',
       renderCell: (params) => {
         const rating = params.value as string;
        const getStatusIcon = () => {
          switch (rating) {
            case 'good':
              return (
                <Tooltip title="Rated Good" arrow>
                  <CheckCircleIcon sx={{ color: 'success.main', fontSize: '1.25rem' }} />
                </Tooltip>
              );
            case 'bad':
              return (
                <Tooltip title="Rated Bad" arrow>
                  <CancelIcon sx={{ color: 'error.main', fontSize: '1.25rem' }} />
                </Tooltip>
              );
            default:
              return (
                <Tooltip title="Not Rated" arrow>
                  <CheckCircleOutlineIcon sx={{ color: 'text.disabled', fontSize: '1.25rem' }} />
                </Tooltip>
              );
          }
        };
        
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {getStatusIcon()}
          </Box>
        );
      },
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
        <Typography variant="body2" sx={{ color: 'white' }}>
          {formatDateTime(params.value)}
        </Typography>
      ),
    },
    {
      field: 'input',
      headerName: 'Input',
      flex: 2,
      minWidth: 200,
      headerAlign: 'left',
      align: 'left',
      sortable: false,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'white',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {truncateText(params.value || '', 80)}
        </Typography>
      ),
    },
    {
      field: 'output',
      headerName: 'Output',
      flex: 2,
      minWidth: 200,
      headerAlign: 'left',
      align: 'left',
      sortable: false,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'white',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {truncateText(params.value || '', 80)}
        </Typography>
      ),
    },
    {
      field: 'categories',
      headerName: 'Categories',
      flex: 2,
      minWidth: 250,
      headerAlign: 'left',
      align: 'left',
      sortable: false,
      valueGetter: (_value, row) => row.annotation?.categories || [],
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, py: 1 }}>
          {(params.value as string[])?.length > 0 ? (
            (params.value as string[]).map((category, index) => (
              <Chip
                key={index}
                label={category}
                size="small"
                variant="outlined"
                sx={{ 
                  fontSize: '0.75rem',
                  height: '24px',
                  '& .MuiChip-label': { px: 1 }
                }}
              />
            ))
          ) : (
            <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
              No categories
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 50,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              setRootSpanToDelete(params.row.id);
              setOpen(true)
            }}
            sx={{ 
              border: '1px solid',
              borderColor: 'grey.500',
              '&:hover': { backgroundColor: 'error.light' },
              width: 28,
              height: 28,
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  // Check if all root spans have ratings
  const allSpansRated = useMemo(() => {
    return annotatedRootSpans.length > 0 && annotatedRootSpans.every(span => 
      span.annotation?.rating !== undefined && span.annotation?.rating !== null
    );
  }, [annotatedRootSpans]);

  // Calculate dynamic height based on rows per page
  const getDataGridHeight = () => {
    const headerHeight = 56;
    const footerHeight = 56;
    const rowHeight = 56;
    const padding = 20;
    
    // Ensure minimum height to show pagination
    const minRows = Math.min(pageSize, annotatedRootSpans.length);
    const displayRows = Math.max(minRows, 5); // Show at least 5 rows worth of space
    
    return headerHeight + (displayRows * rowHeight) + footerHeight + padding;
  };

  return (
    <Container maxWidth={false} sx={{ mt: 1.5, mb: 1.5, px: 3 }}>
      <Box sx={{ mb: 1.5, position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
        {/* Project Name Box - Far Left */}
        {(projectName || (annotatedRootSpans.length > 0 && annotatedRootSpans[0].projectName)) && (
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
                {projectName || annotatedRootSpans[0]?.projectName}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Centered Title Content */}
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 'bold',
                color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#212121',
              }}
            >
              {batchName}
            </Typography>
            <Chip
              label={annotatedRootSpans.length}
              sx={{
                backgroundColor: 'secondary.main',
                color: 'black',
                fontWeight: 'bold',
                fontSize: '1rem',
                height: '32px',
                '& .MuiChip-label': {
                  px: 1.5
                }
              }}
            />
          </Box>
          <Typography variant="h6" color="text.secondary" sx={{ mt: -1 }}>
            Review and annotate individual spans from your batch
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ 
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 1,
        }}>
          <Button
            variant="contained"
            startIcon={<RateReviewIcon />}
            onClick={() => navigate(`/projects/${projectId}/batches/${batchId}/annotation`, { 
              state: { projectName: projectName || annotatedRootSpans[0]?.projectName, projectId, batchName } 
            })}
            size="large"
            sx={{ 
              px: 3, 
              minWidth: 225,
              maxHeight: 35,
              backgroundColor: 'secondary.main',
              color: 'black',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'secondary.dark',
              },
            }}
          >
            Grade Batch!
          </Button>
          <Button
            variant="outlined"
            startIcon={<CategoryIcon />}
            onClick={() => handleCategorize()}
            size="large"
            disabled={!allSpansRated || isCategorizing}
            sx={{ 
              px: 3,
              minWidth: 225,
              maxHeight: 35,
              borderColor: 'secondary.main',
              color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.99)' : 'rgba(0, 0, 0, 0.6)',
              fontWeight: 600,
              opacity: (allSpansRated && !isCategorizing) ? 1 : 0.5,
              '&:hover': {
                borderColor: 'secondary.dark',
                backgroundColor: 'rgba(255, 235, 59, 0.1)',
              },
              '&.Mui-disabled': {
                borderColor: 'text.disabled',
                color: 'text.disabled',
              }
            }}
          >
            {isCategorizing ? 'Categorizing...' : `Categorize`}
          </Button>
        </Box>
      </Box>

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
        {/* Search Bar */}
        <Box sx={{ 
          px: 2, 
          py: 1.5, 
          borderBottom: '1px solid', 
          borderBottomColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start'
        }}>
          <TextField
            size="small"
            placeholder="Search spans by ID, name, input, or output..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchTerm('')}
                    edge="end"
                    sx={{ mr: -0.5 }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: 400,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.default',
              }
            }}
          />
        </Box>

        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={filteredRootSpans}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            getRowHeight={() => 56}
            paginationMode="client"
            onRowClick={(params) => handleView(params.row)}
            onPaginationModelChange={(model) => {
              setPageSize(model.pageSize);
            }}
            slotProps={{
              filterPanel: {
                sx: {
                  '& .MuiDataGrid-filterForm': {
                    padding: 2,
                  },
                  '& .MuiFormControl-root': {
                    margin: 1,
                  },
                },
              },
            }}
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
                    {annotatedRootSpans.length === 0 
                      ? 'No root spans available' 
                      : 'No spans found'
                    }
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{
                      color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    {annotatedRootSpans.length === 0 
                      ? 'Root spans will appear here once data is loaded'
                      : `No spans match your search "${searchTerm}"`
                    }
                  </Typography>
                </Box>
              )
            }}
            loading={isLoading}
          />
        </Box>
      </Paper>
      <Fragment>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedtext="alert-dialog-description"
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle 
            id="alert-dialog-title"
            sx={{ 
              color: 'error.main',
              fontWeight: 'bold',
              pb: 1
            }}
          >
            Delete Root Span From Batch
          </DialogTitle>
          <DialogContent>
            <DialogContentText 
              id="alert-dialog-description"
              sx={{ fontSize: '1rem', color: 'text.primary' }}
            >
              Are you sure you want to delete this root span from the batch?
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button 
              onClick={handleClose} 
              variant="outlined"
              sx={{ 
                minWidth: '100px',
                borderColor: 'grey.400',
                color: 'text.secondary'
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDelete}
              variant="contained"
              color="error"
              sx={{ 
                minWidth: '100px',
                fontWeight: 'bold'
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Categorization Results Modal */}
        <Dialog
          open={categorizeModalOpen}
          onClose={handleCategorizeModalClose}
          aria-labelledby="categorize-dialog-title"
          aria-describedby="categorize-dialog-description"
          maxWidth="md"
          fullWidth
        >
          <DialogTitle 
            id="categorize-dialog-title"
            sx={{ 
              color: categorizeResults && '__error' in categorizeResults 
                ? 'error.main' 
                : 'primary.main',
              fontWeight: 'bold',
              pb: 1
            }}
          >
            {categorizeResults && '__error' in categorizeResults 
              ? 'Categorization Failed' 
              : 'Categorization Complete'
            }
          </DialogTitle>
          <DialogContent>
            <DialogContentText 
              id="categorize-dialog-description"
              sx={{ fontSize: '1rem', color: 'text.primary', mb: 2 }}
            >
              {categorizeResults && '__error' in categorizeResults
                ? 'An error occurred during categorization:'
                : 'The following categories were identified and applied to your annotations:'
              }
            </DialogContentText>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {categorizeResults && '__error' in categorizeResults ? (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: 'error.light',
                    border: '1px solid',
                    borderColor: 'error.main',
                    width: '100%'
                  }}
                >
                  <Typography variant="body1" sx={{ color: 'error.contrastText', fontWeight: 'medium' }}>
                    {(categorizeResults as any).__error}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'error.contrastText', mt: 1, opacity: 0.9 }}>
                    This could be due to:
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'error.contrastText', mt: 0.5, opacity: 0.9 }}>
                    • AI service temporarily unavailable
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'error.contrastText', opacity: 0.9 }}>
                    • Network connectivity issues
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'error.contrastText', opacity: 0.9 }}>
                    • Invalid batch data
                  </Typography>
                </Box>
              ) : categorizeResults && Object.entries(categorizeResults).length > 0 ? (
                Object.entries(categorizeResults)
                  .sort(([, countA], [, countB]) => countB - countA)
                  .map(([category, count]) => (
                    <Chip
                      key={category}
                      label={`${category} (${count})`}
                      variant="filled"
                      color="primary"
                      sx={{ 
                        fontSize: '0.875rem',
                        height: '32px',
                        fontWeight: 'medium'
                      }}
                    />
                  ))
              ) : (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: 'info.light',
                    border: '1px solid',
                    borderColor: 'info.main',
                    width: '100%'
                  }}
                >
                  <Typography variant="body1" sx={{ color: 'info.contrastText', fontWeight: 'medium' }}>
                    No categories were identified
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'info.contrastText', mt: 1, opacity: 0.9 }}>
                    This may happen if there are no "bad" rated annotations to categorize, or if the annotations don't contain patterns that can be grouped into meaningful categories.
                  </Typography>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            {categorizeResults && '__error' in categorizeResults && (
              <Button 
                onClick={() => {
                  handleCategorizeModalClose();
                  handleCategorize();
                }}
                variant="outlined"
                color="primary"
                sx={{ 
                  minWidth: '100px',
                  fontWeight: 'bold'
                }}
              >
                Try Again
              </Button>
            )}
            <Button 
              onClick={handleCategorizeModalClose} 
              variant="contained"
              color="primary"
              sx={{ 
                minWidth: '100px',
                fontWeight: 'bold'
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Loading Backdrop for Categorization */}
        <Backdrop
          sx={{
            color: '#fff',
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
          }}
          open={isCategorizing}
          onClick={(e) => e.stopPropagation()}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              p: 4,
              borderRadius: 2,
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(40, 40, 40, 0.95)' 
                : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              border: '1px solid',
              borderColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'rgba(0, 0, 0, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              minWidth: 300,
            }}
          >
            <CircularProgress 
              size={60} 
              thickness={4}
              sx={{ 
                color: 'secondary.main',
                mb: 3 
              }} 
            />
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 'bold',
                mb: 1,
                color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#212121'
              }}
            >
              Categorizing Annotations
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.7)' 
                  : 'rgba(0, 0, 0, 0.6)',
                maxWidth: 400,
                lineHeight: 1.5
              }}
            >
              We are analyzing your annotations and creating categories. This may take a few moments...
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.5)' 
                  : 'rgba(0, 0, 0, 0.4)',
                mt: 2,
                fontStyle: 'italic'
              }}
            >
              Please do not navigate away from this page
            </Typography>
          </Box>
        </Backdrop>
      </Fragment>

      {/* Toast Notification - Positioned in nav area */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ 
          top: '192px !important', // Position below the nav area
          zIndex: 9999 // Much higher z-index
        }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}
        >
          {snackbar.message}
        </Alert>
              </Snackbar>
    </Container>
  );
};

export default RootSpans;
