import { useState, useMemo } from "react";
import {
  Box, Typography, Button, Tabs, Tab, TextField, InputAdornment, Chip,
  Skeleton, IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, Switch, Snackbar, Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { useNavigate } from "react-router-dom";
import {
  useGetAssignmentsQuery,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
} from "@/store/api/assignmentApi";
import dayjs from "dayjs";

export default function TeacherAssignments() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [snack, setSnack] = useState(null);
  const { data: assignments = [], isLoading } = useGetAssignmentsQuery({});
  const navigate = useNavigate();
  const [updateAssignment] = useUpdateAssignmentMutation();
  const [deleteAssignment, { isLoading: deleting }] = useDeleteAssignmentMutation();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    let list = assignments;
    if (tab === 1) list = list.filter((a) => a.submissionCount > a.gradedCount && a.status === "published");
    else if (tab === 2) list = list.filter((a) => a.status === "draft");
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) => a.title?.toLowerCase().includes(q) || a.subjectId?.name?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [assignments, tab, search]);

  const pendingCount = assignments.filter(
    (a) => a.submissionCount > a.gradedCount && a.status === "published",
  ).length;
  const draftCount = assignments.filter((a) => a.status === "draft").length;

  const handleStatusToggle = async (e, a) => {
    e.stopPropagation();
    const newStatus = a.status === "published" ? "draft" : "published";
    try {
      await updateAssignment({ id: a._id, status: newStatus }).unwrap();
      setSnack({
        msg: newStatus === "published" ? "Assignment published" : "Moved to draft",
        severity: newStatus === "published" ? "success" : "info",
      });
    } catch {
      setSnack({ msg: "Failed to update status", severity: "error" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAssignment(deleteTarget._id).unwrap();
      setSnack({ msg: "Assignment deleted", severity: "success" });
    } catch {
      setSnack({ msg: "Failed to delete", severity: "error" });
    }
    setDeleteTarget(null);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
        <Typography sx={{ fontSize: "22px", fontWeight: 500 }}>Assignments</Typography>
        <Button variant="contained" startIcon={<AddIcon />}
          onClick={() => navigate("/teacher/assignments/create")}
          sx={{ textTransform: "none" }}>
          New Assignment
        </Button>
      </Box>
      <Typography sx={{ fontSize: "13px", color: "var(--color-text-secondary)", mb: 3 }}>
        {assignments.length} assignment{assignments.length !== 1 ? "s" : ""} total
      </Typography>

      {/* Tabs + Search */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.5, mb: 2.5 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="All" />
          <Tab label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              Pending review
              {pendingCount > 0 && (
                <Chip label={pendingCount} size="small"
                  sx={{ height: 18, fontSize: "11px", bgcolor: "var(--color-background-warning)", color: "var(--color-text-warning)" }} />
              )}
            </Box>
          } />
          <Tab label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              Drafts
              {draftCount > 0 && (
                <Chip label={draftCount} size="small"
                  sx={{ height: 18, fontSize: "11px", bgcolor: "var(--color-background-secondary)", color: "var(--color-text-secondary)" }} />
              )}
            </Box>
          } />
        </Tabs>
        <TextField placeholder="Search assignments…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small" sx={{ maxWidth: 280, width: "100%" }}
          slotProps={{ input: {
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: "var(--color-text-secondary)" }} /></InputAdornment>,
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch("")} sx={{ p: 0.25 }}>
                  <CloseIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          } }}
        />
      </Box>

      {(search || tab > 0) && (
        <Typography sx={{ fontSize: "12px", color: "var(--color-text-secondary)", mb: 1.5 }}>
          Showing {filtered.length} of {assignments.length}
        </Typography>
      )}

      {/* List */}
      {isLoading && Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={72} sx={{ mb: 1, borderRadius: "var(--border-radius-md)" }} />
      ))}

      {!isLoading && filtered.map((a) => {
        const due = dayjs(a.dueDate);
        const isOverdue = a.status === "published" && due.isBefore(dayjs(), "day");
        const isToday = due.isSame(dayjs(), "day");
        const ungradedCount = (a.submissionCount || 0) - (a.gradedCount || 0);
        const isPublished = a.status === "published";
        return (
          <Box key={a._id} sx={{
            bgcolor: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-md)",
            mb: 1, py: 1.5, px: 2,
            display: "flex", alignItems: "center", gap: 2,
            opacity: !isPublished ? 0.72 : 1,
            cursor: "pointer",
            "&:hover": { bgcolor: "var(--color-background-secondary)" },
          }} onClick={() => navigate(`/teacher/assignments/${a._id}`)}>
            {/* Status dot */}
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
              bgcolor: !isPublished ? "var(--color-text-secondary)"
                : ungradedCount > 0 ? "var(--color-text-warning)"
                : "var(--color-text-success)" }} />

            {/* Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 500 }} noWrap>{a.title}</Typography>
              <Typography sx={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
                {a.classId?.grade ? `Class ${a.classId.grade}${a.classId.section || ""}` : ""}
                {" · "}{a.subjectId?.name || ""}
                {a.dueDate ? ` · Due ${due.format("MMM D")}` : ""}
              </Typography>
            </Box>

            {/* Submission stats */}
            <Box sx={{ textAlign: "center", minWidth: 72 }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                {a.gradedCount || 0}/{a.submissionCount || 0}
              </Typography>
              <Typography sx={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>graded</Typography>
            </Box>

            {/* Badges */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              {!isPublished && (
                <Chip label="Draft" size="small"
                  sx={{ height: 22, fontSize: "11px", bgcolor: "var(--color-background-secondary)", color: "var(--color-text-secondary)" }} />
              )}
              {isOverdue && (
                <Chip label="Overdue" size="small"
                  sx={{ height: 22, fontSize: "11px", bgcolor: "var(--color-background-danger)", color: "var(--color-text-danger)" }} />
              )}
              {isToday && isPublished && (
                <Chip label="Due today" size="small"
                  sx={{ height: 22, fontSize: "11px", bgcolor: "var(--color-background-warning)", color: "var(--color-text-warning)" }} />
              )}
            </Box>

            {/* Actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}
              onClick={(e) => e.stopPropagation()}>
              {/* Publish / Unpublish toggle */}
              <Tooltip title={isPublished ? "Move to draft" : "Publish"}>
                <Switch size="small" checked={isPublished}
                  onChange={(e) => handleStatusToggle(e, a)} sx={{ mx: 0.25 }} />
              </Tooltip>

              {/* Edit */}
              <Tooltip title="Edit">
                <IconButton size="small"
                  onClick={(e) => { e.stopPropagation(); navigate(`/teacher/assignments/${a._id}/edit`); }}>
                  <EditOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>

              {/* Delete */}
              <Tooltip title="Delete">
                <IconButton size="small"
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(a); }}
                  sx={{ color: "error.main" }}>
                  <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        );
      })}

      {!isLoading && filtered.length === 0 && (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography sx={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
            {search || tab > 0 ? "No assignments match your filters" : "No assignments yet"}
          </Typography>
          {!search && tab === 0 && (
            <Button variant="outlined" size="small" startIcon={<AddIcon />}
              onClick={() => navigate("/teacher/assignments/create")}
              sx={{ mt: 1.5, textTransform: "none" }}>
              Create your first assignment
            </Button>
          )}
        </Box>
      )}

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth
        slotProps={{ paper: { sx: { borderRadius: "var(--border-radius-lg)" } } }}>
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 500 }}>Delete Assignment?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "13px" }}>
            "{deleteTarget?.title}" and all its submissions will be permanently deleted.
            This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting}
            sx={{ textTransform: "none" }}>
            {deleting ? <CircularProgress size={16} color="inherit" /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status / action snackbar */}
      <Snackbar
        open={!!snack}
        autoHideDuration={3000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack?.severity || "success"} onClose={() => setSnack(null)} sx={{ width: "100%" }}>
          {snack?.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
