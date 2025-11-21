import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import CaseFilesList from "./pages/CaseFilesList";
import CaseFileDetail from "./pages/CaseFileDetail";
import Reports from "./pages/Reports";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Rutas protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/casefiles" element={<CaseFilesList />} />
          <Route path="/casefiles/:id" element={<CaseFileDetail />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Route>

      {/* default */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
