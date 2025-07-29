import React from "react";
import { useLocation } from "react-router-dom";
import { Container, Typography, Box, Paper, Chip, Button, useTheme as muiUseTheme } from "@mui/material";
import { useTheme } from "../contexts/ThemeContext";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { AnnotatedRootSpan } from "../types/types";

const RootSpanDetail = () => {
  const location = useLocation();
  const annotatedRootSpan = location.state as AnnotatedRootSpan;
  const { isDarkMode } = useTheme();
  const theme = muiUseTheme();

  if (!annotatedRootSpan) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography variant="h5" color="text.secondary">Loading...</Typography>
        </Box>
      </Container>
    );
  }

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'good':
        return <CheckCircleIcon sx={{ color: 'success.main', fontSize: '1.5rem' }} />;
      case 'bad':
        return <CancelIcon sx={{ color: 'error.main', fontSize: '1.5rem' }} />;
      default:
        return <CheckCircleOutlineIcon sx={{ color: 'text.disabled', fontSize: '1.5rem' }} />;
    }
  };

  const getRatingLabel = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'Good';
      case 'bad':
        return 'Bad';
      default:
        return 'Not Rated';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1">
        Root Span ID: {annotatedRootSpan.id}
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          borderRadius: 2,
          border: "2px solid",
          borderColor: "primary.light",
          mb: 1,
        }}
      >
        <Typography variant="h5" component="h2" sx={{ mr: 1 }}>
          Input:
        </Typography>
        <p>{annotatedRootSpan.input}</p>
      </Box>
      <Box
        sx={{
          borderRadius: 2,
          border: "2px solid",
          borderColor: "primary.light",
          height: "400px",
          overflow: "auto",
          mb: 1,
        }}
      >
        <Typography variant="h5" component="h2" sx={{ mr: 1 }}>
          Output:
        </Typography>
        <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
          {annotatedRootSpan.output}
        </pre>
      </Box>
      <Box
        sx={{
          mb: 1,
          borderRadius: 2,
          border: "2px solid",
          borderColor: "primary.light",
        }}
      >
        <h3>Annotation Details</h3>
        <p>{annotatedRootSpan.annotation?.note || "No note"}</p>
        <p>Rating: {annotatedRootSpan.annotation?.rating || "No rating"}</p>
        
        <h3>Categories</h3>
        <p>
          {annotatedRootSpan.annotation?.categories && annotatedRootSpan.annotation.categories.length > 0
            ? annotatedRootSpan.annotation.categories.join(", ")
            : "No categories"}
        </p>
      </Box>
    </Container>
  );
};

export default RootSpanDetail;
