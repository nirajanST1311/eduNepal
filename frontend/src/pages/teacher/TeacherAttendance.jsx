import { useState, useCallback } from "react";
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
} from "@mui/material";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
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
  const [weekOffset, setWeekOffset] = useState(0);
  const referenceDate = realToday.add(weekOffset * 7, "day");
  const weekDates = getWeekDates(referenceDate);
  const todayStr = realToday.format("YYYY-MM-DD");
  const todayIdx = weekDates.indexOf(todayStr);
  const isCurrentWeek = weekOffset === 0;
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const { data: classes } = useGetClassesQuery({ schoolId: user?.schoolId });
  const { data: students = [], isLoading: loadingStudents } =
    useGetStudentsQuery(classId ? { classId } : undefined, { skip: !classId });

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

  const [todayEdits, setTodayEdits] = useState(null);
  const [markAttendance, { isLoading: saving }] = useMarkAttendanceMutation();

  const derivedRecords = (() => {
    if (!classId) return {};
    const todayAtt = todayIdx >= 0 ? weekAttendance[todayIdx] : null;
    if (todayAtt?.records) {
      const map = {};
      todayAtt.records.forEach((r) => {
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
  })();
  const todayRecords = todayEdits ?? derivedRecords;

  const toggleToday = useCallback(
    (id) => {
      setTodayEdits((prev) => ({
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
    setTodayEdits(map);
  };

  const markAllAbsent = () => {
    const map = {};
    students.forEach((s) => {
      map[s._id] = "A";
    });
    setTodayEdits(map);
  };

  const handleSave = async () => {
    try {
      const recs = Object.entries(todayRecords).map(([studentId, status]) => ({
        studentId,
        status,
      }));
      await markAttendance({ classId, date: todayStr, records: recs }).unwrap();
      setSnackbar({
        open: true,
        message: "Attendance saved successfully",
        severity: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to save attendance",
        severity: "error",
      });
    }
  };

  const getStatusForDay = (studentId, dayIdx) => {
    if (dayIdx === todayIdx) return todayRecords[studentId] || null;
    const dayAtt = weekAttendance[dayIdx];
    if (!dayAtt?.records) return dayIdx < todayIdx ? null : undefined;
    const rec = dayAtt.records.find((r) => r.studentId === studentId);
    return rec?.status || null;
  };

  const presentCount = Object.values(todayRecords).filter(
    (v) => v === "P",
  ).length;
  const absentCount = Object.values(todayRecords).filter(
    (v) => v === "A",
  ).length;

  // Week label
  const weekStart = dayjs(weekDates[0]);
  const weekEnd = dayjs(weekDates[4]);
  const weekLabel =
    weekStart.month() === weekEnd.month()
      ? `${weekStart.format("MMM D")} – ${weekEnd.format("D, YYYY")}`
      : `${weekStart.format("MMM D")} – ${weekEnd.format("MMM D, YYYY")}`;

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
            {isCurrentWeek ? "This week" : weekLabel} ·{" "}
            {realToday.format("dddd, MMM D")}
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
              setTodayEdits(null);
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

        {/* Week navigation */}
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: "auto" }}
        >
          <IconButton size="small" onClick={() => setWeekOffset((w) => w - 1)}>
            <ChevronLeftOutlinedIcon fontSize="small" />
          </IconButton>
          <Button
            size="small"
            variant={isCurrentWeek ? "contained" : "outlined"}
            onClick={() => setWeekOffset(0)}
            sx={{ textTransform: "none", fontSize: "12px", minWidth: 80 }}
          >
            {isCurrentWeek ? "This week" : weekLabel}
          </Button>
          <IconButton
            size="small"
            onClick={() => setWeekOffset((w) => w + 1)}
            disabled={weekOffset >= 0}
          >
            <ChevronRightOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Quick actions + stats */}
      {classId && students.length > 0 && isCurrentWeek && (
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 3,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outlined"
            size="small"
            onClick={markAllPresent}
            sx={{ textTransform: "none", fontSize: "12px" }}
          >
            Mark all present
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={markAllAbsent}
            sx={{ textTransform: "none", fontSize: "12px" }}
          >
            Mark all absent
          </Button>
          <Box sx={{ ml: "auto", display: "flex", gap: 2 }}>
            <Typography
              sx={{
                fontSize: "13px",
                color: "var(--color-text-success)",
                fontWeight: 500,
              }}
            >
              {presentCount} present
            </Typography>
            <Typography
              sx={{
                fontSize: "13px",
                color: "var(--color-text-danger)",
                fontWeight: 500,
              }}
            >
              {absentCount} absent
            </Typography>
            <Typography
              sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
            >
              of {students.length}
            </Typography>
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
              height={48}
              sx={{ borderRadius: "var(--border-radius-md)" }}
            />
          ))}
        </Box>
      )}

      {/* Attendance grid */}
      {classId && !loadingStudents && students.length > 0 && (
        <Box
          sx={{
            bgcolor: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
          }}
        >
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
                {dayLabels.map((d, idx) => (
                  <Box key={d} sx={{ textAlign: "center" }}>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        fontWeight: idx === todayIdx ? 600 : 500,
                        color:
                          idx === todayIdx
                            ? "var(--color-text-primary)"
                            : "var(--color-text-secondary)",
                      }}
                    >
                      {d}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "10px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {dayjs(weekDates[idx]).format("D")}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Rows */}
              {students.map((s) => (
                <Box
                  key={s._id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr repeat(5, 56px)",
                    alignItems: "center",
                    px: 2.5,
                    py: 1,
                    borderBottom: "0.5px solid var(--color-border-tertiary)",
                    "&:last-child": { borderBottom: "none" },
                    "&:hover": { bgcolor: "var(--color-background-secondary)" },
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
                  {weekDates.map((_, dayIdx) => {
                    const status = getStatusForDay(s._id, dayIdx);
                    const isFuture = todayIdx >= 0 ? dayIdx > todayIdx : false;
                    const editable = dayIdx === todayIdx && isCurrentWeek;
                    return (
                      <Box
                        key={dayIdx}
                        sx={{ display: "flex", justifyContent: "center" }}
                      >
                        {isFuture ? (
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
                            editable={editable}
                            onClick={
                              editable ? () => toggleToday(s._id) : undefined
                            }
                          />
                        )}
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Save bar */}
          {isCurrentWeek && (
            <Box
              sx={{
                px: 2.5,
                py: 1.5,
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 2,
                borderTop: "0.5px solid var(--color-border-tertiary)",
              }}
            >
              {todayEdits && (
                <Typography
                  sx={{ fontSize: "12px", color: "var(--color-text-warning)" }}
                >
                  Unsaved changes
                </Typography>
              )}
              <Button
                variant="contained"
                size="small"
                onClick={handleSave}
                disabled={saving}
                startIcon={<CheckCircleOutlinedIcon />}
                sx={{ textTransform: "none" }}
              >
                {saving ? "Saving…" : "Save attendance"}
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* Empty states */}
      {classId && !loadingStudents && students.length === 0 && (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography
            sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
            No students in this class
          </Typography>
        </Box>
      )}

      {!classId && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <EventAvailableOutlinedIcon
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
            Choose a class from above to mark or view attendance
          </Typography>
        </Box>
      )}

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
