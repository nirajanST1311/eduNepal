import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
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
          color: "#94a3b8",
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
        fontSize: "0.75rem",
        fontWeight: 600,
        bgcolor: isPresent ? "rgba(22,163,74,0.08)" : "rgba(220,38,38,0.08)",
        color: isPresent ? "#16a34a" : "#dc2626",
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
  const today = dayjs();
  const todayStr = today.format("YYYY-MM-DD");
  const weekDates = useMemo(() => getWeekDates(today), []);
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

  const [todayRecords, setTodayRecords] = useState({});
  const [initialized, setInitialized] = useState(false);
  const [markAttendance, { isLoading: saving }] = useMarkAttendanceMutation();

  useMemo(() => {
    if (!classId) return;
    const todayAtt = todayIdx >= 0 ? weekAttendance[todayIdx] : null;
    if (todayAtt?.records && !initialized) {
      const map = {};
      todayAtt.records.forEach((r) => {
        map[r.studentId] = r.status;
      });
      setTodayRecords(map);
      setInitialized(true);
    } else if (students.length && !initialized) {
      const map = {};
      students.forEach((s) => {
        map[s._id] = "P";
      });
      setTodayRecords(map);
      setInitialized(true);
    }
  }, [weekAttendance, students, classId, initialized, todayIdx]);

  const toggleToday = (id) => {
    setTodayRecords((prev) => ({
      ...prev,
      [id]: prev[id] === "P" ? "A" : "P",
    }));
  };

  const markAllPresent = () => {
    const map = {};
    students.forEach((s) => {
      map[s._id] = "P";
    });
    setTodayRecords(map);
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
  const selectedClass = (classes || []).find((c) => c._id === classId);

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
            Attendance
          </Typography>
          <Typography variant="body2" color="text.secondary">
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
              setInitialized(false);
              setTodayRecords({});
            }}
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
              variant="body2"
              color="text.secondary"
              sx={{ ml: "auto" }}
            >
              {presentCount} / {students.length} present
            </Typography>
          </>
        )}
      </Box>

      {classId && students.length > 0 && (
        <Card>
          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
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
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={500}
                    color="text.secondary"
                  >
                    Student
                  </Typography>
                  {dayLabels.map((d) => (
                    <Typography
                      key={d}
                      variant="caption"
                      fontWeight={500}
                      color="text.secondary"
                      align="center"
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
                      borderBottom: "1px solid rgba(0,0,0,0.04)",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.01)" },
                    }}
                  >
                    <Typography variant="body2" fontWeight={500}>
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
                                color: "#cbd5e1",
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
                borderTop: "1px solid rgba(0,0,0,0.06)",
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
          Select a class to mark attendance
        </Typography>
      )}
    </Box>
  );
}
