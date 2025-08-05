import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
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
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { DataGrid, getGridDateOperators } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import type { AnnotatedRootSpan, Project } from "../types/types";
import { useRootSpanMutations, useRootSpansByProjectPaginated } from "../hooks/useRootSpans";

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
  const { projectName, batchId } = location.state || {};
  const { projectId } = useParams<{ projectId: string }>();
  const theme = muiUseTheme();
  
  // Get the invalidation functions from the mutations hook
  const { invalidateBatch, invalidateProject } = useRootSpanMutations();

  // Use the pagination hook directly for server-side pagination
  const { data: paginatedData, isLoading, error, isFetching } = useRootSpansByProjectPaginated(
    projectId || null,
    paginationModel.page,
    paginationModel.pageSize
  );

  // Stabilize data - don't show empty data during loading if we're just fetching a new page
  const annotatedRootSpans = paginatedData?.rootSpans || [];
  const totalCount = paginatedData?.totalCount || 0;
  
  // Use the loading state to prevent DataGrid resets, but don't show completely empty data
  const stableLoading = isLoading && !paginatedData; // Only show loading if we have no data at all

  // Server handles filtering and pagination, so we use the data directly
  const displayedSpans = annotatedRootSpans;
  

  
  // Debug logging
  useEffect(() => {
    const startItem = paginationModel.page * paginationModel.pageSize + 1;
    const endItem = Math.min((paginationModel.page + 1) * paginationModel.pageSize, totalCount);
    const pageInfo = `${startItem}-${endItem} of ${totalCount}`;
    
    console.log('📊 CreateBatch data updated:', {
      annotatedRootSpansCount: annotatedRootSpans.length,
      totalCount,
      paginationModel,
      displayedSpansCount: displayedSpans.length,
      pageInfo,
      isLoading,
      isFetching,
      stableLoading,
      firstSpanId: annotatedRootSpans[0]?.id || 'none',
      lastSpanId: annotatedRootSpans[annotatedRootSpans.length - 1]?.id || 'none',
      paginatedDataExists: !!paginatedData
    });
  }, [annotatedRootSpans, totalCount, paginationModel, displayedSpans, isLoading, isFetching, stableLoading, paginatedData]);



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

  const handlePageChange = useCallback((newPage: number) => {
    console.log('📄 Page changing:', {
      from: paginationModel.page,
      to: newPage,
      selectedSpansCount: selectedSet.size,
      selectedSpanIds: Array.from(selectedSet).slice(0, 5), // Show first 5 for debugging
      timestamp: new Date().toISOString()
    });
    
    if (newPage < 0) {
      console.warn('⚠️ Prevented negative page:', newPage);
      return;
    }
    
    setPaginationModel(prev => ({ ...prev, page: newPage }));
  }, [paginationModel.page, selectedSet]);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    console.log('📄 Page size changing:', {
      from: paginationModel.pageSize,
      to: newPageSize,
      resetToPage: 0
    });
    
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
      
      console.log('🔄 Individual selection changed:', {
        spanId,
        isSelected,
        newTotal: newSelected.size
      });
      
      return newSelected;
    });
  }, []);

  // Handle select all for current page
  const handleSelectAllCurrentPage = useCallback(() => {
    const currentPageIds = displayedSpans.map(span => span.id);
    const currentPageIdsSet = new Set(currentPageIds);
    const selectedOnCurrentPage = currentPageIds.filter(id => selectedSet.has(id));
    const shouldSelectAll = selectedOnCurrentPage.length < currentPageIds.length;
    
    setSelectedSet(prevSelected => {
      const newSelected = new Set(prevSelected);
      
      if (shouldSelectAll) {
        // Select all on current page
        currentPageIds.forEach(id => newSelected.add(id));
        console.log('📋 Select All current page triggered');
      } else {
        // Deselect all on current page
        currentPageIds.forEach(id => newSelected.delete(id));
        console.log('📋 Deselect All current page triggered');
      }
      
      console.log('🔄 Select All updated:', {
        currentPageIds: currentPageIds.length,
        shouldSelectAll,
        previousTotal: prevSelected.size,
        newTotal: newSelected.size
      });
      
      return newSelected;
    });
  }, [displayedSpans, selectedSet]);



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
  const currentPageIds = displayedSpans.map(span => span.id);
  const selectedOnCurrentPage = currentPageIds.filter(id => selectedSet.has(id));
  const isAllCurrentPageSelected = selectedOnCurrentPage.length === currentPageIds.length && currentPageIds.length > 0;
  const isSomeCurrentPageSelected = selectedOnCurrentPage.length > 0 && selectedOnCurrentPage.length < currentPageIds.length;

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
      field: 'spanName',
      headerName: 'Name',
      flex: 1,
      minWidth: 200,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => (
        <Typography variant="body1" sx={{ color: 'white' }}>
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
        <Typography variant="body2" sx={{ color: 'white' }}>
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
            color: 'white',
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
            color: 'white',
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
          label="Batch Name"
          value={name}
          onChange={handleNameChange}
          sx={{ minWidth: 300 }}
          size="medium"
        />
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
        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={displayedSpans}
            columns={columns}
            hideFooter
            getRowHeight={() => 56}
            getRowClassName={(params) => 
              selectedSet.has(params.row.id) ? 'Mui-selected' : ''
            }
            onRowClick={(params) => {
              // Toggle selection when row is clicked
              const isCurrentlySelected = selectedSet.has(params.row.id);
              handleRowSelectionChange(params.row.id, !isCurrentlySelected);
            }}
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
                {displayedSpans.length > 0 && totalCount > 0
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
    </Container>
  );
};

export default CreateBatch; 