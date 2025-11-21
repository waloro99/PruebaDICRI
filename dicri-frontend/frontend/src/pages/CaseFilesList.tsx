
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
  TableSortLabel,
  TextField,
  MenuItem,
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

type Order = "asc" | "desc";
type SortField =
  | "caseNumber"
  | "description"
  | "prosecutorOffice"
  | "statusName"
  | null;

const normalize = (value: string) =>
  value
    ? value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    : "";

const CaseFilesList = () => {
  const [rows, setRows] = useState<CaseFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [orderBy, setOrderBy] = useState<SortField>(null);
  const [order, setOrder] = useState<Order>("asc");

  const [filters, setFilters] = useState({
    caseNumber: "",
    description: "",
    prosecutorOffice: "",
    // statusName ahora usa códigos: "", "aprobado", "en revision", "registrado", "rechazado"
    statusName: "",
  });

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

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRequestSort = (property: Exclude<SortField, null>) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const getComparator = (order: Order, orderBy: Exclude<SortField, null>) => {
    return (a: CaseFile, b: CaseFile) => {
      const aVal = (a[orderBy] ?? "").toString().toLowerCase();
      const bVal = (b[orderBy] ?? "").toString().toLowerCase();

      if (aVal < bVal) {
        return order === "asc" ? -1 : 1;
      }
      if (aVal > bVal) {
        return order === "asc" ? 1 : -1;
      }
      return 0;
    };
  };

  const applySortAndFilter = (): CaseFile[] => {
    let data = [...rows];

    // Filtros por columna
    data = data.filter((row) => {
      const matchCaseNumber = row.caseNumber
        .toLowerCase()
        .includes(filters.caseNumber.toLowerCase());
      const matchDescription = row.description
        .toLowerCase()
        .includes(filters.description.toLowerCase());
      const matchProsecutor = (row.prosecutorOffice ?? "")
        .toLowerCase()
        .includes(filters.prosecutorOffice.toLowerCase());

      // Filtro por estado usando códigos normalizados
      const rowStatusCode = normalize(row.statusName ?? "");
      const matchStatus =
        !filters.statusName || rowStatusCode === filters.statusName;

      return (
        matchCaseNumber &&
        matchDescription &&
        matchProsecutor &&
        matchStatus
      );
    });

    // Ordenamiento
    if (orderBy) {
      const comparator = getComparator(order, orderBy);
      data.sort(comparator);
    }

    return data;
  };

  const visibleRows = applySortAndFilter();

  if (loading) {
    return (
      <Paper sx={{ p: 2, width: "100%" }}>
        <Typography
          variant="h6"
          align="center"
          sx={{ fontWeight: "bold", mb: 2 }}
        >
          EXPEDIENTES
        </Typography>
        <CircularProgress size={24} />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2, width: "100%" }}>
        <Typography
          variant="h6"
          align="center"
          sx={{ fontWeight: "bold", mb: 2 }}
        >
          EXPEDIENTES
        </Typography>
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, width: "100%" }}>
      <Typography
        variant="h6"
        align="center"
        sx={{ fontWeight: "bold", mb: 2 }}
      >
        EXPEDIENTES
      </Typography>

      <TableContainer>
        <Table size="small">
          <TableHead>
            {/* Encabezados con ordenamiento */}
            <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
              <TableCell sx={{ fontWeight: "bold" }}>
                <TableSortLabel
                  active={orderBy === "caseNumber"}
                  direction={orderBy === "caseNumber" ? order : "asc"}
                  onClick={() => handleRequestSort("caseNumber")}
                >
                  Expediente
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                <TableSortLabel
                  active={orderBy === "description"}
                  direction={orderBy === "description" ? order : "asc"}
                  onClick={() => handleRequestSort("description")}
                >
                  Descripción
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                <TableSortLabel
                  active={orderBy === "prosecutorOffice"}
                  direction={orderBy === "prosecutorOffice" ? order : "asc"}
                  onClick={() => handleRequestSort("prosecutorOffice")}
                >
                  Fiscalía
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                <TableSortLabel
                  active={orderBy === "statusName"}
                  direction={orderBy === "statusName" ? order : "asc"}
                  onClick={() => handleRequestSort("statusName")}
                >
                  Estado
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="right">
                Acciones
              </TableCell>
            </TableRow>

            {/* Fila de filtros por columna */}
            <TableRow>
              <TableCell>
                <TextField
                  variant="standard"
                  placeholder="Filtrar..."
                  value={filters.caseNumber}
                  onChange={(e) =>
                    handleFilterChange("caseNumber", e.target.value)
                  }
                  fullWidth
                />
              </TableCell>
              <TableCell>
                <TextField
                  variant="standard"
                  placeholder="Filtrar..."
                  value={filters.description}
                  onChange={(e) =>
                    handleFilterChange("description", e.target.value)
                  }
                  fullWidth
                />
              </TableCell>
              <TableCell>
                <TextField
                  variant="standard"
                  placeholder="Filtrar..."
                  value={filters.prosecutorOffice}
                  onChange={(e) =>
                    handleFilterChange("prosecutorOffice", e.target.value)
                  }
                  fullWidth
                />
              </TableCell>
              <TableCell>
                {/* Combo de estados */}
                <TextField
                  select
                  variant="standard"
                  value={filters.statusName}
                  onChange={(e) =>
                    handleFilterChange("statusName", e.target.value)
                  }
                  fullWidth
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="aprobado">APROBADO</MenuItem>
                  <MenuItem value="en revision">EN REVISIÓN</MenuItem>
                  <MenuItem value="registrado">REGISTRADO</MenuItem>
                  <MenuItem value="rechazado">RECHAZADO</MenuItem>
                </TextField>
              </TableCell>
              <TableCell />
            </TableRow>
          </TableHead>

          <TableBody>
            {visibleRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  No se encontraron expedientes con esos filtros.
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((row) => (
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
