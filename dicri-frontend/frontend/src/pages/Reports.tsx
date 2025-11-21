
import { useEffect, useState } from "react";
import {
    Paper,
    Typography,
    Box,
    TextField,
    Button,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    CircularProgress,
    Alert,
    Divider,
    MenuItem,
} from "@mui/material";
import api from "../services/api";

interface CaseFilesSummaryRow {
    caseStatusId: number;
    statusName: string;
    totalCases: number;
}

interface CaseFilesDetailRow {
    id: number;
    caseNumber: string;
    description: string;
    prosecutorOffice: string;
    statusName: string;
}

interface UserOption {
    id: number;
    name: string;
}

// Opciones fijas de estado (ids según tu backend)
const STATUS_OPTIONS: { id: number | ""; label: string }[] = [
    { id: "", label: "Todos" },
    { id: 1, label: "REGISTRADO" },
    { id: 2, label: "EN REVISIÓN" },
    { id: 3, label: "APROBADO" },
    { id: 4, label: "RECHAZADO" },
    { id: 7, label: "EN ESPERA" },
];

const mapDetailFromApi = (row: any): CaseFilesDetailRow => {
    const id = row.caseFileId ?? row.CaseFileId ?? row.id ?? row.Id ?? 0;

    const caseNumber =
        row.caseNumber ?? row.CaseNumber ?? row.case_file_number ?? "-";

    const description =
        row.descriptionCase ??
        row.DescriptionCase ??
        row.description ??
        row.Description ??
        "";

    const prosecutorOffice =
        row.prosecutorOffice ?? row.ProsecutorOffice ?? "-";

    const statusName =
        row.statusName ??
        row.StatusName ??
        row.caseStatusName ??
        row.CaseStatusName ??
        row.currentStatusName ??
        row.CurrentStatusName ??
        "-";

    return {
        id,
        caseNumber,
        description,
        prosecutorOffice,
        statusName,
    };
};

