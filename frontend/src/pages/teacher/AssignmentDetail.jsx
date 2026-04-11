import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, Chip, LinearProgress, Avatar, Divider,
  Skeleton, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
} from "@mui/material";
import GradingOutlinedIcon from "@mui/icons-material/GradingOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  useGetAssignmentQuery,
  useGetSubmissionsQuery,
  useDeleteAssignmentMutation,
} from "@/store/api/assignmentApi";
import dayjs from "dayjs";

function getInitials(name = "") {
  const parts = name.trim().split(" ");
  if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0]?.[0] || "?").toUpperCase();
}

export default function AssignmentDetail() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: assignment, isLoading: loadA } = useGetAssignmentQuery(assignmentId);
  const { data: submissions = [], isLoading: loadS } = useGetSubmissionsQuery(assignmentId);
  const [deleteAssignment, { isLoading: deleting }] = useDeleteAssignmentMutation();

  const handleDelete = async () => {
    try {
      await deleteAssignment(assignmentId).unwrap();
      navigate("/teacher/assignments");
    } catch { /* ignore */ }
  };

  if (loadA || loadS) {
    return (
      <Box>
        <Skeleton variant="rounded" height={220} sx={{ mb: 2, borderRadius: "var(--border-radius-md)" }} />
        <Skeleton variant="rounded" height={320} sx={{ borderRadius: "var(--border-radius-md)" }} />
      </Box>
    );
  }
  if (!assignment) return null;

  const due = dayjs(assignment.dueDate);
  const isPublished = assignment.status === "published";
  const isOverdue = isPublished && assignment.dueDate && due.isBefore(dayjs(), "day");
  const maxMarks = assignment.maxMarks ?? 100;
  const gradedCount = submissions.filter((s) => s.marks != null).length;
  const totalSubs = submissions.length;
  const gradePct = totalSubs > 0 ? Math.round((gradedCount / totalSubs) * 100) : 0;
  const ungradedCount = totalSubs - gradedCount;

  return (
    <Box>
      {/* Title + action buttons */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2.5, flexWrap: "wrap", gap: 1.5 }}>
        <Box>
          <Typography sx={{ fontSize: "22px", fontWeight: 600, mb: 0.5 }}>{assignment.title}</Typography>
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
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button size="small" variant="outlined"
            startIcon={<EditOutlinedIcon sx={{ fontSize: 15 }} />}
            onClick={() => navigate(`/teacher/assignments/${assignmentId}/edit`)}
            sx={{ textTransform: "none" }}>
            Edit
          </Button>
          {totalSubs > 0 && (
            <Button size="small" variant="contained"
              startIcon={<GradingOutlinedIcon sx={{ fontSize: 15 }} />}
              onClick={() => navigate(`/teacher/assignments/${assignmentId}/grade`)}
              sx={{ textTransform: "none" }}>
              {ungradedCount > 0 ? `Grade (${ungradedCount})` : "View Grades"}
            </Button>
          )}
          <Button size="small" variant="outlined" color="error"
            startIcon={<DeleteOutlinedIcon sx={{ fontSize: 15 }} />}
            onClick={() => setDeleteOpen(true)}
            sx={{ textTransform: "none" }}>
            Delete
          </Button>
        </Box>
      </Box>

      {/* Info card */}
      <Box sx={{
        bgcolor: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-md)",
        overflow: "hidden", mb: 2,
      }}>
        <Box sx={{
          height: 5,
          bgcolor: isOverdue ? "var(--color-text-danger)"
            : isPublished ? "var(--color-text-success)"
            : "var(--color-text-secondary)",
        }} />
        <Box sx={{ p: 3 }}>
          {assignment.description && (
            <Typography sx={{ fontSize: "13px", color: "var(--color-text-secondary)", mb: 2.5, whiteSpace: "pre-wrap" }}>
              {assignment.description}
            </Typography>
          )}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
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
                  sx={{
                    fontSize: "13px", color: "var(--color-primary)", display: "flex",
                    alignItems: "center", gap: 0.4, textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}>
                  View Attachment <OpenInNewIcon sx={{ fontSize: 12 }} />
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
          <Typography sx={{ fontSize: "15px", fontWeight: 500 }}>Submissions</Typography>
          <Typography sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
            {gradedCount} / {totalSubs} graded
          </Typography>
        </Box>

        {totalSubs > 0 && (
          <Box sx={{ mb: 2.5 }}>
            <LinearProgress
              variant="determinate" value={gradePct}
              color={isOverdue ? "error" : "success"}
              sx={{ height: 5, borderRadius: 3 }}
            />
            <Typography sx={{ fontSize: "11px", color: "var(--color-text-secondary)", mt: 0.5 }}>
              {gradePct}% graded
            </Typography>
          </Box>
        )}

        {totalSubs === 0 && (
          <Typography sx={{ fontSize: "13px", color: "var(--color-text-secondary)", textAlign: "center", py: 4 }}>
            No submissions yet
          </Typography>
        )}

        {submissions.map((sub, i) => {
          const isGraded = sub.marks != null;
          const pct = isGraded ? (sub.marks / maxMarks) * 100 : null;
          const chipColor = pct === null ? null
            : pct < 40 ? "var(--color-text-danger)"
            : pct < 60 ? "var(--color-text-warning)"
            : "var(--color-text-success)";
          const chipBg = pct === null ? null
            : pct < 40 ? "var(--color-background-danger)"
            : pct < 60 ? "var(--color-background-warning)"
            : "var(--color-background-success)";
          const studentName = sub.studentId?.name || sub.studentId?.username || "Student";
          return (
            <Box key={sub._id}>
              {i > 0 && <Divider sx={{ my: 0.75 }} />}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.5 }}>
                <Avatar sx={{
                  width: 32, height: 32, fontSize: "12px",
                  bgcolor: isGraded ? chipBg : "var(--color-background-secondary)",
                  color: isGraded ? chipColor : "var(--color-text-secondary)",
                }}>
                  {getInitials(studentName)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: "13px", fontWeight: 500 }} noWrap>{studentName}</Typography>
                  <Typography sx={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>
                    {sub.submittedAt ? dayjs(sub.submittedAt).format("MMM D, h:mm A") : "—"}
                  </Typography>
                </Box>
                {isGraded ? (
                  <Chip
                    label={`${sub.marks} / ${maxMarks}${pct < 40 ? " · Fail" : ""}`}
                    size="small"
                    sx={{ height: 22, fontSize: "11px", fontWeight: 600, bgcolor: chipBg, color: chipColor }}
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

      {/* Delete confirm dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth
        slotProps={{ paper: { sx: { borderRadius: "var(--border-radius-lg)" } } }}>
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 500 }}>Delete Assignment?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "13px" }}>
            "{assignment.title}" and all its submissions will be permanently deleted. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting}
            sx={{ textTransform: "none" }}>
            {deleting ? <CircularProgress size={16} color="inherit" /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
