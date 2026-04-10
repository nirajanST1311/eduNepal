import { useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Button,
  IconButton,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
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
          fontSize: "0.75rem",
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
  const [today] = useState(() => dayjs());
  const todayStr = today.format("YYYY-MM-DD");
  const weekDates = getWeekDates(today);
  const todayIdx = weekDates.indexOf(todayStr);

  const { data: classes } = useGetClassesQuery({ schoolId: user?.schoolId });
  const { data: students = [] } = useGetStudentsQuery(
    classId ? { classId } : undefined,
    { skip: !classId },
  );

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

  // Derive todayRecords: user edits take priority, otherwise from fetched data
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

  const toggleToday = (id) => {
    setTodayEdits((prev) => ({
      ...(prev ?? derivedRecords),
      [id]: (prev ?? derivedRecords)[id] === "P" ? "A" : "P",
    }));
  };

  const markAllPresent = () => {
    const map = {};
    students.forEach((s) => {
      map[s._id] = "P";
    });
    setTodayEdits(map);
  };

  const handleSave = async () => {
    const recs = Object.entries(todayRecords).map(([studentId, status]) => ({
      studentId,
      status,
    }));
    await markAttendance({ classId, date: todayStr, records: recs }).unwrap();
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
          <Typography sx={{ fontSize: "22px", fontWeight: 500, mb: 0.25 }}>
            Attendance
          </Typography>
          <Typography
            sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
            Today · {today.format("dddd, MMM D")}
          </Typography>
        </Box>
        <IconButton size="small">
          <MoreHorizIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
        <FormControl sx={{ minWidth: 200 }}>
          <Select
            value={classId}
            displayEmpty
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
        {classId && students.length > 0 && (
          <>
            <Button
              variant="outlined"
              size="small"
              onClick={markAllPresent}
              sx={{ whiteSpace: "nowrap" }}
            >
              Mark all present
            </Button>
            <Typography
              sx={{
                fontSize: "13px",
                color: "var(--color-text-secondary)",
                ml: "auto",
              }}
            >
              {presentCount} / {students.length} present
            </Typography>
          </>
        )}
      </Box>

      {classId && students.length > 0 && (
        <Box
          sx={{
            bgcolor: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
          }}
        >
          <Box sx={{ p: 0 }}>
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
                  {dayLabels.map((d) => (
                    <Typography
                      key={d}
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
                      "&:hover": {
                        bgcolor: "var(--color-background-secondary)",
                      },
                    }}
                  >
                    <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                      {s.name}
                    </Typography>
                    {weekDates.map((_, dayIdx) => {
                      const status = getStatusForDay(s._id, dayIdx);
                      const isFuture = dayIdx > todayIdx && todayIdx >= 0;
                      const editable = dayIdx === todayIdx;
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
            <Box
              sx={{
                px: 2.5,
                py: 1.5,
                display: "flex",
                justifyContent: "flex-end",
                borderTop: "0.5px solid var(--color-border-tertiary)",
              }}
            >
              <Button
                variant="contained"
                size="small"
                onClick={handleSave}
                disabled={saving}
              >
                Save attendance
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {classId && students.length === 0 && (
        <Typography
          sx={{
            fontSize: "13px",
            color: "var(--color-text-secondary)",
            textAlign: "center",
            py: 6,
          }}
        >
          No students in this class
        </Typography>
      )}

      {!classId && (
        <Typography
          sx={{
            fontSize: "13px",
            color: "var(--color-text-secondary)",
            textAlign: "center",
            py: 6,
          }}
        >
          Select a class to mark attendance
        </Typography>
      )}
    </Box>
  );
}
