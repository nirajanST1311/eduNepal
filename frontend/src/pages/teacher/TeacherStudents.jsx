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
  LinearProgress,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
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

/* ─── Class card for landing page ─── */
function ClassStudentCard({ cls, onSelect }) {
  const { data: classStudents = [] } = useGetStudentsQuery(
    { classId: cls._id },
    { skip: !cls._id },
  );
  const total = classStudents.length;
  const withAtt = classStudents.filter((s) => s.attendancePercent != null);
  const avgPct =
    withAtt.length > 0
      ? Math.round(
          withAtt.reduce((sum, s) => sum + s.attendancePercent, 0) /
            withAtt.length,
        )
      : null;
  const lowCount = withAtt.filter((s) => s.attendancePercent < 75).length;

  return (
    <Box
      onClick={() => onSelect(cls._id)}
      sx={{
        bgcolor: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-lg)",
        p: 2.5,
        cursor: "pointer",
        transition: "all 0.15s",
        "&:hover": {
          borderColor: "var(--color-brand)",
          bgcolor: "var(--color-background-secondary)",
        },
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "var(--border-radius-md)",
              bgcolor: "var(--color-background-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SchoolOutlinedIcon
              sx={{ fontSize: 20, color: "var(--color-text-secondary)" }}
            />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
              Class {cls.grade} {cls.section}
            </Typography>
            <Typography
              sx={{
                fontSize: "12px",
                color: "var(--color-text-secondary)",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <GroupsOutlinedIcon sx={{ fontSize: 14 }} />
              {total} student{total !== 1 ? "s" : ""}
            </Typography>
          </Box>
        </Box>
        <ArrowForwardIcon
          sx={{ fontSize: 18, color: "var(--color-text-secondary)", mt: 0.5 }}
        />
      </Box>

      {/* Stats row */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        {avgPct != null && (
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 0.5,
              }}
            >
              <Typography
                sx={{ fontSize: "11px", color: "var(--color-text-secondary)" }}
              >
                Avg attendance
              </Typography>
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color:
                    avgPct >= 80
                      ? "var(--color-text-success)"
                      : avgPct >= 50
                        ? "var(--color-text-warning)"
                        : "var(--color-text-danger)",
                }}
              >
                {avgPct}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={avgPct}
              sx={{
                height: 4,
                borderRadius: 2,
                bgcolor: "var(--color-background-secondary)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 2,
                  bgcolor:
                    avgPct >= 80
                      ? "#059669"
                      : avgPct >= 50
                        ? "#d97706"
                        : "#dc2626",
                },
              }}
            />
          </Box>
        )}
        {lowCount > 0 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              bgcolor: "rgba(220, 38, 38, 0.06)",
              borderRadius: "var(--border-radius-md)",
              px: 1,
              py: 0.5,
              flexShrink: 0,
            }}
          >
            <WarningAmberOutlinedIcon
              sx={{ fontSize: 13, color: "var(--color-text-danger)" }}
            />
            <Typography
              sx={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--color-text-danger)",
              }}
            >
              {lowCount}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default function TeacherStudents() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const [classId, setClassId] = useState("");
  const [search, setSearch] = useState("");

  const { data: allClasses } = useGetClassesQuery({ schoolId: user?.schoolId });
  const classes = useMemo(
    () =>
      (allClasses || []).filter((c) =>
        user?.classIds?.length ? user.classIds.includes(c._id) : true,
      ),
    [allClasses, user?.classIds],
  );
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
              gridTemplateColumns: "1fr 120px",
              px: 2.5,
              py: 1,
              borderBottom: "0.5px solid var(--color-border-tertiary)",
              bgcolor: "var(--color-background-secondary)",
            }}
          >
            <Typography
              sx={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--color-text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Student
              {search
                ? ` · ${filtered.length} result${filtered.length !== 1 ? "s" : ""}`
                : ` (${filtered.length})`}
            </Typography>
            <Typography
              sx={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--color-text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
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
            const barColor =
              pct === null
                ? "#ccc"
                : pct >= 90
                  ? "#059669"
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
                    i < filtered.length - 1
                      ? "0.5px solid var(--color-border-tertiary)"
                      : "none",
                  "&:hover": { bgcolor: "var(--color-background-secondary)" },
                  transition: "background-color 0.1s",
                }}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    fontSize: 14,
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
                    {s.phone ? ` · ${s.phone}` : ""}
                    {s.email ? ` · ${s.email}` : ""}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right", flexShrink: 0, minWidth: 80 }}>
                  <Typography
                    sx={{ fontSize: "14px", fontWeight: 600, color: attColor }}
                  >
                    {pct !== null ? `${pct}%` : "—"}
                  </Typography>
                  {pct !== null && (
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{
                        height: 3,
                        borderRadius: 2,
                        mt: 0.5,
                        bgcolor: "var(--color-background-secondary)",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 2,
                          bgcolor: barColor,
                        },
                      }}
                    />
                  )}
                  {pct !== null && s.totalDays > 0 && (
                    <Typography
                      sx={{
                        fontSize: "10px",
                        color: "var(--color-text-secondary)",
                        mt: 0.25,
                      }}
                    >
                      {s.totalPresent}/{s.totalDays} days
                    </Typography>
                  )}
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

      {/* No class selected — overview landing */}
      {!classId && (
        <Box>
          {/* Summary cards */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 2,
              mb: 3,
            }}
          >
            <Box
              sx={{
                bgcolor: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: "var(--border-radius-lg)",
                p: 2,
              }}
            >
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "var(--color-text-secondary)",
                  mb: 0.5,
                }}
              >
                Your Classes
              </Typography>
              <Typography sx={{ fontSize: "22px", fontWeight: 600 }}>
                {classes.length}
              </Typography>
            </Box>
            <Box
              sx={{
                bgcolor: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: "var(--border-radius-lg)",
                p: 2,
              }}
            >
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "var(--color-text-secondary)",
                  mb: 0.5,
                }}
              >
                Role
              </Typography>
              <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
                Class Teacher
              </Typography>
            </Box>
          </Box>

          {/* Section header */}
          <Typography
            sx={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              mb: 1.5,
            }}
          >
            Select a class to view students
          </Typography>

          {/* Class cards */}
          {classes.length > 0 ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                },
                gap: 2,
              }}
            >
              {classes.map((c) => (
                <ClassStudentCard
                  key={c._id}
                  cls={c}
                  onSelect={(id) => {
                    setClassId(id);
                    setSearch("");
                  }}
                />
              ))}
            </Box>
          ) : (
            <Box
              sx={{
                textAlign: "center",
                py: 6,
                bgcolor: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: "var(--border-radius-lg)",
              }}
            >
              <PeopleOutlinedIcon
                sx={{
                  fontSize: 40,
                  color: "var(--color-text-secondary)",
                  mb: 1,
                  opacity: 0.4,
                }}
              />
              <Typography
                sx={{
                  fontSize: "13px",
                  color: "var(--color-text-secondary)",
                }}
              >
                No classes assigned yet
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
