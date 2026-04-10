import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Skeleton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useGetDashboardStatsQuery } from "@/store/api/dashboardApi";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const card = {
  bgcolor: "var(--color-background-primary)",
  border: "0.5px solid var(--color-border-tertiary)",
  borderRadius: "var(--border-radius-lg)",
  p: 2.5,
};

const ALERT_ICON = {
  warning: <WarningAmberIcon sx={{ fontSize: 16 }} />,
  error: <ErrorOutlineIcon sx={{ fontSize: 16 }} />,
  info: <InfoOutlinedIcon sx={{ fontSize: 16 }} />,
};
const ALERT_COLORS = {
  warning: {
    bg: "var(--color-background-warning)",
    color: "var(--color-text-warning)",
    border: "var(--color-border-warning)",
  },
  error: {
    bg: "var(--color-background-danger)",
    color: "var(--color-text-danger)",
    border: "var(--color-border-danger)",
  },
  info: {
    bg: "var(--color-background-info)",
    color: "var(--color-text-info)",
    border: "var(--color-border-info)",
  },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useGetDashboardStatsQuery();

  if (isLoading) {
    return (
      <Box>
        <Skeleton width={200} height={32} sx={{ mb: 0.5 }} />
        <Skeleton width={160} height={20} sx={{ mb: 3 }} />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "14px",
            mb: 3,
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={100}
              sx={{ borderRadius: "var(--border-radius-lg)" }}
            />
          ))}
        </Box>
        <Box
          sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}
        >
          <Skeleton
            variant="rounded"
            height={260}
            sx={{ borderRadius: "var(--border-radius-lg)" }}
          />
          <Skeleton
            variant="rounded"
            height={260}
            sx={{ borderRadius: "var(--border-radius-lg)" }}
          />
        </Box>
      </Box>
    );
  }

  const {
    totalStudents = 0,
    totalTeachers = 0,
    overallAttendance = 0,
    pendingSubmissions = 0,
    attendanceByClass = [],
    teacherActivity = [],
    contentProgress = {},
    alerts = [],
    recentNotices = [],
    totalClasses = 0,
    totalAssignments = 0,
  } = stats || {};

  const statCards = [
    {
      label: "Students",
      value: totalStudents,
      icon: <PeopleOutlinedIcon sx={{ fontSize: 20 }} />,
      bg: "var(--color-background-info)",
      color: "var(--color-text-info)",
      path: "/admin/students",
    },
    {
      label: "Teachers",
      value: totalTeachers,
      icon: <SchoolOutlinedIcon sx={{ fontSize: 20 }} />,
      bg: "var(--color-background-success)",
      color: "var(--color-text-success)",
      path: "/admin/teachers",
    },
    {
      label: "Attendance Today",
      value: `${overallAttendance}%`,
      icon: <EventAvailableOutlinedIcon sx={{ fontSize: 20 }} />,
      bg:
        overallAttendance >= 80
          ? "var(--color-background-success)"
          : "var(--color-background-warning)",
      color:
        overallAttendance >= 80
          ? "var(--color-text-success)"
          : "var(--color-text-warning)",
    },
    {
      label: "Pending Reviews",
      value: pendingSubmissions,
      icon: <AssignmentOutlinedIcon sx={{ fontSize: 20 }} />,
      bg:
        pendingSubmissions > 0
          ? "var(--color-background-warning)"
          : "var(--color-background-success)",
      color:
        pendingSubmissions > 0
          ? "var(--color-text-warning)"
          : "var(--color-text-success)",
    },
  ];

  return (
    <Box>
      <Typography sx={{ fontSize: "22px", fontWeight: 500, mb: 0.5 }}>
        School Dashboard
      </Typography>
      <Typography
        sx={{ fontSize: "13px", color: "var(--color-text-secondary)", mb: 3 }}
      >
        {totalClasses} classes · {totalStudents} students · {totalTeachers}{" "}
        teachers
      </Typography>

      {/* Stat Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "14px",
          mb: "14px",
        }}
      >
        {statCards.map((s) => (
          <Box
            key={s.label}
            onClick={() => s.path && navigate(s.path)}
            sx={{
              ...card,
              cursor: s.path ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              gap: 2,
              "&:hover": s.path
                ? { borderColor: "var(--color-border-secondary)" }
                : {},
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "var(--border-radius-md)",
                bgcolor: s.bg,
                color: s.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {s.icon}
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.3,
                }}
              >
                {s.label}
              </Typography>
              <Typography
                sx={{ fontSize: "22px", fontWeight: 500, lineHeight: 1.2 }}
              >
                {s.value}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Box
          sx={{ display: "flex", flexDirection: "column", gap: 1, mb: "14px" }}
        >
          {alerts.map((a, i) => {
            const style = ALERT_COLORS[a.severity] || ALERT_COLORS.info;
            return (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.5,
                  py: 1,
                  borderRadius: "var(--border-radius-md)",
                  bgcolor: style.bg,
                  color: style.color,
                  border: `0.5px solid ${style.border}`,
                  fontSize: "13px",
                }}
              >
                {ALERT_ICON[a.severity] || ALERT_ICON.info}
                {a.message}
              </Box>
            );
          })}
        </Box>
      )}

      {/* Two-column layout */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px",
          mb: "14px",
        }}
      >
        {/* Attendance by Class */}
        <Box sx={card}>
          <Typography sx={{ fontSize: "14px", fontWeight: 500, mb: 2 }}>
            Today&apos;s Attendance
          </Typography>
          {attendanceByClass.length === 0 ? (
            <Typography
              sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
            >
              No classes found.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {attendanceByClass.map((c) => (
                <Box key={c.classId}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 0.5,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                        Class {c.grade}
                        {c.section}
                      </Typography>
                      {!c.marked && (
                        <Box
                          component="span"
                          sx={{
                            fontSize: "10px",
                            fontWeight: 500,
                            px: 0.75,
                            py: 0.15,
                            borderRadius: "4px",
                            bgcolor: "var(--color-background-warning)",
                            color: "var(--color-text-warning)",
                          }}
                        >
                          Not marked
                        </Box>
                      )}
                    </Box>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {c.marked
                        ? `${c.present}/${c.totalStudents} · ${c.percentage}%`
                        : `${c.totalStudents} students`}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={c.marked ? c.percentage : 0}
                    sx={{
                      height: 5,
                      borderRadius: 3,
                      bgcolor: "var(--color-border-tertiary)",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: !c.marked
                          ? "var(--color-text-secondary)"
                          : c.percentage >= 80
                            ? "var(--color-text-success)"
                            : c.percentage >= 60
                              ? "var(--color-text-warning)"
                              : "var(--color-text-danger)",
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Content Progress */}
        <Box sx={card}>
          <Typography sx={{ fontSize: "14px", fontWeight: 500, mb: 2 }}>
            Teacher Activity
          </Typography>
          {teacherActivity.length === 0 ? (
            <Typography
              sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
            >
              No teacher data yet.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {teacherActivity.slice(0, 6).map((t) => (
                <Box key={t._id}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 0.5,
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                        {t.name}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "11px",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        {t.subjects.join(", ")} · {t.classCount} class
                        {t.classCount !== 1 ? "es" : ""}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        fontWeight: 500,
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {t.publishedChapters}/{t.totalChapters}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={t.contentProgress}
                    sx={{
                      height: 5,
                      borderRadius: 3,
                      bgcolor: "var(--color-border-tertiary)",
                      "& .MuiLinearProgress-bar": {
                        bgcolor:
                          t.contentProgress >= 70
                            ? "var(--color-text-success)"
                            : "var(--color-text-info)",
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* Bottom row */}
      <Box
        sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}
      >
        {/* Recent Notices */}
        <Box sx={card}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
              Recent Notices
            </Typography>
            <Button
              size="small"
              onClick={() => navigate("/admin/notices")}
              endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
              sx={{ fontSize: "12px" }}
            >
              View all
            </Button>
          </Box>
          {recentNotices.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <CampaignOutlinedIcon
                sx={{
                  fontSize: 32,
                  color: "var(--color-text-secondary)",
                  opacity: 0.3,
                  mb: 0.5,
                }}
              />
              <Typography
                sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
              >
                No notices yet
              </Typography>
            </Box>
          ) : (
            recentNotices.map((n, i) => (
              <Box
                key={n._id}
                sx={{
                  py: 1,
                  borderBottom:
                    i < recentNotices.length - 1
                      ? "0.5px solid var(--color-border-tertiary)"
                      : "none",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.25,
                  }}
                >
                  <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                    {n.title}
                  </Typography>
                  {n.priority === "high" && (
                    <Box
                      component="span"
                      sx={{
                        fontSize: "10px",
                        fontWeight: 500,
                        px: 0.75,
                        py: 0.15,
                        borderRadius: "4px",
                        bgcolor: "var(--color-background-danger)",
                        color: "var(--color-text-danger)",
                      }}
                    >
                      Urgent
                    </Box>
                  )}
                </Box>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {n.authorId?.name ? `${n.authorId.name} · ` : ""}
                  {dayjs(n.createdAt).fromNow()}
                </Typography>
              </Box>
            ))
          )}
        </Box>

        {/* Quick Stats & Actions */}
        <Box sx={card}>
          <Typography sx={{ fontSize: "14px", fontWeight: 500, mb: 2 }}>
            Overview
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {/* Content Progress */}
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography sx={{ fontSize: "13px" }}>
                  Content published
                </Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {contentProgress.published || 0}/{contentProgress.total || 0}{" "}
                  chapters
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={contentProgress.percentage || 0}
                sx={{
                  height: 5,
                  borderRadius: 3,
                  bgcolor: "var(--color-border-tertiary)",
                  "& .MuiLinearProgress-bar": {
                    bgcolor: "var(--color-text-info)",
                    borderRadius: 3,
                  },
                }}
              />
            </Box>

            {/* Assignment Stats */}
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.5 }}
            >
              <AssignmentOutlinedIcon
                sx={{ fontSize: 16, color: "var(--color-text-secondary)" }}
              />
              <Typography sx={{ fontSize: "13px" }}>
                {totalAssignments} active assignment
                {totalAssignments !== 1 ? "s" : ""}
              </Typography>
            </Box>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.5 }}
            >
              <CheckCircleOutlineIcon
                sx={{ fontSize: 16, color: "var(--color-text-success)" }}
              />
              <Typography sx={{ fontSize: "13px" }}>
                {attendanceByClass.filter((c) => c.marked).length}/
                {attendanceByClass.length} classes marked today
              </Typography>
            </Box>
          </Box>

          {/* Quick Actions */}
          <Typography
            sx={{
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--color-text-secondary)",
              mt: 2.5,
              mb: 1,
            }}
          >
            Quick actions
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => navigate("/admin/teachers")}
            >
              Manage Teachers
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => navigate("/admin/students")}
            >
              Manage Students
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => navigate("/admin/classes")}
            >
              View Classes
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
