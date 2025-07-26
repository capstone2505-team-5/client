// src/components/Home.tsx
import { useState, useMemo } from "react";
import { Container, Typography, Box, Paper, TextField, InputAdornment, IconButton } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { DataGrid, getGridDateOperators } from "@mui/x-data-grid";
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
  const [searchTerm, setSearchTerm] = useState('');

  const handleProjectClick = (projectName: string) => {
    navigate('/queues');
  };

  // Filter projects based on search term
  const filteredProjects = useMemo(() => {
    if (!searchTerm.trim()) return projects;
    
    return projects.filter(project =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);

  // Calculate dynamic height based on page size
  const getDataGridHeight = () => {
    const headerHeight = 56;
    const footerHeight = 56;
    const rowHeight = 56;
    const padding = 20;
    
    if (pageSize <= 5) {
      return headerHeight + (5 * rowHeight) + footerHeight + padding; // ~412px (compact)
    } else {
      // Same medium size for 10 and 25 rows
      return headerHeight + (8 * rowHeight) + footerHeight + padding; // ~524px (slightly reduced from 8 to 7)
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
      filterOperators: getGridDateOperators().filter((operator) =>
        ['is', 'after', 'onOrAfter', 'before', 'onOrBefore'].includes(operator.value)
      ),
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
    <Container maxWidth="lg" sx={{ mt: 1.5, mb: 1.5 }}>
      <Box sx={{ mb: 1.5, textAlign: 'center' }}>
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
          Select a project to begin evaluating your LLM application
        </Typography>
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
        {/* Search Bar */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderBottomColor: 'divider' }}>
          <TextField
            size="small"
            placeholder="Search projects..."
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
              minWidth: 300,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.default',
              }
            }}
          />
        </Box>

        <Box sx={{ height: getDataGridHeight() }}>
                    <DataGrid
            rows={filteredProjects}
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
                    {projects.length === 0 
                      ? 'No projects available' 
                      : 'No projects found'
                    }
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {projects.length === 0 
                      ? 'Projects will appear here once data is loaded'
                      : `No projects match your search "${searchTerm}"`
                    }
                  </Typography>
                </Box>
              )
            }}
            sx={{
              '& .MuiDataGrid-virtualScroller': {
                minHeight: '300px',
              },
            }}
          />
        </Box>
      </Paper>


    </Container>
  );
};

export default Projects;