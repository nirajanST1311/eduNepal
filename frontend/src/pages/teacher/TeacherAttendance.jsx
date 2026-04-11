import { useState, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Button,
  IconButton,
  Snackbar,
  Alert,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  InputBase,
  Tabs,
  Tab,
} from "@mui/material";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { useGetClassesQuery } from "@/store/api/classApi";
import { useGetStudentsQuery } from "@/store/api/studentApi";
import {
  useMarkAttendanceMutation,
  useGetAttendanceQuery,
} from "@/store/api/attendanceApi";

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri"];

function getWeekDates(referenceDate) {
  const d = dayjs(referenceDate);
  const dow = d.day();
  const mon = d.subtract(dow === 0 ? 6 : dow - 1, "day");
  return Array.from({ length: 5 }, (_, i) =>
    mon.add(i, "day").format("YYYY-MM-DD"),
  );
}

/* ─── Student attendance row for "Take Attendance" tab ─── */
function StudentRow({ student, status, onToggle }) {
  const isPresent = status === "P";
  const isAbsent = status === "A";
  return (
    <Box
      onClick={onToggle}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        px: 2.5,
        py: 1.25,
        cursor: "pointer",
        borderBottom: "0.5px solid var(--color-border-tertiary)",
        transition: "background-color 0.1s",
        bgcolor: isAbsent ? "rgba(220, 38, 38, 0.04)" : "transparent",
        "&:hover": { bgcolor: "var(--color-background-secondary)" },
        "&:last-child": { borderBottom: "none" },
        userSelect: "none",
      }}
    >
      {/* Avatar / roll */}
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          bgcolor: "var(--color-background-secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Typography
          sx={{
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--color-text-secondary)",
          }}
        >
          {student.rollNumber || "–"}
        </Typography>
      </Box>

      {/* Name */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
          {student.name}
        </Typography>
      </Box>

      {/* Toggle pill */}
      <Box
        sx={{
          display: "flex",
          borderRadius: "20px",
          overflow: "hidden",
          border: "1px solid var(--color-border-tertiary)",
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 0.5,
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s",
            bgcolor: isPresent ? "#059669" : "transparent",
            color: isPresent ? "#fff" : "var(--color-text-secondary)",
            "&:hover": !isPresent
              ? { bgcolor: "var(--color-background-secondary)" }
              : {},
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (!isPresent) onToggle();
          }}
        >
          Present
        </Box>
        <Box
          sx={{
            px: 2,
            py: 0.5,
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s",
            bgcolor: isAbsent ? "#dc2626" : "transparent",
            color: isAbsent ? "#fff" : "var(--color-text-secondary)",
            borderLeft: "1px solid var(--color-border-tertiary)",
            "&:hover": !isAbsent
              ? { bgcolor: "var(--color-background-secondary)" }
              : {},
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (!isAbsent) onToggle();
          }}
        >
          Absent
        </Box>
      </Box>
    </Box>
  );
}

