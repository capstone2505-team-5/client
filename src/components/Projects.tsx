// src/components/Home.tsx
import { useState } from "react";
import { Container, Typography, Box, Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";

export interface Project {
  id: string;
  name: string;
  rootSpans: number;
  batches: number;
  dateModified: string;
}

interface HomeProps {
  projects?: Project[];
}

const Projects = ({ projects = [] }: HomeProps) => {
  const navigate = useNavigate();
  const [pageSize, setPageSize] = useState(10);

  const handleProjectClick = (projectName: string) => {
    navigate('/queues');
  };

  // Calculate dynamic height based on page size
  const getDataGridHeight = () => {
    const headerHeight = 56;
    const footerHeight = 56;
    const rowHeight = 56;
    const padding = 20;
    
    if (pageSize <= 5) {
      return headerHeight + (5 * rowHeight) + footerHeight + padding; // ~412px
    } else if (pageSize <= 10) {
      return headerHeight + (10 * rowHeight) + footerHeight + padding; // ~692px
    } else {
      return 650; // Fixed height for larger page sizes with scrollbar
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Project Name',
      flex: 2,
      minWidth: 200,
      headerAlign: 'center',
      align: 'left',
      renderCell: (params) => (
        <Typography variant="h6" sx={{ fontWeight: 'medium', color: 'primary.main' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'dateModified',
      headerName: 'Date Modified',
      flex: 1.5,
      minWidth: 150,
      headerAlign: 'center',
      align: 'center',
      type: 'date',
      valueGetter: (value) => new Date(value),
      renderCell: (params) => (
        <Typography variant="body1" sx={{ color: 'text.primary' }}>
          {params.value.toLocaleString('en-US', {
            month: 'numeric',
            day: 'numeric', 
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })}
        </Typography>
      ),
    },
    {
      field: 'rootSpans',
      headerName: 'Root Spans',
      flex: 1,
      minWidth: 120,
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
      field: 'batches',
      headerName: 'Batches',
      flex: 1,
      minWidth: 120,
      headerAlign: 'center',
      align: 'center',
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body1" sx={{ color: 'text.primary' }}>
          {params.value.toLocaleString()}
        </Typography>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
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
          Your Phoenix Projects
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mt: -1 }}>
          Select a project to begin creating batches and annotations
        </Typography>
      </Box>

      <Paper 
        elevation={0}
        sx={{ 
          height: getDataGridHeight(), 
          width: '100%',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
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
          '& .MuiTablePagination-root': {
            overflow: 'visible',
          },
          '& .MuiTablePagination-toolbar': {
            minHeight: '56px',
            height: '56px',
          },
        }}
      >
        <DataGrid
          rows={projects}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
          getRowHeight={() => 56}
          onRowClick={(params) => handleProjectClick(params.row.name)}
          onPaginationModelChange={(model) => {
            setPageSize(model.pageSize);
          }}
          sx={{
            '& .MuiDataGrid-virtualScroller': {
              minHeight: '300px',
            },
          }}
        />
      </Paper>

      {projects.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No projects available
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Projects will appear here once data is loaded
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Projects;