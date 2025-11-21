
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Typography,
  CircularProgress,
  IconButton,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import api from "../services/api";

interface CaseFile {
  id: number;
  caseNumber: string;
  description: string;
  prosecutorOffice?: string | null;
  statusName?: string | null;
}

const CASEFILES_ENDPOINT = "/casefiles";

const mapCaseFileFromApi = (row: any): CaseFile => {
  const id =
    row.caseFileId ?? row.CaseFileId ?? row.id ?? row.Id ?? 0;

  const caseNumber =
    row.caseNumber ?? row.CaseNumber ?? row.case_file_number ?? "-";

  const description =
    row.descriptionCase ??
    row.DescriptionCase ??
    row.description ??
    row.Description ??
    "";

  const prosecutorOffice =
    row.prosecutorOffice ?? row.ProsecutorOffice ?? null;

  const statusName =
    row.nameCaseStatus ??
    row.NameCaseStatus ??
    row.caseStatusName ??
    row.CaseStatusName ??
    row.statusName ??
    null;

  return {
    id,
    caseNumber,
    description,
    prosecutorOffice,
    statusName,
  };
};

const CaseFilesList = () => {
  const [rows, setRows] = useState<CaseFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await api.get<any[]>(CASEFILES_ENDPOINT);
        const mapped = data.map(mapCaseFileFromApi);
        setRows(mapped);
      } catch (err: any) {
        console.error(err);
        const msg =
          err?.response?.data?.message ??
          err?.response?.data?.error ??
          "Error al cargar expedientes.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Paper sx={{ p: 2, width: "100%" }}>
        <Typography variant="h6" gutterBottom>
          Listado de expedientes
        </Typography>
        <CircularProgress size={24} />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2, width: "100%" }}>
        <Typography variant="h6" gutterBottom>
          Listado de expedientes
        </Typography>
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, width: "100%" }}>
      <Typography variant="h6" gutterBottom>
        Listado de expedientes
      </Typography>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Número</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Fiscalía</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  No hay expedientes registrados.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.caseNumber}</TableCell>
                  <TableCell>{row.description || "-"}</TableCell>
                  <TableCell>{row.prosecutorOffice || "-"}</TableCell>
                  <TableCell>{row.statusName || "-"}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/casefiles/${row.id}`)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default CaseFilesList;
