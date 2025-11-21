import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from "@mui/material";
import { Link as RouterLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AppLayout = () => {
  const { user, logout } = useAuth();

  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h6" component="div">
              DICRI - Gestión de Expedientes
            </Typography>
            {user && (
              <Typography variant="caption">
                {user.name} ({user.roleName})
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
              Expedientes
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/reports"
              sx={{ mr: 1 }}
            >
              Reportes
            </Button>
            <Button color="inherit" onClick={logout}>
              Salir
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 3 }}>
        <Outlet />
      </Container>
    </>
  );
};

export default AppLayout;