/* ─── Class overview card for landing page ─── */
function ClassOverviewCard({ cls, onSelect }) {
  const todayStr = dayjs().format("YYYY-MM-DD");
  const { data: todayAtt } = useGetAttendanceQuery(
    { classId: cls._id, date: todayStr },
    { skip: !cls._id },
  );
  const { data: classStudents = [] } = useGetStudentsQuery(
    { classId: cls._id },
    { skip: !cls._id },
  );
  const totalStudents = classStudents.length;
  const isMarked = todayAtt?.records?.length > 0;
  const presentCount = isMarked
    ? todayAtt.records.filter((r) => r.status === "P").length
    : 0;
  const absentCount = isMarked ? todayAtt.records.length - presentCount : 0;
  const pct =
    isMarked && todayAtt.records.length > 0
      ? Math.round((presentCount / todayAtt.records.length) * 100)
      : null;

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
      {/* Top row */}
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
              {totalStudents} student{totalStudents !== 1 ? "s" : ""}
            </Typography>
          </Box>
        </Box>
        <ArrowForwardIcon
          sx={{ fontSize: 18, color: "var(--color-text-secondary)", mt: 0.5 }}
        />
      </Box>

      {/* Status */}
      {isMarked ? (
        <Box>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <CheckCircleOutlinedIcon
                sx={{ fontSize: 14, color: "var(--color-text-success)" }}
              />
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--color-text-success)",
                }}
              >
                Marked
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: "11px",
                fontWeight: 600,
                color:
                  pct >= 80
                    ? "var(--color-text-success)"
                    : pct >= 50
                      ? "var(--color-text-warning)"
                      : "var(--color-text-danger)",
              }}
            >
              {pct}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{
              height: 4,
              borderRadius: 2,
              bgcolor: "var(--color-background-secondary)",
              "& .MuiLinearProgress-bar": {
                borderRadius: 2,
                bgcolor:
                  pct >= 80 ? "#059669" : pct >= 50 ? "#d97706" : "#dc2626",
              },
            }}
          />
          <Box sx={{ display: "flex", gap: 2, mt: 0.75 }}>
            <Typography
              sx={{ fontSize: "11px", color: "var(--color-text-secondary)" }}
            >
              <Box
                component="span"
                sx={{ fontWeight: 600, color: "var(--color-text-success)" }}
              >
                {presentCount}
              </Box>{" "}
              P
            </Typography>
            <Typography
              sx={{ fontSize: "11px", color: "var(--color-text-secondary)" }}
            >
              <Box
                component="span"
                sx={{ fontWeight: 600, color: "var(--color-text-danger)" }}
              >
                {absentCount}
              </Box>{" "}
              A
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            bgcolor: "rgba(234, 179, 8, 0.08)",
            borderRadius: "var(--border-radius-md)",
            px: 1.5,
            py: 0.75,
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: "#d97706",
              flexShrink: 0,
            }}
          />
          <Typography
            sx={{
              fontSize: "11px",
              fontWeight: 500,
              color: "var(--color-text-warning)",
            }}
          >
            Not marked yet
          </Typography>
        </Box>
      )}
    </Box>
  );
}

/* ─── Badge for week grid ─── */
function AttendanceBadge({ status, onClick, editable }) {
  if (!status) {
    return (
      <Box
        onClick={onClick}
        sx={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          color: "var(--color-text-secondary)",
          cursor: editable ? "pointer" : "default",
        }}
      >
        ·
      </Box>
    );
  }
  const isPresent = status === "P";
  return (
    <Box
      onClick={onClick}
      sx={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: 500,
        bgcolor: isPresent
          ? "var(--color-background-success)"
          : "var(--color-background-danger)",
        color: isPresent
          ? "var(--color-text-success)"
          : "var(--color-text-danger)",
        cursor: editable ? "pointer" : "default",
        transition: "all 0.15s",
        "&:hover": editable ? { transform: "scale(1.1)" } : {},
      }}
    >
      {status}
    </Box>
  );
}

