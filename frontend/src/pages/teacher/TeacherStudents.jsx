import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Avatar,
  InputBase,
  Skeleton,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import { useSelector } from "react-redux";
import { useGetClassesQuery } from "@/store/api/classApi";
import { useGetStudentsQuery } from "@/store/api/studentApi";

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

export default function TeacherStudents() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const [classId, setClassId] = useState("");
  const [search, setSearch] = useState("");

  const { data: classes } = useGetClassesQuery({ schoolId: user?.schoolId });
  const { data: students = [], isLoading: loadingStudents } =
    useGetStudentsQuery(classId ? { classId } : undefined, { skip: !classId });

  const selectedClass = (classes || []).find((c) => c._id === classId);
  const classLabel = selectedClass
    ? `Class ${selectedClass.grade} ${selectedClass.section || ""}`
    : "";

  const filtered = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.rollNumber?.toString().includes(q),
    );
  }, [students, search]);

  // Attendance summary
  const attSummary = useMemo(() => {
    const withAtt = students.filter((s) => s.attendancePercent != null);
    if (!withAtt.length) return null;
    const avg = Math.round(
      withAtt.reduce((sum, s) => sum + s.attendancePercent, 0) / withAtt.length,
    );
    const low = withAtt.filter((s) => s.attendancePercent < 75).length;
    return { avg, low, total: students.length };
  }, [students]);

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: "22px", fontWeight: 500, mb: 0.25 }}>
            Students
          </Typography>
          <Typography
            sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
            {classLabel
              ? `${classLabel} · ${students.length} student${students.length !== 1 ? "s" : ""}`
              : "Select a class to view students"}
          </Typography>
        </Box>
      </Box>

      {/* Controls */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <FormControl sx={{ minWidth: 180 }}>
          <Select
            value={classId}
            displayEmpty
            size="small"
            onChange={(e) => {
              setClassId(e.target.value);
              setSearch("");
            }}
            sx={{ bgcolor: "var(--color-background-primary)" }}
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: "var(--border-radius-md)",
              px: 1.5,
              height: 40,
              ml: "auto",
              minWidth: 220,
            }}
          >
            <SearchOutlinedIcon
              sx={{ fontSize: 18, color: "var(--color-text-secondary)" }}
            />
            <InputBase
              placeholder="Search by name or roll…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ fontSize: "13px", flex: 1 }}
            />
          </Box>
        )}
      </Box>

      {/* Summary stats */}
      {classId && attSummary && (
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Box
            sx={{
              flex: 1,
              bgcolor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: "var(--border-radius-lg)",
              py: 1.5,
              px: 2,
              display: "flex",
              gap: 4,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "var(--color-text-secondary)",
                  mb: 0.25,
                }}
              >
                Total students
              </Typography>
              <Typography sx={{ fontSize: "16px", fontWeight: 600 }}>
                {attSummary.total}
              </Typography>
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "var(--color-text-secondary)",
                  mb: 0.25,
                }}
              >
                Avg attendance
              </Typography>
              <Typography
                sx={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color:
                    attSummary.avg >= 75
                      ? "var(--color-text-success)"
                      : "var(--color-text-warning)",
                }}
              >
                {attSummary.avg}%
              </Typography>
            </Box>
            {attSummary.low > 0 && (
              <Box>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "var(--color-text-secondary)",
                    mb: 0.25,
                  }}
                >
                  Need attention
                </Typography>
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "var(--color-text-danger)",
                  }}
                >
                  {attSummary.low}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Loading */}
      {classId && loadingStudents && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={64}
              sx={{ borderRadius: "var(--border-radius-md)" }}
            />
          ))}
        </Box>
      )}

      {/* Student list */}
      {classId && !loadingStudents && filtered.length > 0 && (
        <Box
          sx={{
            bgcolor: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
          }}
        >
          {/* List header */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 100px",
              px: 2.5,
              py: 1,
              borderBottom: "0.5px solid var(--color-border-tertiary)",
            }}
          >
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--color-text-secondary)",
              }}
            >
              Name
              {search
                ? ` · ${filtered.length} result${filtered.length !== 1 ? "s" : ""}`
                : ""}
            </Typography>
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--color-text-secondary)",
                textAlign: "right",
              }}
            >
              Attendance
            </Typography>
          </Box>

          {filtered.map((s, i) => {
            const pct = s.attendancePercent ?? null;
            const attColor =
              pct === null
                ? "var(--color-text-secondary)"
                : pct >= 90
                  ? "var(--color-text-success)"
                  : pct >= 75
                    ? "var(--color-text-warning)"
                    : "var(--color-text-danger)";
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
                    i < filtered.length - 1
                      ? "0.5px solid var(--color-border-tertiary)"
                      : "none",
                  "&:hover": { bgcolor: "var(--color-background-secondary)" },
                  transition: "background-color 0.1s",
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    fontSize: 13,
                    fontWeight: 500,
                    bgcolor: bgColor,
                  }}
                >
                  {initials}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                      {s.name}
                    </Typography>
                    {pct !== null && pct < 75 && (
                      <Box
                        component="span"
                        sx={{
                          fontSize: "10px",
                          fontWeight: 500,
                          px: 0.75,
                          py: 0.25,
                          borderRadius: "4px",
                          bgcolor: "var(--color-background-danger)",
                          color: "var(--color-text-danger)",
                        }}
                      >
                        Low attendance
                      </Box>
                    )}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    Roll {s.rollNumber || String(i + 1).padStart(2, "0")}
                    {s.parentPhone && ` · ${s.parentPhone}`}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right", flexShrink: 0, minWidth: 60 }}>
                  <Typography
                    sx={{ fontSize: "14px", fontWeight: 600, color: attColor }}
                  >
                    {pct !== null ? `${pct}%` : "—"}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Search no results */}
      {classId && !loadingStudents && filtered.length === 0 && search && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography
            sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
            No students matching "{search}"
          </Typography>
        </Box>
      )}

      {/* Empty class */}
      {classId && !loadingStudents && students.length === 0 && (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography
            sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
            No students in this class
          </Typography>
        </Box>
      )}

      {/* No class selected */}
      {!classId && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <PeopleOutlinedIcon
            sx={{
              fontSize: 48,
              color: "var(--color-text-secondary)",
              mb: 1.5,
              opacity: 0.4,
            }}
          />
          <Typography sx={{ fontSize: "14px", fontWeight: 500, mb: 0.5 }}>
            Select a class
          </Typography>
          <Typography
            sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
            Choose a class from above to view students
          </Typography>
        </Box>
      )}
    </Box>
  );
}
