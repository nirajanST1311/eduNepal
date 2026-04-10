import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
  TextField,
  Button,
  Chip,
  LinearProgress,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIosNew";
import {
  useGetStudentOverviewQuery,
  useAddStudentNoteMutation,
} from "@/store/api/studentApi";
import StatCard from "@/components/common/StatCard";
import dayjs from "dayjs";

const avatarColors = [
  "#2563eb",
  "#059669",
  "#7c3aed",
  "#0891b2",
  "#be185d",
  "#d97706",
  "#dc2626",
];
function getColor(name) {
  let h = 0;
  for (let i = 0; i < (name || "").length; i++)
    h = name.charCodeAt(i) + ((h << 5) - h);
  return avatarColors[Math.abs(h) % avatarColors.length];
}
function getInitials(name) {
  if (!name) return "";
  const parts = name.split(" ");
  return parts.length > 1
    ? parts[0][0] + parts[parts.length - 1][0]
    : parts[0][0];
}

export default function TeacherStudentDetail() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useGetStudentOverviewQuery(studentId);
  const [addNote, { isLoading: noting }] = useAddStudentNoteMutation();
  const [note, setNote] = useState("");

  if (isLoading) return <Typography>Loading…</Typography>;
  if (!data) return <Typography>Student not found.</Typography>;

  const {
    student,
    attendance = {},
    assignments = [],
    avgScore,
    notes = [],
    topicEngagement = [],
    recentActivity = [],
    monthlyAttendance = {},
  } = data;

  const attPct =
    typeof attendance === "number" ? attendance : attendance?.percent;
  const isLow = attPct != null && attPct < 75;
  const assignmentsDone = Array.isArray(assignments)
    ? `${assignments.filter((a) => a.submitted || a.status === "graded").length}/${assignments.length}`
    : "—";

  const handleAddNote = async () => {
    if (!note.trim()) return;
    await addNote({ id: studentId, text: note }).unwrap();
    setNote("");
  };

  const calDays = ["M", "T", "W", "T", "F", "S", "S"];
  const monthData = monthlyAttendance?.days || [];

  return (
    <Box>
      {/* Back link */}
      <Button
        startIcon={<ArrowBackIcon sx={{ fontSize: 14 }} />}
        onClick={() => navigate("/teacher/students")}
        sx={{ mb: 2, color: "text.secondary", fontSize: "0.85rem" }}
      >
        Back to students
      </Button>

      {/* Student header */}
      <Card sx={{ mb: 3 }}>
        <CardContent
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 2.5,
            flexWrap: "wrap",
          }}
        >
          <Avatar
            sx={{
              width: 56,
              height: 56,
              fontSize: 20,
              fontWeight: 600,
              bgcolor: getColor(student.name),
            }}
          >
            {getInitials(student.name)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
            >
              <Typography variant="h6">{student.name}</Typography>
              {isLow && (
                <Chip
                  label="Needs attention"
                  size="small"
                  sx={{
                    bgcolor: "#fef3c7",
                    color: "#92400e",
                    fontWeight: 500,
                    fontSize: "0.65rem",
                    height: 20,
                  }}
                />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">
              Roll No. {student.rollNumber || "—"} · Class {student.grade || ""}
              {student.section || ""} · {student.schoolName || ""}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Enrolled:{" "}
              {student.enrolledAt
                ? dayjs(student.enrolledAt).format("MMM YYYY")
                : "—"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="outlined" size="small">
              Send notice
            </Button>
            <Button variant="outlined" size="small">
              View all submissions
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Stat cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 2,
          mb: 3,
        }}
      >
        <StatCard
          label="Attendance"
          value={attPct != null ? `${attPct}%` : "—"}
          color={isLow ? "#dc2626" : undefined}
        />
        <StatCard label="Assignments done" value={assignmentsDone} />
        <StatCard
          label="Avg score"
          value={avgScore != null ? `${avgScore}%` : "—"}
        />
        <StatCard
          label={`Days absent (${dayjs().format("MMM")})`}
          value={monthlyAttendance?.absentDays ?? "—"}
        />
      </Box>

      {/* Attendance calendar + Topic engagement */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1.5,
                }}
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  Attendance — {dayjs().format("MMMM")}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: isLow ? "#dc2626" : "#16a34a",
                    fontStyle: "italic",
                  }}
                >
                  {attPct != null ? `${attPct}% present` : ""}
                </Typography>
              </Box>
              {/* Calendar header */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: 0.5,
                  mb: 0.5,
                }}
              >
                {calDays.map((d, i) => (
                  <Typography
                    key={i}
                    variant="caption"
                    align="center"
                    fontWeight={500}
                    color="text.secondary"
                  >
                    {d}
                  </Typography>
                ))}
              </Box>
              {/* Calendar grid */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: 0.5,
                }}
              >
                {monthData.map((d, i) => {
                  const bg =
                    d === "P"
                      ? "#dcfce7"
                      : d === "A"
                        ? "#fecaca"
                        : d === "H"
                          ? "#fef3c7"
                          : "transparent";
                  const color =
                    d === "P"
                      ? "#16a34a"
                      : d === "A"
                        ? "#dc2626"
                        : d === "H"
                          ? "#d97706"
                          : "transparent";
                  return (
                    <Box
                      key={i}
                      sx={{
                        width: "100%",
                        aspectRatio: "1",
                        borderRadius: 0.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: bg,
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        color,
                      }}
                    >
                      {d || ""}
                    </Box>
                  );
                })}
              </Box>
              {monthData.length > 0 && (
                <Box sx={{ display: "flex", gap: 2, mt: 1.5 }}>
                  {[
                    ["Present", "#dcfce7"],
                    ["Absent", "#fecaca"],
                    ["Holiday", "#fef3c7"],
                  ].map(([l, c]) => (
                    <Box
                      key={l}
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: 0.5,
                          bgcolor: c,
                        }}
                      />
                      <Typography variant="caption" fontSize="0.65rem">
                        {l}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                Topic engagement
              </Typography>
              {topicEngagement.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No topic data available
                </Typography>
              )}
              {topicEngagement.map((t, i) => (
                <Box key={i} sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body2" fontSize="0.8rem">
                      {t.name}
                    </Typography>
                    <Typography variant="caption" fontWeight={500}>
                      {t.percent}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={t.percent}
                    sx={{
                      bgcolor: "rgba(0,0,0,0.06)",
                      "& .MuiLinearProgress-bar": {
                        bgcolor:
                          t.percent >= 60
                            ? "#16a34a"
                            : t.percent >= 30
                              ? "#d97706"
                              : "#dc2626",
                      },
                    }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Assignments */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
            Assignments
          </Typography>
          {assignments.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No assignments yet
            </Typography>
          )}
          {assignments.map((a, i) => {
            const statusColor =
              a.status === "graded"
                ? "#16a34a"
                : a.status === "late"
                  ? "#dc2626"
                  : a.status === "missing"
                    ? "#dc2626"
                    : "#64748b";
            const statusLabel =
              a.status === "graded"
                ? "Graded"
                : a.status === "late"
                  ? "Late"
                  : a.status === "missing"
                    ? "Missing"
                    : a.status || "";
            return (
              <Box
                key={a._id || i}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 1.2,
                  borderBottom:
                    i < assignments.length - 1
                      ? "1px solid rgba(0,0,0,0.05)"
                      : "none",
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    {a.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {a.submittedAt
                      ? `Submitted ${dayjs(a.submittedAt).format("MMM D")}`
                      : a.dueDate
                        ? `Due ${dayjs(a.dueDate).format("MMM D")}`
                        : ""}
                    {a.daysLate ? ` · ${a.daysLate} days late` : ""}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  {a.score != null && (
                    <Typography variant="body2" fontWeight={600}>
                      {a.score}/{a.total || 20}
                    </Typography>
                  )}
                  {statusLabel && (
                    <Typography
                      variant="caption"
                      fontWeight={500}
                      sx={{ color: statusColor }}
                    >
                      {statusLabel}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </CardContent>
      </Card>

      {/* Recent activity + Teacher's note */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                Recent activity
              </Typography>
              {recentActivity.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No recent activity
                </Typography>
              )}
              {recentActivity.map((a, i) => (
                <Box key={i} sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      bgcolor: "#64748b",
                      mt: 0.7,
                      flexShrink: 0,
                    }}
                  />
                  <Box>
                    <Typography variant="body2" fontSize="0.8rem">
                      {a.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {a.date}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                Teacher's note
              </Typography>
              {notes.map((n) => (
                <Box
                  key={n._id}
                  sx={{
                    borderLeft: "3px solid #d97706",
                    pl: 1.5,
                    py: 0.5,
                    mb: 1.5,
                    bgcolor: "#fffbeb",
                    borderRadius: "0 4px 4px 0",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontStyle: "italic",
                      fontSize: "0.8rem",
                      color: "#78350f",
                    }}
                  >
                    "{n.text}"
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Added {dayjs(n.createdAt).format("MMM D")}
                  </Typography>
                </Box>
              ))}
              <TextField
                size="small"
                fullWidth
                placeholder="Add a note about this student..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                multiline
                minRows={2}
                sx={{ mt: 1, mb: 1 }}
              />
              <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                <Button
                  size="small"
                  onClick={() => setNote("")}
                  disabled={!note.trim()}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAddNote}
                  disabled={noting || !note.trim()}
                >
                  Save note
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
