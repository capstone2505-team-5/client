import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Button,
  IconButton,
  Paper,
  Chip,
  Stack,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from "@mui/icons-material/Delete";
import RateReviewIcon from '@mui/icons-material/RateReview';
import { fetchBatches, deleteBatch } from "../services/services";
import type { Batch } from "../types/types";

interface BatchProps {
  onDeleteBatch: (batchId: string) => void;
}

const Batches = ({ onDeleteBatch }: BatchProps) => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState<Batch[]>([]);
  const location = useLocation();
  const { projectName } = location.state || {};

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchBatches();
        // Add mock categories for now since backend doesn't have them yet
        const batchesWithCategories = data.map(batch => ({
          ...batch,
          categories: ['Quality', 'Performance', 'Accuracy'] // Mock data - backend doesn't have categories yet
        }));
        setBatches(batchesWithCategories);
      } catch (error) {
        console.error("Failed to fetch batches", error);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (batchId: string) => {
    if (window.confirm("Are you sure you want to delete this batch?")) {
      try {
        await deleteBatch(batchId);
        setBatches((prev) => prev.filter((b) => b.id !== batchId));
        onDeleteBatch(batchId);
      } catch (error) {
        console.error("Failed to delete batch", error);
      }
    }
  };

    const handleAnnotate = (batchId: string) => {
    navigate(`/batches/${batchId}/annotation`);
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Batch Name',
      flex: 1.5,
      minWidth: 100,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => (
        <Typography variant="h6" sx={{ fontWeight: 'medium', color: 'primary.main' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'totalSpans',
      headerName: 'Spans',
      flex: 0.75,
      minWidth: 100,
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
      flex: 0.75,
      minWidth: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const batch = params.row as Batch;
        const percent = batch.totalSpans 
          ? Math.round((batch.annotatedCount / batch.totalSpans) * 100)
          : 0;
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
      flex: 0.75,
      minWidth: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const batch = params.row as Batch;
        const percent = batch.annotatedCount
          ? Math.round((batch.goodCount / batch.annotatedCount) * 100)
          : 0;
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
      flex: 2.5,
      minWidth: 200,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, py: 1 }}>
          {(params.value as string[]).map((category, index) => (
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
          ))}
        </Box>
      ),
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
            startIcon={<RateReviewIcon />}
            onClick={(e) => {
              e.stopPropagation();
              handleAnnotate(params.row.id);
            }}
            sx={{ 
              minWidth: '110px', 
              fontSize: '0.8rem', 
              py: 0.75, 
              px: 1.5,
              flex: 1
            }}
          >
            Annotate
          </Button>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/edit-batch/${params.row.id}`);
              }}
              sx={{ 
                border: '1px solid',
                borderColor: 'primary.main',
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
                handleDelete(params.row.id);
              }}
              sx={{ 
                border: '1px solid',
                borderColor: 'error.main',
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
            <Box sx={{
              px: 2,
              py: 0.75,
              backgroundColor: 'primary.main',
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'white',
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
                  color: 'white',
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
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            Batches
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mt: -1 }}>
            Manage and track your evaluation batches
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/create-batch")}
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
            background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)',
            fontSize: '1rem',
            fontWeight: '600',
            color: 'primary.main',
            borderBottom: '2px solid',
            borderBottomColor: 'primary.light',
            borderRadius: '12px 12px 0 0',
          },
          '& .MuiDataGrid-row': {
            minHeight: '80px !important',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: '#f8f9fa',
              transform: 'scale(1.001)',
              transition: 'all 0.2s ease-in-out',
            },
          },
          '& .MuiDataGrid-cell': {
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.95rem',
            borderBottom: '1px solid',
            borderBottomColor: 'divider',
            py: 1,
          },
          '& .MuiDataGrid-footerContainer': {
            background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)',
            borderTop: '1px solid',
            borderTopColor: 'divider',
            minHeight: '56px',
            height: '56px',
            borderRadius: '0 0 12px 12px',
          },
        }}
      >
        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={batches}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            getRowHeight={() => 80}
            onRowClick={(params) => navigate(`/batches/${params.row.id}`)}
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
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    No batches available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create your first batch to get started
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

export default Batches; 