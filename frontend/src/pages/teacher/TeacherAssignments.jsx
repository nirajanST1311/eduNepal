import { useState, useMemo } from "react";
import {
  Box, Typography, Button, Tabs, Tab, TextField, InputAdornment, Chip,
  Skeleton, IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, Switch, LinearProgress, Avatar, Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import GradingOutlinedIcon from "@mui/icons-material/GradingOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useNavigate } from "react-router-dom";
import {
  useGetAssignmentsQuery,
  useGetAssignmentQuery,
  useGetSubmissionsQuery,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
} from "@/store/api/assignmentApi";
import dayjs from "dayjs";

// ─── helpers ────────────────────────────────────────────────────────────────
function getInitials(name = "") {
  const parts = name.trim().split(" ");
  if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0]?.[0] || "?").toUpperCase();
}

// ─── AssignmentDetail ────────────────────────────────────────────────────────
function AssignmentDetail({ assignmentId, onBack, onEdit, onGrade }) {
  const { data: assignment, isLoading: loadA } = useGetAssignmentQuery(assignmentId);
  const { data: submissions = [], isLoading: loadS } = useGetSubmissionsQuery(assignmentId);

  if (loadA || loadS) {
    return (
      <Box>
        <Skeleton variant="rounded" height={200} sx={{ mb: 2, borderRadius: "var(--border-radius-md)" }} />
        <Skeleton variant="rounded" height={300} sx={{ borderRadius: "var(--border-radius-md)" }} />
      </Box>
    );
  }
  if (!assignment) return null;

  const due = dayjs(assignment.dueDate);
  const isPublished = assignment.status === "published";
  const isOverdue = isPublished && due.isBefore(dayjs(), "day");
  const gradedCount = submissions.filter((s) => s.marks != null).length;
  const totalSubs = submissions.length;
  const gradePct = totalSubs > 0 ? Math.round((gradedCount / totalSubs) * 100) : 0;
  const barColor = isOverdue ? "error" : isPublished ? "success" : "inherit";

  return (
    <Box>
      {/* Back + actions header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Button size="small" startIcon={<ArrowBackIosNewIcon sx={{ fontSize: 13 }} />}
          onClick={onBack} sx={{ textTransform: "none", color: "var(--color-text-secondary)", fontWeight: 400, px: 0 }}>
          Back to assignments
        </Button>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<EditOutlinedIcon sx={{ fontSize: 15 }} />}
            onClick={onEdit} sx={{ textTransform: "none" }}>
            Edit
          </Button>
          {totalSubs > 0 && (
            <Button size="small" variant="contained" startIcon={<GradingOutlinedIcon sx={{ fontSize: 15 }} />}
              onClick={onGrade} sx={{ textTransform: "none" }}>
              Grade
            </Button>
          )}
        </Box>
      </Box>

      {/* Hero card */}
      <Box sx={{
        bgcolor: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-md)",
        overflow: "hidden", mb: 2,
      }}>
        {/* Colored top bar */}
        <Box sx={{
          height: 6,
          bgcolor: isOverdue ? "var(--color-text-danger)"
            : isPublished ? "var(--color-text-success)"
            : "var(--color-text-secondary)",
        }} />
        <Box sx={{ p: 3 }}>
          {/* Status chip + title */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.75 }}>
            <Chip
              label={isOverdue ? "Overdue" : isPublished ? "Published" : "Draft"}
              size="small"
              sx={{
                height: 22, fontSize: "11px",
                bgcolor: isOverdue ? "var(--color-background-danger)"
                  : isPublished ? "var(--color-background-success)"
                  : "var(--color-background-secondary)",
                color: isOverdue ? "var(--color-text-danger)"
                  : isPublished ? "var(--color-text-success)"
                  : "var(--color-text-secondary)",
              }}
            />
          </Box>
          <Typography sx={{ fontSize: "20px", fontWeight: 600, mb: 1 }}>{assignment.title}</Typography>
          {assignment.description && (
            <Typography sx={{ fontSize: "13px", color: "var(--color-text-secondary)", mb: 2, whiteSpace: "pre-wrap" }}>
              {assignment.description}
            </Typography>
          )}

          {/* Meta row */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2.5 }}>
            {assignment.dueDate && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <CalendarTodayOutlinedIcon sx={{ fontSize: 15, color: "var(--color-text-secondary)" }} />
                <Typography sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                  Due {due.format("MMM D, YYYY")}
                </Typography>
              </Box>
            )}
            {assignment.maxMarks != null && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <CheckCircleOutlinedIcon sx={{ fontSize: 15, color: "var(--color-text-secondary)" }} />
                <Typography sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                  {assignment.maxMarks} marks
                </Typography>
              </Box>
            )}
            {(assignment.classId || assignment.subjectId) && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <PeopleOutlinedIcon sx={{ fontSize: 15, color: "var(--color-text-secondary)" }} />
                <Typography sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                  {assignment.classId?.grade
                    ? `Class ${assignment.classId.grade}${assignment.classId.section || ""}`
                    : ""}
                  {assignment.classId && assignment.subjectId ? " · " : ""}
                  {assignment.subjectId?.name || ""}
                </Typography>
              </Box>
            )}
            {assignment.fileUrl && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <AttachFileOutlinedIcon sx={{ fontSize: 15, color: "var(--color-text-secondary)" }} />
                <Typography
                  component="a" href={assignment.fileUrl} target="_blank" rel="noopener noreferrer"
                  sx={{ fontSize: "13px", color: "var(--color-primary)", display: "flex", alignItems: "center", gap: 0.4, textDecoration: "none",
                    "&:hover": { textDecoration: "underline" } }}>
                  Attachment <OpenInNewIcon sx={{ fontSize: 12 }} />
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Submissions card */}
      <Box sx={{
        bgcolor: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-md)",
        p: 3,
      }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Typography sx={{ fontSize: "15px", fontWeight: 500 }}>
            Submissions
          </Typography>
          <Typography sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
            {gradedCount} / {totalSubs} graded
          </Typography>
        </Box>

        {totalSubs > 0 && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={gradePct}
              color={barColor}
              sx={{ height: 6, borderRadius: 3 }}
            />
            <Typography sx={{ fontSize: "11px", color: "var(--color-text-secondary)", mt: 0.5 }}>
              {gradePct}% graded
            </Typography>
          </Box>
        )}

        {totalSubs === 0 && (
          <Typography sx={{ fontSize: "13px", color: "var(--color-text-secondary)", textAlign: "center", py: 3 }}>
            No submissions yet
          </Typography>
        )}

        {submissions.map((sub, i) => {
          const isGraded = sub.marks != null;
          const studentName = sub.studentId?.name || sub.studentId?.username || "Student";
          return (
            <Box key={sub._id}>
              {i > 0 && <Divider sx={{ my: 0.75 }} />}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.5 }}>
                <Avatar sx={{ width: 32, height: 32, fontSize: "12px", bgcolor: "var(--color-primary)" }}>
                  {getInitials(studentName)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: "13px", fontWeight: 500 }} noWrap>{studentName}</Typography>
                  <Typography sx={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>
                    Submitted {dayjs(sub.submittedAt).format("MMM D, h:mm A")}
                  </Typography>
                </Box>
                {isGraded ? (
                  <Chip
                    label={`${sub.marks} / ${assignment.maxMarks ?? "—"}`}
                    size="small"
                    sx={{ height: 22, fontSize: "11px", bgcolor: "var(--color-background-success)", color: "var(--color-text-success)" }}
                  />
                ) : (
                  <Chip
                    label="Pending"
                    size="small"
                    sx={{ height: 22, fontSize: "11px", bgcolor: "var(--color-background-warning)", color: "var(--color-text-warning)" }}
                  />
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default function TeacherAssignments() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
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

  const handleStatusToggle = async (a) => {
    const newStatus = a.status === "published" ? "draft" : "published";
    try {
      await updateAssignment({ id: a._id, status: newStatus }).unwrap();
    } catch { /* ignore */ }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAssignment(deleteTarget._id).unwrap();
    } catch { /* ignore */ }
    setDeleteTarget(null);
  };

  // Show detail panel when a row is selected
  if (selectedId) {
    return (
      <AssignmentDetail
        assignmentId={selectedId}
        onBack={() => setSelectedId(null)}
        onEdit={() => navigate(`/teacher/assignments/${selectedId}/edit`)}
        onGrade={() => navigate(`/teacher/assignments/${selectedId}/grade`)}
      />
    );
  }

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
          }} onClick={() => setSelectedId(a._id)}>
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
              <Tooltip title={isPublished ? "Unpublish (move to draft)" : "Publish"}>
                <Switch size="small" checked={isPublished} onChange={() => handleStatusToggle(a)} sx={{ mx: 0.25 }} />
              </Tooltip>

              {/* Grade — only if submissions exist */}
              {ungradedCount > 0 && isPublished && (
                <Tooltip title={`Grade ${ungradedCount} submission${ungradedCount !== 1 ? "s" : ""}`}>
                  <IconButton size="small" onClick={() => navigate(`/teacher/assignments/${a._id}/grade`)}
                    sx={{ color: "var(--color-text-warning)" }}>
                    <GradingOutlinedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}

              {/* Edit */}
              <Tooltip title="Edit assignment">
                <IconButton size="small" onClick={() => navigate(`/teacher/assignments/${a._id}/edit`)}>
                  <EditOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>

              {/* Delete */}
              <Tooltip title="Delete assignment">
                <IconButton size="small" onClick={() => setDeleteTarget(a)} sx={{ color: "error.main" }}>
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
    </Box>
  );
}
