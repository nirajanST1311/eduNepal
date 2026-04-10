import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  Select,
  MenuItem,
  Avatar,
  Chip,
  IconButton,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useSelector } from "react-redux";
import { useGetClassesQuery } from "@/store/api/classApi";
import { useGetStudentsQuery } from "@/store/api/studentApi";

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

export default function TeacherStudents() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const [classId, setClassId] = useState("");
  const { data: classes } = useGetClassesQuery({ schoolId: user?.schoolId });
  const { data: students = [] } = useGetStudentsQuery(
    classId ? { classId } : undefined,
    { skip: !classId },
  );

  const selectedClass = (classes || []).find((c) => c._id === classId);
  const classLabel = selectedClass
    ? `Class ${selectedClass.grade} ${selectedClass.section}`
    : "";

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ mb: 0.25 }}>
            Students
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {classLabel
              ? `${classLabel} · ${students.length} students`
              : "Select a class"}
          </Typography>
        </Box>
        <IconButton size="small">
          <MoreHorizIcon />
        </IconButton>
      </Box>

      <FormControl sx={{ minWidth: 200, mb: 3 }}>
        <Select
          value={classId}
          displayEmpty
          onChange={(e) => setClassId(e.target.value)}
          sx={{ bgcolor: "#fff" }}
        >
          <MenuItem value="" disabled>
            Select class
          </MenuItem>
          {(classes || []).map((c) => (
            <MenuItem key={c._id} value={c._id}>
              Class {c.grade} {c.section}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {classId && students.length > 0 && (
        <Card>
          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
            {students.map((s, i) => {
              const pct = s.attendancePercent ?? null;
              const low = pct !== null && pct < 75;
              const attColor =
                pct === null
                  ? "text.secondary"
                  : pct >= 90
                    ? "#16a34a"
                    : pct >= 75
                      ? "#d97706"
                      : "#dc2626";
              const initials = getInitials(s.name);
              const bgColor = getColor(s.name);
              return (
                <Box
                  key={s._id}
                  onClick={() => navigate(`/teacher/students/${s._id}`)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    px: 2.5,
                    py: 1.5,
                    cursor: "pointer",
                    borderBottom:
                      i < students.length - 1
                        ? "1px solid rgba(0,0,0,0.05)"
                        : "none",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.015)" },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      fontSize: 14,
                      fontWeight: 600,
                      bgcolor: bgColor,
                    }}
                  >
                    {initials}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {s.name}
                      </Typography>
                      {low && (
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
                    <Typography variant="caption" color="text.secondary">
                      Roll {s.rollNumber || String(i + 1).padStart(2, "0")} ·{" "}
                      {classLabel}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{ color: attColor }}
                    >
                      {pct !== null ? `${pct}%` : "—"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Attendance
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </CardContent>
        </Card>
      )}

      {classId && students.length === 0 && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", py: 6 }}
        >
          No students in this class
        </Typography>
      )}

      {!classId && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", py: 6 }}
        >
          Select a class to view students
        </Typography>
      )}
    </Box>
  );
}
