import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate();
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          LLMonade 🍋
        </Typography>
        <Button color="inherit" onClick={() => navigate("/")}>Home</Button>
        <Button color="inherit" onClick={() => navigate("/queues")}>Queues</Button>
        <Button color="inherit" onClick={() => navigate("/")}>Datasets</Button>
        <Button color="inherit" onClick={() => navigate("/")}>How To</Button>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;