
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from "@mui/material";
import api from "../services/api";

export interface Evidence {
  id: number;
  caseFileId: number;
  description: string;
  evidenceType?: string | null;
  fileUrl?: string | null;
  createdAt?: string | null;
}

interface EvidenceSectionProps {
  caseFileId: number;
}

const mapEvidenceFromApi = (
  row: any,
  caseFileIdFallback: number
): Evidence => {
  const id =
    row.evidenceId ?? row.EvidenceId ?? row.id ?? row.Id ?? 0;

  const caseFileId =
    row.caseFileId ?? row.CaseFileId ?? caseFileIdFallback;

  const description =
    row.descriptionEvidence ??
    row.DescriptionEvidence ??
    row.description ??
    row.Description ??
    "";

  const evidenceType =
    row.evidenceType ?? row.EvidenceType ?? null;

  const fileUrl =
    row.fileUrl ?? row.FileUrl ?? row.path ?? row.Path ?? null;

  const createdAt =
    row.createdAt ?? row.CreatedAt ?? row.created_at ?? null;

  return {
    id,
    caseFileId,
    description,
    evidenceType,
    fileUrl,
    createdAt,
  };
};

const EvidenceSection = ({ caseFileId }: EvidenceSectionProps) => {
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [description, setDescription] = useState<string>("");
  const [evidenceType, setEvidenceType] = useState<string>("");
  const [fileUrl, setFileUrl] = useState<string>("");

  const loadEvidences = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await api.get<any[]>(
        `/casefiles/${caseFileId}/evidences`
      );

      const mapped = (data ?? []).map((row: any) =>
        mapEvidenceFromApi(row, caseFileId)
      );
      setEvidences(mapped);
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        "Error al cargar las evidencias.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (caseFileId) {
      loadEvidences();
    }
  }, [caseFileId]);

  const handleOpenDialog = () => {
    setDescription("");
    setEvidenceType("");
    setFileUrl("");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    if (saving) return;
    setOpenDialog(false);
  };

  const handleSaveEvidence = async () => {
    if (!description.trim()) return;

    try {
      setSaving(true);
      setError(null);

      // Payload que espera tu backend para insertar evidencia
      const payload: any = {
        description,
      };

      if (evidenceType.trim()) {
        payload.evidenceType = evidenceType.trim();
      }

      if (fileUrl.trim()) {
        payload.fileUrl = fileUrl.trim();
      }

      await api.post(`/casefiles/${caseFileId}/evidences`, payload);

      setOpenDialog(false);
      await loadEvidences();
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        "Error al guardar la evidencia.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          mb: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: "bold" }}
        >
          Evidencias
        </Typography>

        <Button
          variant="contained"
          size="small"
          onClick={handleOpenDialog}
        >
          Agregar evidencia
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress size={20} />
          <Typography variant="body2">
            Cargando evidencias...
          </Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      ) : evidences.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No hay evidencias registradas para este expediente.
        </Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Descripción
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Tipo
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Archivo / URL
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Fecha registro
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {evidences.map((ev) => (
                <TableRow key={ev.id}>
                  <TableCell>{ev.description}</TableCell>
                  <TableCell>{ev.evidenceType || "-"}</TableCell>
                  <TableCell>
                    {ev.fileUrl ? (
                      <a
                        href={ev.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {ev.fileUrl}
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{ev.createdAt || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Diálogo para agregar evidencia */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Agregar evidencia</DialogTitle>
        <DialogContent>
          <TextField
            label="Descripción"
            fullWidth
            margin="normal"
            required
            multiline
            minRows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextField
            label="Tipo (opcional)"
            fullWidth
            margin="normal"
            value={evidenceType}
            onChange={(e) => setEvidenceType(e.target.value)}
          />
          <TextField
            label="Archivo / URL (opcional)"
            fullWidth
            margin="normal"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            helperText="Puedes ingresar una ruta de archivo o un enlace a la evidencia."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveEvidence}
            variant="contained"
            disabled={saving || !description.trim()}
          >
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EvidenceSection;
