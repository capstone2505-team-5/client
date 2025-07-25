// src/components/Home.tsx
import { Container, Typography, Box, Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

export interface Project {
  id: string;
  name: string;
  rootSpans: number;
  groups: number;
  datasets: number;
  dateModified: string;
}

interface HomeProps {
  projects?: Project[];
}

const Home = ({ projects = [] }: HomeProps) => {
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
      field: 'groups',
      headerName: 'Groups',
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
      field: 'datasets',
      headerName: 'Datasets',
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
          Projects
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Monitor and analyze your LLM application projects
        </Typography>
      </Box>

      <Paper 
        elevation={3}
        sx={{ 
          height: 650, 
          width: '100%',
          '& .MuiDataGrid-root': {
            border: 'none',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f5f5f5',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: 'primary.main',
            borderBottom: '2px solid #e0e0e0',
          },
          '& .MuiDataGrid-row': {
            minHeight: '80px !important',
            '&:hover': {
              backgroundColor: '#f8f9fa',
            },
          },
          '& .MuiDataGrid-cell': {
            display: 'flex',
            alignItems: 'center',
            fontSize: '1rem',
            borderBottom: '1px solid #e0e0e0',
          },
          '& .MuiDataGrid-footerContainer': {
            backgroundColor: '#f5f5f5',
            borderTop: '2px solid #e0e0e0',
            minHeight: '56px',
            height: '56px',
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
          getRowHeight={() => 80}
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

export default Home;