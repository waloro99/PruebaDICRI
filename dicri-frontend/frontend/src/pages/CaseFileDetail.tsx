// src/pages/CaseFileDetail.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Box,
    Paper,
    Typography,
    CircularProgress,
    Button,
    Chip,
    Stack,
} from "@mui/material";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import EvidenceSection from "../components/EvidenceSection";

interface CaseFileDetail {
    id: number;
    caseNumber: string;
    description: string;
    prosecutorOffice?: string | null;
    statusName?: string | null;
}

type CaseFileAction = "sendToReview" | "approve" | "reject";

const mapCaseFileFromApi = (row: any): CaseFileDetail => {
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

const normalizeStatus = (status?: string | null): string => {
    if (!status) return "";
    return status
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .trim();
};

const CaseFileDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [caseFile, setCaseFile] = useState<CaseFileDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [actionLoading, setActionLoading] = useState<CaseFileAction | null>(
        null
    );
    const [actionMessage, setActionMessage] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const { data } = await api.get<any>(`/casefiles/${id}`);
                setCaseFile(mapCaseFileFromApi(data));
            } catch (err: any) {
                console.error(err);
                const msg =
                    err?.response?.data?.message ??
                    err?.response?.data?.error ??
                    "Error al cargar el expediente.";
                setError(msg);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    const handleAction = async (action: CaseFileAction) => {
        if (!id) return;
        const actionPath: Record<CaseFileAction, string> = {
            sendToReview: "send-to-review", // ajusta si tu backend usa otro nombre
            approve: "approve",
            reject: "reject",
        };

        try {
            setActionLoading(action);
            setActionMessage(null);
            setActionError(null);

            await api.post(`/casefiles/${id}/${actionPath[action]}`);

            // Recargar detalle
            const { data } = await api.get<any>(`/casefiles/${id}`);
            setCaseFile(mapCaseFileFromApi(data));

            const successMsg: Record<CaseFileAction, string> = {
                sendToReview: "Expediente enviado a revisión correctamente.",
                approve: "Expediente aprobado correctamente.",
                reject: "Expediente rechazado correctamente.",
            };
            setActionMessage(successMsg[action]);
        } catch (err: any) {
            console.error(err);
            const msg =
                err?.response?.data?.message ??
                err?.response?.data?.error ??
                "Error al ejecutar la acción.";
            setActionError(msg);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <Paper sx={{ p: 2, width: "100%" }}>
                <Typography variant="h6" gutterBottom>
                    Detalle de expediente
                </Typography>
                <CircularProgress size={24} />
            </Paper>
        );
    }

    if (error || !caseFile) {
        return (
            <Paper sx={{ p: 2, width: "100%" }}>
                <Typography variant="h6" gutterBottom>
                    Detalle de expediente
                </Typography>
                <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                    {error || "No se encontró el expediente."}
                </Typography>
                <Button variant="outlined" onClick={() => navigate("/casefiles")}>
                    Volver al listado
                </Button>
            </Paper>
        );
    }

    // ---------------- LÓGICA DE ESTADOS / ACCIONES ----------------

    const statusCode = normalizeStatus(caseFile.statusName);

    const statusIsRegistered =
        statusCode === "REGISTRADO" || statusCode === "EN ESPERA";
    const statusIsInReview = statusCode === "EN REVISION";
    const statusIsRejected = statusCode === "RECHAZADO";
    const statusIsApproved = statusCode === "APROBADO";

    // Reglas de acciones rápidas
    const canSendToReview =
        statusIsRegistered || statusIsRejected; // REGISTRADO / EN ESPERA / RECHAZADO → a revisión
    const canApprove = statusIsInReview; // EN REVISIÓN → aprobar
    const canReject = statusIsInReview; // EN REVISIÓN → rechazar

    // Regla de edición según rol y estado
    const roleUpper = (user?.roleName ?? "").toUpperCase();
    const canEditByRole =
        !!user &&
        (roleUpper.includes("ADMIN") || roleUpper.includes("COORDIN"));
    const canEditCaseFile = canEditByRole && !statusIsApproved;

    // ----------------------------------------------------------------

    return (
        <Paper sx={{ p: 2, width: "100%" }}>
            <Button
                variant="text"
                size="small"
                onClick={() => navigate("/casefiles")}
                sx={{ mb: 2 }}
            >
                ← VOLVER AL LISTADO
            </Button>

            {/* Encabezado */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", md: "center" },
                    mb: 2,
                    gap: 1,
                }}
            >
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Expediente {caseFile.caseNumber}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <Box component="span" sx={{ fontWeight: "bold" }}>
                            ID interno:
                        </Box>{" "}
                        {caseFile.id}
                    </Typography>
                </Box>
                <Chip
                    label={caseFile.statusName || "SIN ESTADO"}
                    size="small"
                    color="primary"
                />
            </Box>

            {/* Contenido principal: 2 columnas */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 3,
                    mb: 3,
                }}
            >
                {/* Columna izquierda */}
                <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                        Descripción
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        {caseFile.description || "-"}
                    </Typography>

                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                        Fiscalía
                    </Typography>
                    <Typography variant="body2">
                        {caseFile.prosecutorOffice || "-"}
                    </Typography>
                </Box>

                {/* Columna derecha */}
                <Box sx={{ flex: 1 }}>
                    <Typography
                        variant="subtitle2"
                        sx={{ mb: 1, fontWeight: "bold" }}
                    >
                        Estado actual
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        {caseFile.statusName || "-"}
                    </Typography>

                    <Typography
                        variant="subtitle2"
                        sx={{ mb: 1, fontWeight: "bold" }}
                    >
                        Acciones rápidas
                    </Typography>

                    {canSendToReview || canApprove || canReject || canEditCaseFile ? (
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            {canSendToReview && (
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => handleAction("sendToReview")}
                                    disabled={actionLoading !== null}
                                >
                                    ENVIAR A REVISIÓN
                                </Button>
                            )}
                            {canApprove && (
                                <Button
                                    variant="contained"
                                    size="small"
                                    color="success"
                                    onClick={() => handleAction("approve")}
                                    disabled={actionLoading !== null}
                                >
                                    APROBAR
                                </Button>
                            )}
                            {canReject && (
                                <Button
                                    variant="contained"
                                    size="small"
                                    color="error"
                                    onClick={() => handleAction("reject")}
                                    disabled={actionLoading !== null}
                                >
                                    RECHAZAR
                                </Button>
                            )}

                            {canEditCaseFile && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => navigate(`/casefiles/${caseFile.id}/edit`)}
                                >
                                    EDITAR EXPEDIENTE
                                </Button>
                            )}
                        </Stack>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            No hay acciones disponibles para este estado.
                        </Typography>
                    )}

                    {actionMessage && (
                        <Typography
                            variant="body2"
                            sx={{ mt: 1, color: "success.main" }}
                        >
                            {actionMessage}
                        </Typography>
                    )}
                    {actionError && (
                        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                            {actionError}
                        </Typography>
                    )}
                </Box>
            </Box>

            {/* Sección de evidencias */}
            <Box sx={{ mt: 2 }}>
                <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, fontWeight: "bold" }}
                >
                    Indicios
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {/* Sección de evidencias */}
                    <EvidenceSection caseFileId={caseFile.id} />
                </Typography>
            </Box>
        </Paper>
    );
};

export default CaseFileDetail;