export default function TeacherAttendance() {
  const { user } = useSelector((s) => s.auth);
  const [classId, setClassId] = useState("");
  const realToday = dayjs();
  const todayStr = realToday.format("YYYY-MM-DD");
  const [weekOffset, setWeekOffset] = useState(0);
  const referenceDate = realToday.add(weekOffset * 7, "day");
  const weekDates = getWeekDates(referenceDate);
  const todayIdx = weekDates.indexOf(todayStr);
  const isCurrentWeek = weekOffset === 0;

  // editingDate: which date the "Take Attendance" tab edits (defaults to today)
  const [editingDate, setEditingDate] = useState(todayStr);
  const editingIdx = weekDates.indexOf(editingDate);
  const editingDayjs = dayjs(editingDate);
  const isFutureDate = editingDayjs.isAfter(realToday, "day");

  const [tab, setTab] = useState(0); // 0 = Take Attendance, 1 = Week View
  const [search, setSearch] = useState("");
  const [confirmDialog, setConfirmDialog] = useState(null); // { action: "present"|"absent" }
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  /* ─── data ─── */
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

  const sortedStudents = useMemo(
    () =>
      [...students].sort(
        (a, b) => (Number(a.rollNumber) || 999) - (Number(b.rollNumber) || 999),
      ),
    [students],
  );

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return sortedStudents;
    const q = search.toLowerCase();
    return sortedStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.rollNumber && s.rollNumber.toString().includes(q)),
    );
  }, [sortedStudents, search]);

  /* Week attendance queries */
  const { data: att0 } = useGetAttendanceQuery(
    { classId, date: weekDates[0] },
    { skip: !classId },
  );
  const { data: att1 } = useGetAttendanceQuery(
    { classId, date: weekDates[1] },
    { skip: !classId },
  );
  const { data: att2 } = useGetAttendanceQuery(
    { classId, date: weekDates[2] },
    { skip: !classId },
  );
  const { data: att3 } = useGetAttendanceQuery(
    { classId, date: weekDates[3] },
    { skip: !classId },
  );
  const { data: att4 } = useGetAttendanceQuery(
    { classId, date: weekDates[4] },
    { skip: !classId },
  );
  const weekAttendance = [att0, att1, att2, att3, att4];

  const [dateEdits, setDateEdits] = useState(null);
  const [markAttendance, { isLoading: saving }] = useMarkAttendanceMutation();

  /* Derive records for the editing date */
  const derivedRecords = useMemo(() => {
    if (!classId) return {};
    const editAtt = editingIdx >= 0 ? weekAttendance[editingIdx] : null;
    if (editAtt?.records) {
      const map = {};
      editAtt.records.forEach((r) => {
        map[r.studentId] = r.status;
      });
      return map;
    }
    if (students.length) {
      const map = {};
      students.forEach((s) => {
        map[s._id] = "P";
      });
      return map;
    }
    return {};
  }, [classId, editingIdx, weekAttendance, students]);

  const editingRecords = dateEdits ?? derivedRecords;

  const toggleStudent = useCallback(
    (id) => {
      setDateEdits((prev) => ({
        ...(prev ?? derivedRecords),
        [id]: (prev ?? derivedRecords)[id] === "P" ? "A" : "P",
      }));
    },
    [derivedRecords],
  );

  const markAllPresent = () => {
    const map = {};
    students.forEach((s) => {
      map[s._id] = "P";
    });
    setDateEdits(map);
    setConfirmDialog(null);
  };

  const markAllAbsent = () => {
    const map = {};
    students.forEach((s) => {
      map[s._id] = "A";
    });
    setDateEdits(map);
    setConfirmDialog(null);
  };

  const handleSave = async () => {
    try {
      const recs = Object.entries(editingRecords).map(
        ([studentId, status]) => ({
          studentId,
          status,
        }),
      );
      await markAttendance({
        classId,
        date: editingDate,
        records: recs,
      }).unwrap();
      setSnackbar({
        open: true,
        message: `Attendance saved for ${editingDayjs.format("MMM D, YYYY")}`,
        severity: "success",
      });
      setDateEdits(null);
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to save attendance",
        severity: "error",
      });
    }
  };

  const getStatusForDay = (studentId, dayIdx) => {
    if (dayIdx === editingIdx) return editingRecords[studentId] || null;
    const dayAtt = weekAttendance[dayIdx];
    if (!dayAtt?.records) return null;
    const rec = dayAtt.records.find((r) => r.studentId === studentId);
    return rec?.status || null;
  };

  const presentCount = Object.values(editingRecords).filter(
    (v) => v === "P",
  ).length;
  const absentCount = Object.values(editingRecords).filter(
    (v) => v === "A",
  ).length;
  const attendancePct =
    students.length > 0
      ? Math.round((presentCount / students.length) * 100)
      : 0;

  const weekStart = dayjs(weekDates[0]);
  const weekEnd = dayjs(weekDates[4]);
  const weekLabel =
    weekStart.month() === weekEnd.month()
      ? `${weekStart.format("MMM D")} – ${weekEnd.format("D, YYYY")}`
      : `${weekStart.format("MMM D")} – ${weekEnd.format("MMM D, YYYY")}`;

  const dateAlreadySaved =
    editingIdx >= 0 && weekAttendance[editingIdx]?.records?.length > 0;

  const switchEditingDate = (date) => {
    setDateEdits(null);
    setEditingDate(date);
    setTab(0);
  };

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
            Attendance
          </Typography>
          <Typography
            sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
            {realToday.format("dddd, MMMM D, YYYY")}
          </Typography>
        </Box>
      </Box>

      {/* Class selector + week nav */}
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
              setDateEdits(null);
              setEditingDate(todayStr);
              setSearch("");
              setTab(0);
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

        {classId && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              ml: "auto",
            }}
          >
            <IconButton
              size="small"
              onClick={() => {
                const newOffset = weekOffset - 1;
                setWeekOffset(newOffset);
                const newWeek = getWeekDates(
                  realToday.add(newOffset * 7, "day"),
                );
                setEditingDate(newWeek[4]); // Friday of that week
                setDateEdits(null);
              }}
            >
              <ChevronLeftOutlinedIcon fontSize="small" />
            </IconButton>
            <Button
              size="small"
              variant={isCurrentWeek ? "contained" : "outlined"}
              onClick={() => {
                setWeekOffset(0);
                setEditingDate(todayStr);
                setDateEdits(null);
              }}
              sx={{ textTransform: "none", fontSize: "12px", minWidth: 80 }}
            >
              {isCurrentWeek ? "This week" : weekLabel}
            </Button>
            <IconButton
              size="small"
              onClick={() => {
                const newOffset = weekOffset + 1;
                setWeekOffset(newOffset);
                if (newOffset === 0) {
                  setEditingDate(todayStr);
                } else {
                  const newWeek = getWeekDates(
                    realToday.add(newOffset * 7, "day"),
                  );
                  setEditingDate(newWeek[4]);
                }
                setDateEdits(null);
              }}
              disabled={weekOffset >= 0}
            >
              <ChevronRightOutlinedIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Loading */}
      {classId && loadingStudents && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={52}
              sx={{ borderRadius: "var(--border-radius-md)" }}
            />
          ))}
        </Box>
      )}

      {/* Main content */}
      {classId && !loadingStudents && students.length > 0 && (
        <>
          {/* Tabs */}
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              mb: 2,
              minHeight: 36,
              "& .MuiTab-root": {
                textTransform: "none",
                fontSize: "13px",
                fontWeight: 500,
                minHeight: 36,
                py: 0.5,
              },
            }}
          >
            <Tab label="Take Attendance" />
            <Tab label="Week View" />
          </Tabs>

          {/* ═══════ TAB 0: Take Attendance ═══════ */}
          {tab === 0 && !isFutureDate && (
            <>
              {/* Date indicator (when editing a past date) */}
              {editingDate !== todayStr && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 2,
                    bgcolor: "rgba(99, 102, 241, 0.06)",
                    border: "0.5px solid rgba(99, 102, 241, 0.2)",
                    borderRadius: "var(--border-radius-lg)",
                    px: 2,
                    py: 1.25,
                  }}
                >
                  <EventAvailableOutlinedIcon
                    sx={{ fontSize: 18, color: "#6366f1" }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#6366f1",
                      }}
                    >
                      Editing: {editingDayjs.format("dddd, MMMM D, YYYY")}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "11px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {dateAlreadySaved
                        ? "Correcting previously saved attendance"
                        : "Marking attendance for a past date"}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    onClick={() => switchEditingDate(todayStr)}
                    sx={{ textTransform: "none", fontSize: "12px" }}
                  >
                    Back to today
                  </Button>
                </Box>
              )}

              {/* Stats bar */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  mb: 2,
                  alignItems: "stretch",
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    bgcolor: "var(--color-background-primary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                    borderRadius: "var(--border-radius-lg)",
                    py: 1.5,
                    px: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.75,
                    }}
                  >
                    <Typography sx={{ fontSize: "12px", fontWeight: 500 }}>
                      {editingDate === todayStr
                        ? "Today\u2019s Attendance"
                        : `${editingDayjs.format("MMM D")} Attendance`}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color:
                          attendancePct >= 80
                            ? "var(--color-text-success)"
                            : attendancePct >= 50
                              ? "var(--color-text-warning)"
                              : "var(--color-text-danger)",
                      }}
                    >
                      {attendancePct}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={attendancePct}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: "var(--color-background-secondary)",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 3,
                        bgcolor:
                          attendancePct >= 80
                            ? "#059669"
                            : attendancePct >= 50
                              ? "#d97706"
                              : "#dc2626",
                      },
                    }}
                  />
                  <Box sx={{ display: "flex", gap: 2.5, mt: 1 }}>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          fontWeight: 600,
                          color: "var(--color-text-success)",
                        }}
                      >
                        {presentCount}
                      </Box>{" "}
                      present
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          fontWeight: 600,
                          color: "var(--color-text-danger)",
                        }}
                      >
                        {absentCount}
                      </Box>{" "}
                      absent
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      of {students.length} students
                    </Typography>
                  </Box>
                </Box>

                {dateAlreadySaved && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      bgcolor: "var(--color-background-success)",
                      borderRadius: "var(--border-radius-lg)",
                      px: 2,
                    }}
                  >
                    <CheckCircleOutlinedIcon
                      sx={{
                        fontSize: 16,
                        color: "var(--color-text-success)",
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: "12px",
                        fontWeight: 500,
                        color: "var(--color-text-success)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Saved
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Quick actions + search */}
              <Box
                sx={{
                  display: "flex",
                  gap: 1.5,
                  mb: 2,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  color="success"
                  onClick={() => setConfirmDialog({ action: "present" })}
                  sx={{ textTransform: "none", fontSize: "12px" }}
                >
                  All Present
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  onClick={() => setConfirmDialog({ action: "absent" })}
                  sx={{ textTransform: "none", fontSize: "12px" }}
                >
                  All Absent
                </Button>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    bgcolor: "var(--color-background-primary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                    borderRadius: "var(--border-radius-md)",
                    px: 1.5,
                    height: 36,
                    ml: "auto",
                    minWidth: 180,
                  }}
                >
                  <SearchOutlinedIcon
                    sx={{
                      fontSize: 16,
                      color: "var(--color-text-secondary)",
                    }}
                  />
                  <InputBase
                    placeholder="Search student…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ fontSize: "12px", flex: 1 }}
                  />
                </Box>
              </Box>

              {/* Student list */}
              <Box
                sx={{
                  bgcolor: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                  borderRadius: "var(--border-radius-lg)",
                  overflow: "hidden",
                }}
              >
                {/* List header */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
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
                      flex: 1,
                    }}
                  >
                    Student ({filteredStudents.length})
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "var(--color-text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Status
                  </Typography>
                </Box>

                {filteredStudents.map((s) => (
                  <StudentRow
                    key={s._id}
                    student={s}
                    status={editingRecords[s._id] || "P"}
                    onToggle={() => toggleStudent(s._id)}
                  />
                ))}

                {filteredStudents.length === 0 && search && (
                  <Box sx={{ py: 3, textAlign: "center" }}>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      No students matching &ldquo;{search}&rdquo;
                    </Typography>
                  </Box>
                )}

                {/* Save bar */}
                <Box
                  sx={{
                    px: 2.5,
                    py: 1.5,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "0.5px solid var(--color-border-tertiary)",
                    bgcolor: "var(--color-background-secondary)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    {dateEdits && (
                      <Typography
                        sx={{
                          fontSize: "12px",
                          color: "var(--color-text-warning)",
                          fontWeight: 500,
                        }}
                      >
                        ● Unsaved changes
                      </Typography>
                    )}
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleSave}
                    disabled={saving}
                    startIcon={<CheckCircleOutlinedIcon />}
                    sx={{ textTransform: "none" }}
                  >
                    {saving ? "Saving…" : "Save Attendance"}
                  </Button>
                </Box>
              </Box>
            </>
          )}

          {/* Future date message for Take tab */}
          {tab === 0 && isFutureDate && (
            <Box
              sx={{
                textAlign: "center",
                py: 6,
                bgcolor: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: "var(--border-radius-lg)",
              }}
            >
              <Typography
                sx={{
                  fontSize: "13px",
                  color: "var(--color-text-secondary)",
                  mb: 1,
                }}
              >
                Cannot mark attendance for a future date.
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => switchEditingDate(todayStr)}
                sx={{ textTransform: "none" }}
              >
                Go to today
              </Button>
            </Box>
          )}

          {/* ═══════ TAB 1: Week View ═══════ */}
          {tab === 1 && (
            <Box
              sx={{
                bgcolor: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: "var(--border-radius-lg)",
              }}
            >
              {/* Hint */}
              <Box
                sx={{
                  px: 2.5,
                  py: 1,
                  borderBottom: "0.5px solid var(--color-border-tertiary)",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "11px",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Click a day column to edit that day&apos;s attendance
                </Typography>
              </Box>

              <Box sx={{ overflowX: "auto" }}>
                <Box sx={{ minWidth: 500 }}>
                  {/* Header */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr repeat(5, 56px)",
                      alignItems: "center",
                      px: 2.5,
                      py: 1.5,
                      borderBottom: "0.5px solid var(--color-border-tertiary)",
                      bgcolor: "var(--color-background-secondary)",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "12px",
                        fontWeight: 500,
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      Student
                    </Typography>
                    {dayLabels.map((d, idx) => {
                      const dayDate = weekDates[idx];
                      const isPast = !dayjs(dayDate).isAfter(realToday, "day");
                      return (
                        <Box
                          key={d}
                          onClick={
                            isPast
                              ? () => switchEditingDate(dayDate)
                              : undefined
                          }
                          sx={{
                            textAlign: "center",
                            cursor: isPast ? "pointer" : "default",
                            borderRadius: "var(--border-radius-sm)",
                            py: 0.25,
                            transition: "all 0.15s",
                            "&:hover": isPast
                              ? {
                                  bgcolor: "rgba(99, 102, 241, 0.08)",
                                }
                              : {},
                            ...(idx === todayIdx && {
                              bgcolor: "rgba(99, 102, 241, 0.06)",
                            }),
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "12px",
                              fontWeight: idx === todayIdx ? 600 : 500,
                              color:
                                idx === todayIdx
                                  ? "#6366f1"
                                  : isPast
                                    ? "var(--color-text-primary)"
                                    : "var(--color-text-secondary)",
                            }}
                          >
                            {d}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "10px",
                              color:
                                idx === todayIdx
                                  ? "#6366f1"
                                  : "var(--color-text-secondary)",
                            }}
                          >
                            {dayjs(dayDate).format("D")}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>

                  {/* Rows */}
                  {sortedStudents.map((s) => (
                    <Box
                      key={s._id}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr repeat(5, 56px)",
                        alignItems: "center",
                        px: 2.5,
                        py: 1,
                        borderBottom:
                          "0.5px solid var(--color-border-tertiary)",
                        "&:last-child": { borderBottom: "none" },
                        "&:hover": {
                          bgcolor: "var(--color-background-secondary)",
                        },
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                          {s.name}
                        </Typography>
                        {s.rollNumber && (
                          <Typography
                            sx={{
                              fontSize: "11px",
                              color: "var(--color-text-secondary)",
                            }}
                          >
                            Roll {s.rollNumber}
                          </Typography>
                        )}
                      </Box>
                      {weekDates.map((wd, dayIdx) => {
                        const status = getStatusForDay(s._id, dayIdx);
                        const isDayFuture = dayjs(wd).isAfter(realToday, "day");
                        return (
                          <Box
                            key={dayIdx}
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            {isDayFuture ? (
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "var(--color-text-secondary)",
                                }}
                              >
                                ·
                              </Box>
                            ) : (
                              <AttendanceBadge
                                status={status}
                                editable
                                onClick={() => switchEditingDate(wd)}
                              />
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </>
      )}

      {/* Empty states */}
      {classId && !loadingStudents && students.length === 0 && (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <PersonOutlinedIcon
            sx={{
              fontSize: 40,
              color: "var(--color-text-secondary)",
              mb: 1,
              opacity: 0.4,
            }}
          />
          <Typography
            sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
            No students in this class
          </Typography>
        </Box>
      )}

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
                Today
              </Typography>
              <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
                {realToday.format("ddd, MMM D")}
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
                Week
              </Typography>
              <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
                {weekLabel}
              </Typography>
            </Box>
          </Box>

          {/* Class section header */}
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
            Select a class to take attendance
          </Typography>

          {/* Class cards grid */}
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
                <ClassOverviewCard
                  key={c._id}
                  cls={c}
                  onSelect={(id) => {
                    setClassId(id);
                    setDateEdits(null);
                    setEditingDate(todayStr);
                    setSearch("");
                    setTab(0);
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
              <EventAvailableOutlinedIcon
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

      {/* ═══════ Confirmation Dialog ═══════ */}
      <Dialog
        open={!!confirmDialog}
        onClose={() => setConfirmDialog(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 500, pb: 1 }}>
          {confirmDialog?.action === "present"
            ? "Mark all students present?"
            : "Mark all students absent?"}
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
            This will {confirmDialog?.action === "present" ? "mark" : "mark"}{" "}
            all <strong>{students.length}</strong> students as{" "}
            <strong>
              {confirmDialog?.action === "present" ? "Present" : "Absent"}
            </strong>{" "}
            for today. You can still change individual students afterward.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setConfirmDialog(null)}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color={confirmDialog?.action === "present" ? "success" : "error"}
            onClick={
              confirmDialog?.action === "present"
                ? markAllPresent
                : markAllAbsent
            }
            sx={{ textTransform: "none" }}
          >
            {confirmDialog?.action === "present"
              ? "Mark All Present"
              : "Mark All Absent"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
