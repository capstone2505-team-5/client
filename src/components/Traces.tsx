import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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
import type { AnnotatedTrace } from "../types/types";

interface tracesProps {
  annotatedTraces: AnnotatedTrace[];
}

interface category {
  name: string;
  count: number;
}

const Traces = ({ annotatedTraces }: tracesProps) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [categories, setCategories] = useState<category[] | null>(null);
  const [filteredAnnotatedTraces, setFilteredAnnotatedTraces] = useState<
    AnnotatedTrace[]
  >([]);
  const navigate = useNavigate();

  useEffect(() => {
    const categoryCountMap = new Map<string, number>();

    annotatedTraces.forEach((trace) => {
      trace.categories.forEach((category) => {
        const currentCount = categoryCountMap.get(category) || 0;
        categoryCountMap.set(category, currentCount + 1);
      });
    });

    console.log("hey");
    console.log(categoryCountMap);

    const categoriesTemp: category[] = Array.from(
      categoryCountMap.entries()
    ).map(([name, count]) => ({ name, count }));

    setCategories(categoriesTemp);
  }, [annotatedTraces]);

  useEffect(() => {
    if (activeFilters.length === 0) {
      setFilteredAnnotatedTraces(annotatedTraces);
      return;
    }

    const filteredTraces = annotatedTraces.filter((trace) => {
      const annotationFilters = activeFilters.filter(
        (f) => f === "Annotated" || f === "Not Annotated"
      );
      const categoryFilters = activeFilters.filter(
        (f) => f !== "Annotated" && f !== "Not Annotated"
      );

      let passesAnnotationFilter = true;
      if (annotationFilters.length > 0) {
        if (
          annotationFilters.includes("Annotated") &&
          annotationFilters.length === 1
        ) {
          passesAnnotationFilter = trace.note !== "";
        } else if (
          annotationFilters.includes("Not Annotated") &&
          annotationFilters.length === 1
        ) {
          passesAnnotationFilter = trace.note === "";
        }
      }

      let passesCategoryFilter = true;
      if (categoryFilters.length > 0) {
        passesCategoryFilter = categoryFilters.some((categoryFilter) =>
          trace.categories.includes(categoryFilter)
        );
      }

      return passesAnnotationFilter && passesCategoryFilter;
    });

    setFilteredAnnotatedTraces(filteredTraces);
  }, [activeFilters, annotatedTraces]);

  const handleView = (annotatedTrace: AnnotatedTrace) => {
    navigate(`/traces/${annotatedTrace.traceId}`, {state: annotatedTrace});
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

  console.log(activeFilters);

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
            Traces - {filteredAnnotatedTraces.length}
          </Typography>
          <Box>
            <Button
              variant="contained"
              onClick={() => navigate("/annotation")}
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
            {filteredAnnotatedTraces.map((annotatedTrace) => (
              <Box
                key={annotatedTrace.traceId}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                }}
              >
                <ListItem
                  key={annotatedTrace.traceId}
                  onClick={() => handleView(annotatedTrace)}
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
                    annotatedTrace.note ? (
                      <CheckCircleIcon />
                    ) : (
                      <CheckCircleOutlineIcon />
                    )
                  }
                >
                  Trace: {annotatedTrace.traceId}
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
            <Button fullWidth variant="contained" sx={{ mr: 2, mt: 2 }}>
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

export default Traces;