const Reports = () => {
    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");
    const [statusId, setStatusId] = useState<string>(""); // string para querystring
    const [createdByUserId, setCreatedByUserId] = useState<string>("");

    const [summaryRows, setSummaryRows] = useState<CaseFilesSummaryRow[]>([]);
    const [summaryTotal, setSummaryTotal] = useState<number>(0);
    const [detailRows, setDetailRows] = useState<CaseFilesDetailRow[]>([]);

    const [users, setUsers] = useState<UserOption[]>([]);
    const [usersLoading, setUsersLoading] = useState<boolean>(false);

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // ---------- Carga de usuarios para el combo "Creado por" ----------
    useEffect(() => {
        const loadUsers = async () => {
            try {
                setUsersLoading(true);
                // Ajusta la ruta si tu backend usa otra (por ejemplo /users/list)
                const { data } = await api.get<any[]>("/users");

                const seen = new Set<number>();
                const mapped: UserOption[] = [];

                for (const u of data ?? []) {
                    const id = u.userId ?? u.UserId ?? 0;
                    if (!id) continue;

                    // si ya vimos este id, lo saltamos (evita duplicados por rol)
                    if (seen.has(id)) continue;
                    seen.add(id);

                    const firstName = u.firstName ?? u.FirstName ?? "";
                    const lastName = u.lastName ?? u.LastName ?? "";
                    const fullName =
                        u.fullName ??
                        u.FullName ??
                        `${firstName} ${lastName}`.trim();

                    const userName = u.userName ?? u.UserName ?? "";

                    mapped.push({
                        id,
                        name: fullName || userName || `Usuario ${id}`,
                    });
                }

                setUsers(mapped);
            } catch (err) {
                console.error("Error cargando usuarios para filtros", err);
            } finally {
                setUsersLoading(false);
            }
        };

        loadUsers();
    }, []);


    // ---------- Filtros / Query string ----------
    const buildQueryString = () => {
        const params = new URLSearchParams();
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);
        if (statusId) params.append("statusId", statusId);
        if (createdByUserId) params.append("createdByUserId", createdByUserId);
        const qs = params.toString();
        return qs ? `?${qs}` : "";
    };

    const fetchReports = async () => {
        try {
            setLoading(true);
            setError(null);

            const qs = buildQueryString();

            // baseURL ya tiene /api
            const [summaryRes, detailRes] = await Promise.all([
                api.get<any>(`/reports/casefiles/summary${qs}`),
                api.get<any>(`/reports/casefiles/detail${qs}`),
            ]);

            // DETAIL: { period, filters, items: [...] }
            const detailDataRaw = detailRes.data;
            const detailItems: any[] = detailDataRaw?.items ?? [];
            const detailData: CaseFilesDetailRow[] = detailItems.map((row: any) =>
                mapDetailFromApi(row)
            );
            setDetailRows(detailData);

            // Totales por estado calculados desde DETAIL
            const countsByStatusId: Record<number, number> = {};
            detailItems.forEach((item) => {
                const sId =
                    item.currentStatusId ??
                    item.CurrentStatusId ??
                    item.lastStatusId ??
                    item.LastStatusId ??
                    null;
                if (sId != null) {
                    countsByStatusId[sId] = (countsByStatusId[sId] || 0) + 1;
                }
            });

            // SUMMARY: { period, totalCaseFiles, byStatus: [...] }
            const summaryDataRaw = summaryRes.data;
            const summaryRowsRaw: any[] = summaryDataRaw?.byStatus ?? [];

            const summaryData: CaseFilesSummaryRow[] = summaryRowsRaw.map(
                (row: any) => {
                    const caseStatusId =
                        row.caseStatusId ?? row.CaseStatusId ?? 0;
                    const statusName =
                        row.name ??
                        row.Name ??
                        row.statusName ??
                        row.StatusName ??
                        "-";
                    const totalCases = countsByStatusId[caseStatusId] || 0;

                    return {
                        caseStatusId,
                        statusName,
                        totalCases,
                    };
                }
            );

            setSummaryRows(summaryData);
            // Total de expedientes = cantidad de items del detalle
            setSummaryTotal(detailItems.length);
        } catch (err: any) {
            console.error(err);
            const msg =
                err?.response?.data?.message ??
                err?.response?.data?.error ??
                err?.message ??
                "Error al cargar los reportes.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Carga inicial sin filtros
        fetchReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleApplyFilters = () => {
        fetchReports();
    };

    const handleClearFilters = () => {
        setFromDate("");
        setToDate("");
        setStatusId("");
        setCreatedByUserId("");
        fetchReports();
    };

    return (
        <Paper sx={{ p: 2, width: "100%" }}>
            <Typography
                variant="h6"
                sx={{ fontWeight: "bold", textAlign: "center", mb: 2 }}
            >
                REPORTES DE EXPEDIENTES
            </Typography>

            {/* Filtros */}
            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                    alignItems: "center",
                    mb: 2,
                }}
            >
                <TextField
                    label="Desde"
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                />
                <TextField
                    label="Hasta"
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                />

                {/* Estado como combo */}
                <TextField
                    label="Estado"
                    select
                    size="small"
                    value={statusId}
                    onChange={(e) => setStatusId(e.target.value)}
                    sx={{ minWidth: 180 }}
                >
                    {STATUS_OPTIONS.map((opt) => (
                        <MenuItem key={opt.id === "" ? "all" : opt.id} value={opt.id}>
                            {opt.label}
                        </MenuItem>
                    ))}
                </TextField>

                {/* Creado por como combo de usuarios */}
                <TextField
                    label="Creado por"
                    select
                    size="small"
                    value={createdByUserId}
                    onChange={(e) => setCreatedByUserId(e.target.value)}
                    sx={{ minWidth: 220 }}
                    disabled={usersLoading}
                >
                    <MenuItem value="">Todos</MenuItem>
                    {users.map((u) => (
                        <MenuItem key={u.id} value={u.id.toString()}>
                            {u.name}
                        </MenuItem>
                    ))}
                </TextField>

                <Button
                    variant="contained"
                    size="small"
                    onClick={handleApplyFilters}
                    disabled={loading}
                >
                    APLICAR FILTROS
                </Button>
                <Button
                    variant="text"
                    size="small"
                    onClick={handleClearFilters}
                    disabled={loading}
                >
                    LIMPIAR
                </Button>
            </Box>

            {loading && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2">
                        Cargando información de reportes...
                    </Typography>
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Resumen por estado */}
            <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", mt: 1, mb: 1 }}
            >
                Resumen por estado
            </Typography>

            <Typography variant="body2" sx={{ mb: 1 }}>
                Total de expedientes en el periodo:{" "}
                <strong>{summaryTotal}</strong>
            </Typography>

            {summaryRows.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    No se encontraron datos para el resumen.
                </Typography>
            ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                <TableCell sx={{ fontWeight: "bold" }}>Estado</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }} align="right">
                                    Total expedientes
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {summaryRows.map((row) => (
                                <TableRow key={row.caseStatusId}>
                                    <TableCell>{row.statusName}</TableCell>
                                    <TableCell align="right">{row.totalCases}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Detalle de expedientes */}
            <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", mt: 1, mb: 1 }}
            >
                Detalle de expedientes
            </Typography>

            {detailRows.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                    No se encontraron expedientes para los filtros seleccionados.
                </Typography>
            ) : (
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                <TableCell sx={{ fontWeight: "bold" }}>
                                    Expediente
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>
                                    Descripción
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>
                                    Fiscalía
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>
                                    Estado
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {detailRows.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.caseNumber}</TableCell>
                                    <TableCell>{row.description}</TableCell>
                                    <TableCell>{row.prosecutorOffice}</TableCell>
                                    <TableCell>{row.statusName}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Paper>
    );
};

export default Reports;
