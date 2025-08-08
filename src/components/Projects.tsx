// src/components/Projects.tsx
import { useState, useMemo, Fragment } from "react";
import { Container, Typography, Box, Paper, TextField, InputAdornment, IconButton, Button, useTheme } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { DataGrid, getGridDateOperators } from "@mui/x-data-grid";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import type { GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { getPhoenixDashboardUrl, fetchProjects } from "../services/services";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const Projects = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);

  const {
    data: projects = [],
    isLoading: projectsLoading,
    error: projectsError,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const {
    data: phoenixDashboardUrl = '',
  } = useQuery({
    queryKey: ['phoenixDashboardUrl'],
    queryFn: getPhoenixDashboardUrl,
    staleTime: Infinity
  })

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleProjectClick = (projectId: string, projectName: string) => {
    console.log('projectId', projectId);
    navigate(`/projects/${projectId}`, { state: { projectId, projectName } });
  };

  // Filter projects based on search term
  const filteredProjects = useMemo(() => {
    if (!projects || !searchTerm.trim()) return projects || [];
    
    return projects.filter(project =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);

  // Calculate dynamic height based on rows per page in data grid
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
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'medium', 
            color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#212121'
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'updatedAt',
      headerName: 'Last Updated At',
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
      field: 'validRootSpanCount',
      headerName: 'Root Spans',
      flex: 1,
      minWidth: 120,
      headerAlign: 'center',
      align: 'center',
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body1" sx={{ color: 'text.primary' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'numBatches',
      headerName: 'Batches',
      flex: 1,
      minWidth: 120,
      headerAlign: 'center',
      align: 'center',
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body1" sx={{ color: 'text.primary' }}>
          {params.value}
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
            color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#212121',
            mb: 2
          }}
        >
          Your Phoenix Projects
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            mt: -1,
            color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)'
          }}
        >
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
        {/* Search Bar */}
        <Box sx={{ 
          px: 2, 
          py: 1.5, 
          borderBottom: '1px solid', 
          borderBottomColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
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
          
          <Button
            variant="outlined"
            startIcon={<AddIcon sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.99)' : 'rgba(0, 0, 0, 0.6)' }} />}
            size="small"
            onClick={handleClickOpen}
            sx={{
              whiteSpace: 'nowrap',
              ml: 2,
              borderColor: 'secondary.main',
              color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.99)' : 'rgba(0, 0, 0, 0.6)',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'secondary.dark',
              },
            }}
          >
            Create New Project
          </Button>
        </Box>

      <Fragment>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle 
            id="alert-dialog-title"
            sx={{ 
              color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.99)' : 'rgba(0, 0, 0, 0.6)',
              fontWeight: 'bold',
              fontSize: '1.5rem',
              pb: 1,
              textAlign: 'center'
            }}
          >
            Create New Project
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
                         <DialogContentText 
               id="alert-dialog-description"
               sx={{ 
                 fontSize: '1rem', 
                 color: 'text.primary',
                 textAlign: 'center',
                 lineHeight: 1.6,
                 mb: 2
               }}
             >
               To create a new project, you'll need to add tracing to your application.
             </DialogContentText>
                         <Box sx={{ 
               backgroundColor: theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.1)' : 'rgba(33, 150, 243, 0.05)',
               borderRadius: 2,
               p: 2,
               border: '1px solid',
               borderColor: theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.3)' : 'rgba(33, 150, 243, 0.2)'
             }}>
               <Typography variant="body2" sx={{ color: 'text.primary', mb: 1, textAlign: 'center' }}>
                 Access your Phoenix Dashboard and follow the instructions from the "Trace" button in the top right corner of the Phoenix UI to get started.
               </Typography>
               <Typography 
                 variant="body2" 
                 sx={{ 
                   color: 'text.secondary', 
                   textAlign: 'center', 
                   fontStyle: 'italic',
                   my: 1 
                 }}
               >
                 — or —
               </Typography>
               <Typography variant="body2" sx={{ color: 'text.primary', textAlign: 'center' }}>
                 Reference the Phoenix documentation for more information.
               </Typography>
             </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1, justifyContent: 'center' }}>
            <Button 
              component="a"
              href={phoenixDashboardUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={handleClose}
              variant="outlined"
              size="small"
              sx={{ 
                minWidth: '120px',
                borderColor: 'secondary.main',
                color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.99)' : 'rgba(0, 0, 0, 0.6)',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'secondary.dark',
                },
              }}
            >
              Dashboard
            </Button>
            <Button 
              component="a"
              href="https://arize.com/docs/phoenix/integrations" 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={handleClose}
              variant="outlined"
              size="small"
              sx={{ 
                minWidth: '120px',
                borderColor: 'secondary.main',
                color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.99)' : 'rgba(0, 0, 0, 0.6)',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'secondary.dark',
                },
              }}
            >
              Documentation
            </Button>
            <Button 
              onClick={handleClose} 
              variant="outlined"
              size="small"
              sx={{ 
                minWidth: '100px',
                borderColor: 'secondary.main',
                color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.99)' : 'rgba(0, 0, 0, 0.6)',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'secondary.dark',
                },
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Fragment>

        <Box sx={{ height: getDataGridHeight() }}>
                    <DataGrid
            rows={filteredProjects}
            columns={columns}
            loading={projectsLoading}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            getRowHeight={() => 56}
            onRowClick={(params) => handleProjectClick(params.row.id, params.row.name)}
            onPaginationModelChange={(model) => {
              setPageSize(model.pageSize);
            }}
            slots={{
              noRowsOverlay: () => {
                // Show error state if there's an error
                if (projectsError) {
                  return (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '100%',
                      py: 4,
                      px: 2
                    }}>
                      <ErrorOutlineIcon 
                        sx={{ 
                          fontSize: '3rem', 
                          color: 'error.main',
                          mb: 2
                        }} 
                      />
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          mb: 1,
                          color: 'error.main',
                          textAlign: 'center'
                        }}
                      >
                        Failed to load projects
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{
                          color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                          textAlign: 'center',
                          mb: 3,
                          maxWidth: '400px'
                        }}
                      >
                        {projectsError instanceof Error 
                          ? projectsError.message 
                          : 'An unexpected error occurred while loading projects'}
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<RefreshIcon />}
                        onClick={() => queryClient.invalidateQueries({ queryKey: ['projects'] })}
                        sx={{
                          backgroundColor: 'error.main',
                          '&:hover': {
                            backgroundColor: 'error.dark',
                          }
                        }}
                      >
                        Retry
                      </Button>
                    </Box>
                  );
                }

                // Show no data state
                return (
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
                      {(projects?.length || 0) === 0 
                        ? 'No projects available' 
                        : 'No projects found'
                      }
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{
                        color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)'
                      }}
                    >
                      {(projects?.length || 0) === 0 
                        ? 'Projects will appear here once data is loaded'
                        : `No projects match your search "${searchTerm}"`
                      }
                    </Typography>
                  </Box>
                );
              }
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