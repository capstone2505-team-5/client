import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
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
import { useTheme } from "../contexts/ThemeContext";
import type { AnnotatedRootSpan } from "../types/types";

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
  onCategorize: () => Promise<void>;
}

const RootSpans = ({ annotatedRootSpans, onLoadRootSpans, onCategorize }: RootSpansProps) => {
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { batchId } = useParams();
  const location = useLocation();
  const { projectName, projectId, batchName } = location.state || {};
  const { isDarkMode } = useTheme();
  const theme = muiUseTheme();

  useEffect(() => {
    if (batchId && annotatedRootSpans.length === 0) {
      onLoadRootSpans(batchId);
    }
  }, [batchId]);

  const handleView = (annotatedRootSpan: AnnotatedRootSpan) => {
    navigate(`rootSpans/${annotatedRootSpan.traceId}`, { state: { projectName, projectId, batchName, batchId: batchId, annotatedRootSpan } });
  };

  const handleDelete = async (rootSpanId: string) => {
    if (window.confirm("Are you sure you want to delete this root span?")) {
      // TODO: Implement delete functionality
      console.log("Delete root span:", rootSpanId);
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
      field: 'annotation?.categories',
      headerName: 'Categories',
      flex: 2,
      minWidth: 250,
      headerAlign: 'left',
      align: 'left',
      sortable: false,
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
              handleDelete(params.row.id);
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
            onClick={() => navigate(`/batches/${batchId}/annotation`, { 
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
            onClick={onCategorize}
            size="large"
            disabled={!allSpansRated}
            sx={{ 
              px: 3,
              minWidth: 225,
              maxHeight: 35,
              borderColor: 'secondary.main',
              color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.99)' : 'rgba(0, 0, 0, 0.6)',
              fontWeight: 600,
              opacity: allSpansRated ? 1 : 0.5,
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
            Categorize ({annotatedRootSpans.filter(span => span.annotation?.rating !== undefined && span.annotation?.rating !== null).length}/{annotatedRootSpans.length})
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
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default RootSpans;
