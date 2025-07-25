import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isProjectsPage = location.pathname === "/projects";
  const showLimitedNav = isHomePage || isProjectsPage;

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          sx={{ 
            flexGrow: 1, 
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.8
            }
          }}
          onClick={() => navigate("/")}
        >
          🍋 LLMonade
        </Typography>
        {showLimitedNav ? (
          <>
            <Button color="inherit" onClick={() => navigate("/")}>Getting Started</Button>
            <Button color="inherit" onClick={() => navigate("/projects")}>Projects</Button>
          </>
        ) : (
          <>
            <Button color="inherit" onClick={() => navigate("/")}>Getting Started</Button>
            <Button color="inherit" onClick={() => navigate("/projects")}>Projects</Button>
            <Button color="inherit" onClick={() => navigate("/queues")}>Queues</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;