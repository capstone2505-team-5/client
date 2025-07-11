import { useLocation } from "react-router-dom";
import type { AnnotatedTrace } from "../types/types";
import { Container, Typography, Box } from "@mui/material";

const TraceDetail = () => {
  const location = useLocation();
  const annotatedTrace = location.state as AnnotatedTrace;


  if (!annotatedTrace) {
    return <Box>Loading...</Box>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1">
        Trace ID: {annotatedTrace.traceId}
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
        <p>{annotatedTrace.input}</p>
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
          {annotatedTrace.output}
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
        <Typography variant="h4">Annotation Information</Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box>
            <h2>Note:</h2>
            <p>{annotatedTrace.note || "No note"}</p>
          </Box>
          <Box>
            <h2>Rating:</h2>
            <p>{annotatedTrace.rating || "No rating"}</p>
          </Box>
          <Box>
            <h2>Categories:</h2>
            <p>
              {annotatedTrace.categories.length > 0
                ? annotatedTrace.categories.join(", ")
                : "No categories"}
            </p>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default TraceDetail;
