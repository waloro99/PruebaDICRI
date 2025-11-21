
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from "@mui/material";
import { Link as RouterLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AppLayout = () => {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#ffffff" }}>
      {/* Barra superior */}
      <AppBar position="static">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h6" component="div">
              DICRI - Gestión de Expedientes
            </Typography>
            {user && (
              <Typography variant="caption">
                {user.fullName ?? user.userName}
                {user.roleName ? ` (${user.roleName})` : ""}
              </Typography>
            )}
          </Box>
          <Box>
            <Button
              color="inherit"
              component={RouterLink}
              to="/casefiles"
              sx={{ mr: 1 }}
            >
              EXPEDIENTES
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/reports"
              sx={{ mr: 1 }}
            >
              REPORTES
            </Button>
            <Button color="inherit" onClick={logout}>
              SALIR
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Contenido centrado */}
      <Box
        sx={{
          py: 3,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 1100,   // ancho máximo del “card”
            px: 2,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
