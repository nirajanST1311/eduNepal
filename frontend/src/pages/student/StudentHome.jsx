import { Box, Typography, Button, IconButton } from "@mui/material";
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
      return {
        label: "Due today",
        color: "var(--color-text-danger)",
        bg: "var(--color-background-danger)",
      };
    if (diff <= 2)
      return {
        label: `${diff} day${diff > 1 ? "s" : ""}`,
        color: "var(--color-text-warning)",
        bg: "var(--color-background-warning)",
      };
    return {
      label: `${diff} days`,
      color: "var(--color-text-success)",
      bg: "var(--color-background-success)",
    };
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
          <Typography sx={{ fontSize: "22px", fontWeight: 500, mb: 0.25 }}>
            Good morning, {user?.name?.split(" ")[0]}
          </Typography>
          <Typography
            sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
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
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "14px",
          mb: 3,
        }}
      >
        <StatCard
          label="Attendance"
          value={attendancePct != null ? `${attendancePct}%` : "—"}
          color="var(--color-text-success)"
        />
        <StatCard label="Pending tasks" value={pending.length} />
        <StatCard
          label="Avg score"
          value={avgScore != null ? `${avgScore}%` : "—"}
          color="var(--color-text-info)"
        />
      </Box>

      {/* Today's learning */}
      <Box
        sx={{
          bgcolor: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          p: 2,
          mb: "14px",
        }}
      >
        <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 2 }}>
          Today's learning
        </Typography>
        {assignments.length === 0 && notices.length === 0 ? (
          <Typography
            sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
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
                  borderBottom:
                    i < 2 ? "0.5px solid var(--color-border-tertiary)" : "none",
                }}
              >
                <Box sx={{ textAlign: "right", minWidth: 65, pt: 0.25 }}>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "var(--color-text-secondary)",
                    }}
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
                      i === 0
                        ? "var(--color-text-info)"
                        : i === 1
                          ? "var(--color-text-primary)"
                          : "var(--color-text-success)",
                    mt: 0.7,
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                    {a.subjectName || "Subject"} — {a.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {a.description || (a.submitted ? "Completed" : "Pending")}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ flexShrink: 0, fontSize: "13px" }}
                >
                  {a.submitted ? "Open" : "Submit"}
                </Button>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Pending assignments + Recent results */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "14px",
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
          <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 2 }}>
            Pending assignments
          </Typography>
          {pending.length === 0 && (
            <Typography
              sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
            >
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
                  py: 1,
                  borderBottom:
                    i < Math.min(pending.length - 1, 3)
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
                    {a.subjectName || "Subject"} ·{" "}
                    {a.dueDate ? `Due ${dayjs(a.dueDate).format("MMM D")}` : ""}
                  </Typography>
                </Box>
                {badge && (
                  <Box
                    sx={{
                      padding: "2px 8px",
                      borderRadius: "4px",
                      bgcolor: badge.bg,
                      color: badge.color,
                      fontWeight: 500,
                      fontSize: "11px",
                    }}
                  >
                    {badge.label}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>

        <Box
          sx={{
            bgcolor: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
            p: 2,
          }}
        >
          <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 2 }}>
            Recent results
          </Typography>
          {graded.length === 0 && (
            <Typography
              sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
            >
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
                py: 1,
                borderBottom:
                  i < Math.min(graded.length - 1, 3)
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
                  {a.subjectName || "Subject"}
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color:
                    a.score / (a.total || 20) >= 0.7
                      ? "var(--color-text-success)"
                      : "var(--color-text-warning)",
                }}
              >
                {a.score}/{a.total || 20}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
