import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchTrace, fetchAnnotation } from "../services/services";
import type { AnnotatedTrace } from "../types/types";
import { Container, Typography, Box } from "@mui/material";

const TraceDetail = () => {
  const [traceDetails, setTraceDetails] = useState<AnnotatedTrace | null>(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const trace = await fetchTrace(id);

        let annotation
        try {
          annotation = await fetchAnnotation(id);
        } catch (error) {
          console.warn("Annotation not found", error)
        }

        setTraceDetails({
          traceId: trace.id,
          input: trace.input,
          output: trace.output,
          note: annotation?.note ?? "",
          rating: annotation?.rating ?? "",
          categories: annotation?.categories ?? [],
        });
      } catch (error) {
        console.error("Error fetching specified trace", error);
      }
    };

    fetchData();
  }, [id]);

  if (!traceDetails) {
    return <Box>Loading...</Box>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1">
        Trace ID: {traceDetails.traceId}
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
        <p>{traceDetails.input}</p>
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
          {traceDetails.output}
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
            <p>{traceDetails.note || "No note"}</p>
          </Box>
          <Box>
            <h2>Rating:</h2>
            <p>{traceDetails.rating || "No rating"}</p>
          </Box>
          <Box>
            <h2>Categories:</h2>
            <p>
              {traceDetails.categories.length > 0
                ? traceDetails.categories.join(", ")
                : "No categories"}
            </p>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default TraceDetail;
