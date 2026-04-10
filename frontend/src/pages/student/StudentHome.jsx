import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  IconButton,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { useGetMyAttendanceQuery } from "@/store/api/attendanceApi";
import { useGetAssignmentsQuery } from "@/store/api/assignmentApi";
import { useGetNoticesQuery } from "@/store/api/noticeApi";
import StatCard from "@/components/common/StatCard";

export default function StudentHome() {
  const { user } = useSelector((s) => s.auth);
  const { data: attendance } = useGetMyAttendanceQuery();
  const { data: assignments = [] } = useGetAssignmentsQuery({});
  const { data: notices = [] } = useGetNoticesQuery({ limit: 3 });

  const pending = assignments.filter(
    (a) => a.status === "published" && !a.submitted,
  );
  const graded = assignments.filter((a) => a.score != null);
  const attendancePct = attendance?.percent;
  const avgScore = graded.length
    ? Math.round(
        graded.reduce((sum, a) => sum + (a.score / (a.total || 20)) * 100, 0) /
          graded.length,
      )
    : null;

  const today = dayjs();

  const dueBadge = (dueDate) => {
    if (!dueDate) return null;
    const diff = dayjs(dueDate).diff(today, "day");
    if (diff <= 0)
      return { label: "Due today", color: "#dc2626", bg: "#fef2f2" };
    if (diff <= 2)
      return {
        label: `${diff} day${diff > 1 ? "s" : ""}`,
        color: "#d97706",
        bg: "#fffbeb",
      };
    return { label: `${diff} days`, color: "#16a34a", bg: "#f0fdf4" };
  };

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
            Good morning, {user?.name?.split(" ")[0]}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {today.format("dddd")} · Class {user?.grade || ""}
            {user?.section ? ` ${user.section}` : ""}
          </Typography>
        </Box>
        <IconButton size="small">
          <MoreHorizIcon />
        </IconButton>
      </Box>

      {/* Stat cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 2,
          mb: 3,
        }}
      >
        <StatCard
          label="Attendance"
          value={attendancePct != null ? `${attendancePct}%` : "—"}
          color="#16a34a"
        />
        <StatCard label="Pending tasks" value={pending.length} />
        <StatCard
          label="Avg score"
          value={avgScore != null ? `${avgScore}%` : "—"}
          color="#2563eb"
        />
      </Box>

      {/* Today's learning */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
            Today's learning
          </Typography>
          {assignments.length === 0 && notices.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No activities for today
            </Typography>
          ) : (
            <Box>
              {assignments.slice(0, 3).map((a, i) => (
                <Box
                  key={a._id}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                    py: 1.5,
                    borderBottom: i < 2 ? "1px solid rgba(0,0,0,0.05)" : "none",
                  }}
                >
                  <Box sx={{ textAlign: "right", minWidth: 65, pt: 0.25 }}>
                    <Typography
                      variant="caption"
                      fontWeight={500}
                      color="text.secondary"
                    >
                      {dayjs()
                        .hour(10 + i * 2)
                        .minute(0)
                        .format("h:mm A")}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor:
                        i === 0 ? "#2563eb" : i === 1 ? "#1e293b" : "#16a34a",
                      mt: 0.7,
                      flexShrink: 0,
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {a.subjectName || "Subject"} — {a.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {a.description || (a.submitted ? "Completed" : "Pending")}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ flexShrink: 0, fontSize: "0.8rem" }}
                  >
                    {a.submitted ? "Open" : "Submit"}
                  </Button>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Pending assignments + Recent results */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                Pending assignments
              </Typography>
              {pending.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  All caught up!
                </Typography>
              )}
              {pending.slice(0, 4).map((a, i) => {
                const badge = dueBadge(a.dueDate);
                return (
                  <Box
                    key={a._id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      py: 1.2,
                      borderBottom:
                        i < Math.min(pending.length - 1, 3)
                          ? "1px solid rgba(0,0,0,0.05)"
                          : "none",
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {a.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {a.subjectName || "Subject"} ·{" "}
                        {a.dueDate
                          ? `Due ${dayjs(a.dueDate).format("MMM D")}`
                          : ""}
                      </Typography>
                    </Box>
                    {badge && (
                      <Chip
                        label={badge.label}
                        size="small"
                        sx={{
                          bgcolor: badge.bg,
                          color: badge.color,
                          fontWeight: 500,
                          fontSize: "0.65rem",
                          height: 22,
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                Recent results
              </Typography>
              {graded.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No results yet
                </Typography>
              )}
              {graded.slice(0, 4).map((a, i) => (
                <Box
                  key={a._id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1.2,
                    borderBottom:
                      i < Math.min(graded.length - 1, 3)
                        ? "1px solid rgba(0,0,0,0.05)"
                        : "none",
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {a.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {a.subjectName || "Subject"}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{
                      color:
                        a.score / (a.total || 20) >= 0.7
                          ? "#16a34a"
                          : "#d97706",
                    }}
                  >
                    {a.score}/{a.total || 20}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
