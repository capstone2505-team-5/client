import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Box,
  List,
  ListItem,
} from "@mui/material";
import type { AnnotatedTrace } from "../types/types";

interface tracesProps {
  annotatedTraces: AnnotatedTrace[];
}

const Traces = ({ annotatedTraces }: tracesProps) => {
  const navigate = useNavigate();
  
  const filters = ['Annotated', 'Not Annotated']

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom>
            Traces
          </Typography>
          <Box>
            <Button
              variant="contained"
              onClick={() => navigate("/annotation")}
              sx={{ mr: 2 }}
            >
              Start Annotating!
            </Button>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            gap: 2,
          }}
        >
          <List sx={{ flexGrow: 1, pr: 2, padding: 0, margin: 0 }}>
            {annotatedTraces.map((annotatedTrace) => (
              <ListItem
                key={annotatedTrace.traceId}
                sx={{
                  borderRadius: 2,
                  border: "2px solid",
                  borderColor: "primary.light",
                  "&:hover": { backgroundColor: "grey.200" },
                  py: 1.5,
                  px: 2,
                  mb: 1,
                }}
              >
                Trace: {annotatedTrace.traceId}
              </ListItem>
            ))}
          </List>
          <Box>
            <Box
              sx={{
                borderRadius: 2,
                border: "2px solid",
                borderColor: "primary.light",
                height: "500px",
                width: "300px",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                py: 1.5,
                px: 2,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Typography variant="h4" component="h1" gutterBottom>
                  Filters
                </Typography>
              </Box>
              <List>
                {filters.map((filter) => (
                  <ListItem
                    key={filter}
                    sx={{
                      borderRadius: 2,
                      border: "2px solid",
                      "&:hover": { backgroundColor: "grey.200" },
                      mb: 1,
                    }}
                  >
                    {filter}
                  </ListItem>
                ))}
              </List>
            </Box>
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate("/annotation")}
              sx={{ mr: 2, mt: 2 }}
            >
              Categorize!
            </Button>
            <Box
              sx={{
                borderRadius: 2,
                border: "2px solid",
                borderColor: "primary.light",
                height: "500px",
                width: "300px",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                mt: 2,
                py: 1.5,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Typography variant="h4" component="h1" gutterBottom>
                  Categories
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Traces;
