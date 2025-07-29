import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  List,
  ListItem,
} from "@mui/material";
import { IconButton } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import type { AnnotatedRootSpan } from "../types/types";

interface RootSpansProps {
  annotatedRootSpans: AnnotatedRootSpan[];
  onCategorize: () => Promise<void>;
}

interface category {
  name: string;
  count: number;
}

const RootSpans = ({ annotatedRootSpans, onCategorize }: RootSpansProps) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [categories, setCategories] = useState<category[] | null>(null);
  const [filteredAnnotatedRootSpans, setFilteredAnnotatedRootSpans] = useState<
    AnnotatedRootSpan[]
  >([]);
  const navigate = useNavigate();
  const { id } = useParams();

  // Extract categories for the filter
  useEffect(() => {
    const allCategories = new Set<string>();
    annotatedRootSpans.forEach((rootSpan) => {
      rootSpan.annotation?.categories?.forEach((category) => {
        allCategories.add(category);
      });
    });
    setCategories(Array.from(allCategories).map(name => ({ name, count: 0 }))); // Initialize counts to 0
  }, [annotatedRootSpans]);

  // Filter logic
  const filteredRootSpans = useMemo(() => {
    return annotatedRootSpans.filter((rootSpan) => {
      // Search filter
      if (activeFilters.includes("Search")) {
        const searchTerm = activeFilters.find(f => f === "Search");
        if (searchTerm) {
          const lowerSearchTerm = searchTerm.toLowerCase();
          const matchesInput = rootSpan.input.toLowerCase().includes(lowerSearchTerm);
          const matchesOutput = rootSpan.output.toLowerCase().includes(lowerSearchTerm);
          const matchesId = rootSpan.id.toLowerCase().includes(lowerSearchTerm);
          if (!matchesInput && !matchesOutput && !matchesId) {
            return false;
          }
        }
      }

      // Annotation filter
      let passesAnnotationFilter = true;
      if (activeFilters.includes("Annotated") && activeFilters.length === 1) {
        passesAnnotationFilter = rootSpan.annotation?.note !== "";
      } else if (activeFilters.includes("Not Annotated") && activeFilters.length === 1) {
        passesAnnotationFilter = !rootSpan.annotation || rootSpan.annotation.note === "";
      }

      // Category filter
      let passesCategoryFilter = true;
      if (activeFilters.length > 1) { // Only apply category filter if there are other filters
        const categoryFilter = activeFilters.find(f => f !== "Annotated" && f !== "Not Annotated" && f !== "Search");
        if (categoryFilter) {
          passesCategoryFilter = rootSpan.annotation?.categories?.includes(categoryFilter) || false;
        }
      }

      return passesAnnotationFilter && passesCategoryFilter;
    });
  }, [annotatedRootSpans, activeFilters]);

  useEffect(() => {
    setFilteredAnnotatedRootSpans(filteredRootSpans);
  }, [filteredRootSpans]);

  const handleView = (annotatedRootSpan: AnnotatedRootSpan) => {
    navigate(`/rootSpans/${annotatedRootSpan.traceId}`, { state: annotatedRootSpan });
  };

  const handleFilter = (filter: string) => {
    if (filter === "Annotated" || filter === "Not Annotated") {
      if (filter === "Annotated" && activeFilters.includes("Not Annotated")) {
        setActiveFilters((prev) => {
          const filtered = prev.filter((f) => f !== "Not Annotated");
          return [...filtered, "Annotated"];
        });
      } else if (
        filter === "Not Annotated" &&
        activeFilters.includes("Annotated")
      ) {
        setActiveFilters(["Not Annotated"]);
      }

      if (activeFilters.includes(filter)) {
        setActiveFilters((prev) => prev.filter((f) => f !== filter));
      } else {
        setActiveFilters((prev) => [...prev, filter]);
      }
    } else {
      if (activeFilters.includes(filter)) {
        setActiveFilters((prev) => prev.filter((f) => f !== filter));
      } else {
        setActiveFilters((prev) => {
          const filtered = prev.filter((p) => p === "Not Annotated");
          return [...filtered, filter, "Annotated"];
        });
      }
    }
  };

  const filtersCategories = ["Annotated", "Not Annotated"];

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
            Root Spans - {filteredAnnotatedRootSpans.length}
          </Typography>
          <Box>
            <Button
              variant="contained"
              onClick={() => navigate(`/batches/${id}/annotation`)}
              sx={{ width: "280px", mr: 2 }}
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
            {filteredAnnotatedRootSpans.map((annotatedRootSpan) => (
              <Box
                key={annotatedRootSpan.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                }}
              >
                <ListItem
                  key={annotatedRootSpan.id}
                  onClick={() => handleView(annotatedRootSpan)}
                  sx={{
                    borderRadius: 2,
                    border: "2px solid",
                    borderColor: "primary.light",
                    "&:hover": { backgroundColor: "grey.200" },
                    py: 1.5,
                    px: 2,
                    mb: 1,
                  }}
                  secondaryAction={
                    annotatedRootSpan.annotation?.note ? (
                      <CheckCircleIcon />
                    ) : (
                      <CheckCircleOutlineIcon />
                    )
                  }
                >
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                  >
                    <Typography variant="body1">
                      Span: {annotatedRootSpan.id}
                    </Typography>
                    <Typography variant="body2">
                      Project: {annotatedRootSpan.projectName}
                    </Typography>
                    <Typography variant="body2">
                      Name: {annotatedRootSpan.spanName}
                    </Typography>
                  </Box>
                </ListItem>
                <IconButton>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </List>
          <Box>
            <Box
              sx={{
                borderRadius: 2,
                border: "2px solid",
                borderColor: "primary.light",
                height: "250px",
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
              <List sx={{ overflowY: "auto" }}>
                {filtersCategories.map((filter) => (
                  <ListItem
                    key={filter}
                    onClick={() => handleFilter(filter)}
                    sx={{
                      borderRadius: 2,
                      border: "2px solid",
                      "&:hover": { backgroundColor: "grey.200" },
                      ...(activeFilters.includes(filter) && {
                        backgroundColor: "grey.400",
                      }),
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
              sx={{ mr: 2, mt: 2 }}
              onClick={() => onCategorize()}
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
                px: 2,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Typography variant="h4" component="h1" gutterBottom>
                  Categories
                </Typography>
              </Box>
              {categories ? (
                <List>
                  {categories.map((category) => (
                    <ListItem
                      key={category.name}
                      onClick={() => handleFilter(category.name)}
                      sx={{
                        borderRadius: 2,
                        border: "2px solid",
                        "&:hover": { backgroundColor: "grey.200" },
                        ...(activeFilters.includes(category.name) && {
                          backgroundColor: "grey.400",
                        }),
                        mb: 1,
                      }}
                    >
                      {`${category.name} - ${category.count}`}
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography>No Categories</Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default RootSpans;
