import { useState, Fragment } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Button,
  IconButton,
  Paper,
  Chip,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import AddIcon from "@mui/icons-material/Add";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from "@mui/icons-material/Delete";
import RateReviewIcon from '@mui/icons-material/RateReview';
import { fetchBatches, deleteBatch, fetchRootSpansByBatch } from "../services/services";
import type { Batch } from "../types/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Snackbar from '@mui/material/Snackbar';

const Batches = () => {
  const navigate = useNavigate();
  // const [batches, setBatches] = useState<Batch[]>([]);
  const [open, setOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<string | null>(null);
  const [annotatingBatchId, setAnnotatingBatchId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const location = useLocation();
  const { projectName, batchName } = location.state || {};
  const { projectId, batchId } = useParams();
  const theme = useTheme();

  const handleClose = () => {
    setOpen(false);
    setBatchToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (batchToDelete) {
      await handleDelete(batchToDelete);
      handleClose();
    }
  };

  const {
    data: batches = [],
    isLoading: batchesLoading,
    error: batchesError,
  } = useQuery({
    queryKey: ['batches', projectId],
    queryFn: () => fetchBatches(projectId!),
    enabled: !!projectId, // Only run query if projectId exists
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const queryClient = useQueryClient();
  
  const handleDelete = async (batchId: string) => {
    try {
      await deleteBatch(batchId);
      // Invalidate batches query to refetch data
      queryClient.invalidateQueries({ queryKey: ['batches', projectId] });
      // Invalidate project queries since deleted batch spans are now available for new batches
      queryClient.invalidateQueries({ queryKey: ['rootSpans', 'project', projectId] });
      // Note: Don't invalidate the deleted batch's query - it would cause 404 errors
    } catch (error) {
      console.error("Failed to delete batch", error);
    }
  };

  const handleAnnotate = async (batchId: string, batchName: string) => {
    setAnnotatingBatchId(batchId);
    try {
      // Fetch the root spans for this batch to get the first one's ID
      const batchData = await queryClient.fetchQuery({
        queryKey: ['rootSpansByBatch', batchId],
        queryFn: () => fetchRootSpansByBatch(batchId),
      });

      if (!batchData.rootSpans || batchData.rootSpans.length === 0) {
        setSnackbar({ open: true, message: "No spans in this batch to grade." });
        return;
      }

      // Navigate to the annotation page with the first root span's ID
      navigate(`/projects/${projectId}/batches/${batchId}/annotation/${batchData.rootSpans[0].id}`, {
        state: { projectName, batchName: batchName, projectId }
      });
    } catch (error) {
      console.error("Failed to fetch root spans for batch:", error);
      setSnackbar({ open: true, message: "Error fetching batch details. Please try again." });
    } finally {
      setAnnotatingBatchId(null);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Batch Name',
      flex: 1,
      minWidth: 120,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => (
        <Typography variant="h6" sx={{ fontWeight: 'medium', color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#212121' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'validRootSpanCount',
      headerName: 'Spans',
      flex: 0.5,
      minWidth: 80,
      headerAlign: 'center',
      align: 'center',
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body1" sx={{ color: 'text.primary' }}>
          {params.value.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'annotatedPercent',
      headerName: 'Annotated',
      flex: 0.5,
      minWidth: 90,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const batch = params.row as Batch;
        const percent = Math.round(batch.percentAnnotated || 0);
        return (
          <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 'medium' }}>
            {percent}%
          </Typography>
        );
      },
    },
    {
      field: 'gradePercent',
      headerName: 'Grade',
      flex: 0.5,
      minWidth: 80,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const batch = params.row as Batch;
        const percent = Math.round(batch.percentGood || 0);
        return (
          <Typography 
            variant="body1" 
            sx={{ 
              color: percent >= 80 ? 'success.main' : percent >= 60 ? 'warning.main' : 'error.main',
              fontWeight: 'medium'
            }}
          >
            {percent}%
          </Typography>
        );
      },
    },
    {
      field: 'categories',
      headerName: 'Categories',
      flex: 3.5,
      minWidth: 300,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => {
        const categories = params.value as Record<string, number>;
        const categoryEntries = Object.entries(categories || {});
        
        // Sort by count (highest to lowest)
        const sortedCategories = categoryEntries.sort(([, countA], [, countB]) => countB - countA);
        
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, py: 1 }}>
            {sortedCategories.length > 0 ? sortedCategories.map(([category, count], index) => (
              <Chip
                key={index}
                label={`${category} (${count})`}
                size="small"
                variant="outlined"
                sx={{ 
                  fontSize: '0.75rem',
                  height: '24px',
                  '& .MuiChip-label': { px: 1 }
                }}
              />
            )) : <Typography variant="body1" sx={{ color: 'text.primary', fontStyle: 'italic' }}>No categories</Typography>}
          </Box>
        );
      },
    },
    {
      field: 'actions',
      headerName: '',
      width: 200,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1, py: 0.5 }}>
          <Button
            size="medium"
            variant="outlined"
            startIcon={annotatingBatchId === params.row.id ? <CircularProgress size={20} color="inherit" /> : <RateReviewIcon />}
            disabled={annotatingBatchId === params.row.id}
            onClick={(e) => {
              e.stopPropagation();
              handleAnnotate(params.row.id, params.row.name);
            }}
            sx={{ 
              minWidth: '110px', 
              color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.99)' : 'rgba(0, 0, 0, 0.6)',
              borderColor: 'secondary.main',
              fontSize: '0.8rem',
              py: 0.75, 
              px: 1.5,
              flex: 1,
              '&:hover': {
                borderColor: 'secondary.dark',
                backgroundColor: 'rgba(255, 235, 59, 0.1)',
              }
            }}
          >
            {annotatingBatchId === params.row.id ? 'Checking...' : 'Grade Batch'}
          </Button>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/projects/${projectId}/batches/${params.row.id}/edit`, {
                  state: { projectName, projectId, batchName: params.row.name }
                });
              }}
              sx={{ 
                border: '1px solid',
                borderColor: 'grey.500',
                '&:hover': { backgroundColor: 'primary.light' },
                width: 32,
                height: 32,
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                setBatchToDelete(params.row.id);
                setOpen(true);
              }}
              sx={{ 
                border: '1px solid',
                borderColor: 'grey.500',
                '&:hover': { backgroundColor: 'error.light' },
                width: 32,
                height: 32,
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 1.5, mb: 1.5 }}>
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
            gap: 1
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 'bold',
                color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#212121',
              }}
            >
              Batches
            </Typography>
            <Chip
              label={batches.length}
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
            Manage and track your evaluation batches
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon sx={{ color: 'black !important' }} />}
          onClick={() => navigate(`/projects/${projectId}/batches/create`, { 
            state: { projectName, projectId, batchId, batchName } 
          })}
          sx={{
            backgroundColor: 'secondary.main',
            color: 'black',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: 'secondary.dark',
            },
          }}
        >
          Create New Batch
        </Button>
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
            color: theme.palette.text.primary,
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
          '& .MuiSvgIcon-root': {
            color: theme.palette.text.primary,
          },
        }}
      >
        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={batches}
            columns={columns}
            loading={batchesLoading}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            getRowHeight={() => 80}
            onRowClick={(params) => navigate(`/projects/${projectId}/batches/${params.row.id}`, { state: { projectName, projectId, batchName: params.row.name } })}
            slots={{
              noRowsOverlay: () => (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  py: 4,
                  px: 2
                }}>
                  {batchesError ? (
                    <>
                      <Typography variant="h6" sx={{ mb: 1, color: 'error.main' }}>
                        Error loading batches
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                        {batchesError instanceof Error ? batchesError.message : 'An unexpected error occurred.'}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        No batches available
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Create your first batch to get started
                      </Typography>
                    </>
                  )}
                </Box>
              )
            }}
          />
        </Box>
      </Paper>
       <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
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
            Delete Batch
          </DialogTitle>
          <DialogContent>
            <DialogContentText 
              id="alert-dialog-description"
              sx={{ fontSize: '1rem', color: 'text.primary' }}
            >
              Are you sure you want to delete this batch? This action cannot be undone.
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
      </Fragment>
    </Container>
  );
};

export default Batches; 