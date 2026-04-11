import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  Grid,
  TextField,
  Button,
  LinearProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIosNew";
import {
  useGetStudentOverviewQuery,
  useAddStudentNoteMutation,
} from "@/store/api/studentApi";
import StatCard from "@/components/common/StatCard";
import dayjs from "dayjs";

const avatarColors = [
  "var(--color-text-info)",
  "var(--color-text-success)",
  "#7c3aed",
  "#0891b2",
  "#be185d",
  "var(--color-text-warning)",
  "var(--color-text-danger)",
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
    monthlyAttendance = {},
    topicEngagement = [],
    doneCount = 0,
    totalAssignments = 0,
  } = data;

  const attPct = attendance?.percentage ?? null;
  const isLow = attPct != null && attPct < 75;
  const assignmentsDone = `${doneCount}/${totalAssignments}`;

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
        sx={{ mb: 2, color: "var(--color-text-secondary)", fontSize: "13px" }}
      >
        Back to students
      </Button>

      {/* Student header */}
      <Box
        sx={{
          bgcolor: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          mb: 3,
          p: 2,
        }}
      >
        <Box
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
              fontWeight: 500,
              bgcolor: getColor(student.name),
            }}
          >
            {getInitials(student.name)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
            >
              <Typography sx={{ fontSize: "18px", fontWeight: 500 }}>
                {student.name}
              </Typography>
              {isLow && (
                <Box
                  component="span"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    bgcolor: "var(--color-background-warning)",
                    color: "var(--color-text-warning)",
                    fontWeight: 500,
                    fontSize: "11px",
                  }}
                >
                  Needs attention
                </Box>
              )}
            </Box>
            <Typography
              sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
            >
              Roll No. {student.rollNumber || "—"} · Class {student.grade || ""}
              {student.section ? ` ${student.section}` : ""}
              {student.schoolName ? ` · ${student.schoolName}` : ""}
            </Typography>
            <Typography
              sx={{ fontSize: "12px", color: "var(--color-text-secondary)" }}
            >
              {student.email || ""}
              {student.phone ? ` · ${student.phone}` : ""}
              {student.enrolledAt
                ? ` · Enrolled ${dayjs(student.enrolledAt).format("MMM YYYY")}`
                : ""}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}></Box>
        </Box>
      </Box>

      {/* Stat cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <StatCard
          label="Attendance"
          value={attPct != null ? `${attPct}%` : "—"}
          color={isLow ? "var(--color-text-danger)" : undefined}
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
          <Box
            sx={{
              bgcolor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: "var(--border-radius-lg)",
              height: "100%",
              p: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 1.5,
              }}
            >
              <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                Attendance — {dayjs().format("MMMM")}
              </Typography>
              <Typography
                sx={{
                  fontSize: "12px",
                  color: isLow
                    ? "var(--color-text-danger)"
                    : "var(--color-text-success)",
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
                  sx={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "var(--color-text-secondary)",
                    textAlign: "center",
                  }}
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
                    ? "var(--color-background-success)"
                    : d === "A"
                      ? "var(--color-background-danger)"
                      : d === "H"
                        ? "var(--color-background-warning)"
                        : "transparent";
                const color =
                  d === "P"
                    ? "var(--color-text-success)"
                    : d === "A"
                      ? "var(--color-text-danger)"
                      : d === "H"
                        ? "var(--color-text-warning)"
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
                      fontWeight: 500,
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
                  ["Present", "var(--color-background-success)"],
                  ["Absent", "var(--color-background-danger)"],
                  ["Holiday", "var(--color-background-warning)"],
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
                    <Typography sx={{ fontSize: "11px" }}>{l}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              bgcolor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: "var(--border-radius-lg)",
              height: "100%",
              p: 2,
            }}
          >
            <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 2 }}>
              Topic engagement
            </Typography>
            {topicEngagement.length === 0 && (
              <Typography
                sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
              >
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
                  <Typography sx={{ fontSize: "13px" }}>{t.name}</Typography>
                  <Typography sx={{ fontSize: "12px", fontWeight: 500 }}>
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
                          ? "var(--color-text-success)"
                          : t.percent >= 30
                            ? "var(--color-text-warning)"
                            : "var(--color-text-danger)",
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>

      {/* Assignments */}
      <Box
        sx={{
          bgcolor: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          mb: 3,
          p: 2,
        }}
      >
        <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 2 }}>
          Assignments
        </Typography>
        {assignments.length === 0 && (
          <Typography
            sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
            No assignments yet
          </Typography>
        )}
        {assignments.map((a, i) => {
          const sub = a.submission;
          const hasSubmitted = !!sub;
          const isPastDue = a.dueDate && dayjs(a.dueDate).isBefore(dayjs());
          const statusLabel = sub
            ? sub.marks != null
              ? "Graded"
              : sub.late
                ? "Late"
                : "Submitted"
            : isPastDue
              ? "Missing"
              : "Pending";
          const statusColor =
            statusLabel === "Graded"
              ? "var(--color-text-success)"
              : statusLabel === "Missing" || statusLabel === "Late"
                ? "var(--color-text-danger)"
                : "var(--color-text-secondary)";
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
                    ? "0.5px solid var(--color-border-tertiary)"
                    : "none",
              }}
            >
              <Box>
                <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                  {a.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {a.subject ? `${a.subject} · ` : ""}
                  {sub?.submittedAt
                    ? `Submitted ${dayjs(sub.submittedAt).format("MMM D")}`
                    : a.dueDate
                      ? `Due ${dayjs(a.dueDate).format("MMM D")}`
                      : ""}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                {hasSubmitted && sub.marks != null && (
                  <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                    {sub.marks}/{a.maxMarks || "—"}
                  </Typography>
                )}
                <Typography
                  sx={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: statusColor,
                  }}
                >
                  {statusLabel}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Teacher's notes */}
      <Box
        sx={{
          bgcolor: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          p: 2,
        }}
      >
        <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 2 }}>
          Teacher&apos;s Notes
        </Typography>
        {notes.map((n) => (
          <Box
            key={n._id}
            sx={{
              borderLeft: "3px solid var(--color-text-warning)",
              pl: 1.5,
              py: 0.5,
              mb: 1.5,
              bgcolor: "var(--color-background-warning)",
              borderRadius: "0 4px 4px 0",
            }}
          >
            <Typography
              sx={{
                fontStyle: "italic",
                fontSize: "13px",
                color: "var(--color-text-warning)",
              }}
            >
              "{n.content}"
            </Typography>
            <Typography
              sx={{
                fontSize: "12px",
                color: "var(--color-text-secondary)",
              }}
            >
              Added {n.teacherId?.name ? `by ${n.teacherId.name} · ` : ""}
              {dayjs(n.createdAt).format("MMM D")}
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
      </Box>
    </Box>
  );
}
