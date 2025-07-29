import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Chip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import RateReviewIcon from '@mui/icons-material/RateReview';
import type { AnnotatedRootSpan } from "../types/types";

interface RootSpansProps {
  annotatedRootSpans: AnnotatedRootSpan[];
  onCategorize: () => Promise<void>;
}

const RootSpans = ({ annotatedRootSpans, onCategorize }: RootSpansProps) => {
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { batchName } = location.state || {};



  const handleView = (annotatedRootSpan: AnnotatedRootSpan) => {
    navigate(`/rootSpans/${annotatedRootSpan.traceId}`, { state: annotatedRootSpan });
  };

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
      field: 'startTime',
      headerName: 'Date',
      flex: 1.2,
      minWidth: 180,
      headerAlign: 'center',
      align: 'center',
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
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, py: 1 }}>
          {(params.value as string[]).length > 0 ? (
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
  ];

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
        {/* Project and Batch Name Boxes - Far Left */}
        <Box sx={{ 
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          {/* Project Name Box */}
          {annotatedRootSpans.length > 0 && annotatedRootSpans[0].projectName && (
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
                {annotatedRootSpans[0].projectName}
              </Typography>
            </Box>
          )}
        </Box>

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
            {batchName} ({annotatedRootSpans.length})
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mt: -1 }}>
            Review and annotate individual spans from your batch
          </Typography>
        </Box>
      </Box>

      {/* Start Annotating Button - Right Justified */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<RateReviewIcon />}
          onClick={() => navigate(`/batches/${id}/annotation`)}
          size="large"
          sx={{ px: 3 }}
        >
          Start Annotating!
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
            minHeight: '56px !important',
            cursor: 'pointer',
            backgroundColor: '#1a1a1a',
            '&:nth-of-type(even)': {
              backgroundColor: '#2a2a2a',
            },
            '&:hover': {
              backgroundColor: '#3a3a3a !important',
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
        <Box sx={{ height: getDataGridHeight() }}>
          <DataGrid
            rows={annotatedRootSpans}
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
                    No root spans available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Root spans will appear here once data is loaded
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
