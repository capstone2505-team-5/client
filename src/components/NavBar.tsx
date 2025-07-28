import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import llmonadeIcon from "../assets/icons/Updated_OG_Symbol.svg";
import llmonadeText from "../assets/icons/Updated_OG_Tag_White.svg";

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isProjectsPage = location.pathname === "/projects";
  const showLimitedNav = isHomePage || isProjectsPage;

  return (
    <AppBar position="static">
      <Toolbar>
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          <img src={llmonadeIcon} alt="LLMonade Icon" style={{ width: "50px", height: "50px" }} />
          <img src={llmonadeText} alt="LLMonade Text" style={{ width: "100px", height: "50px" }} />
        </Box>
        
        <Box sx={{ flexGrow: 1 }} />
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