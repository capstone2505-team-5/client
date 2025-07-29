import { useLocation } from "react-router-dom";
import type { AnnotatedRootSpan } from "../types/types";
import { Container, Typography, Box } from "@mui/material";

const RootSpanDetail = () => {
  const location = useLocation();
  const annotatedRootSpan = location.state as AnnotatedRootSpan;


  if (!annotatedRootSpan) {
    return <Box>Loading...</Box>;
  }

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
