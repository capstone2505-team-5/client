import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

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
        {!isHomePage && (
          <>
            <Button color="inherit" onClick={() => navigate("/queues")}>Queues</Button>
            <Button color="inherit" onClick={() => navigate("/")}>Datasets</Button>
            <Button color="inherit" onClick={() => navigate("/")}>How To</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;