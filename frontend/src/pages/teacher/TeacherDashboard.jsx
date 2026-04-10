import { useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Skeleton,
  LinearProgress,
  Button,
} from "@mui/material";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import GradingOutlinedIcon from "@mui/icons-material/GradingOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useGetStudentsQuery } from "@/store/api/studentApi";
import { useGetAssignmentsQuery } from "@/store/api/assignmentApi";
import { useGetChaptersQuery } from "@/store/api/chapterApi";
import { useGetSubjectsQuery } from "@/store/api/subjectApi";
import { useGetNoticesQuery } from "@/store/api/noticeApi";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function TeacherDashboard() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const { data: students, isLoading: loadingStudents } = useGetStudentsQuery({
    schoolId: user?.schoolId,
  });
  const { data: assignments = [], isLoading: loadingAssignments } =
    useGetAssignmentsQuery({});
  const { data: chapters = [] } = useGetChaptersQuery({});
  const { data: subjects = [] } = useGetSubjectsQuery({});
  const { data: notices = [] } = useGetNoticesQuery({ limit: 5 });

  const totalStudents = students?.length || 0;
  const pendingReview = useMemo(
    () =>
      assignments.filter(
        (a) => a.submissionCount > a.gradedCount && a.status === "published",
      ),
    [assignments],
  );
  const publishedChapters = chapters.filter(
    (c) => c.status === "published",
  ).length;
  const draftChapters = chapters.filter((c) => c.status === "draft");

  const upcomingDue = useMemo(
    () =>
      assignments
        .filter(
          (a) =>
            a.status === "published" &&
            dayjs(a.dueDate).isAfter(dayjs().subtract(1, "day")),
        )
        .sort((a, b) => dayjs(a.dueDate).diff(dayjs(b.dueDate)))
        .slice(0, 4),
    [assignments],
  );

  const today = dayjs();

  const stats = [
    {
      label: "My Students",
      value: totalStudents,
      icon: <PeopleOutlinedIcon />,
      bg: "var(--color-background-info)",
      color: "var(--color-text-info)",
      path: "/teacher/students",
    },
    {
      label: "Pending Review",
      value: pendingReview.length,
      icon: <GradingOutlinedIcon />,
      bg: "var(--color-background-warning)",
      color: "var(--color-text-warning)",
      path: "/teacher/assignments",
    },
    {
      label: "Published Content",
      value: publishedChapters,
      icon: <MenuBookOutlinedIcon />,
      bg: "var(--color-background-success)",
      color: "var(--color-text-success)",
      path: "/teacher/content",
    },
    {
      label: "My Subjects",
      value: subjects.length,
      icon: <AssignmentOutlinedIcon />,
      bg: "var(--color-background-secondary)",
      color: "var(--color-text-secondary)",
      path: "/teacher/content",
    },
  ];

  if (loadingStudents || loadingAssignments) {
    return (
      <Box>
        <Skeleton width={280} height={36} sx={{ mb: 1 }} />
        <Skeleton width={180} height={20} sx={{ mb: 3 }} />
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid size={{ xs: 6, sm: 3 }} key={i}>
              <Skeleton variant="rounded" height={90} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: "22px", fontWeight: 500, mb: 0.25 }}>
          {getGreeting()}, {user?.name?.split(" ")[0]}
        </Typography>
        <Typography
          sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
        >
          {today.format("dddd, MMMM D")} · {subjects.length} subject
          {subjects.length !== 1 ? "s" : ""} assigned
        </Typography>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((s) => (
          <Grid size={{ xs: 6, sm: 3 }} key={s.label}>
            <Box
              onClick={() => navigate(s.path)}
              sx={{
                bgcolor: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: "var(--border-radius-lg)",
                p: 2,
                cursor: "pointer",
                transition: "all 0.15s",
                "&:hover": { bgcolor: "var(--color-background-secondary)" },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--border-radius-md)",
                  bgcolor: s.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: s.color,
                  mb: 1.5,
                  "& .MuiSvgIcon-root": { fontSize: 18 },
                }}
              >
                {s.icon}
              </Box>
              <Typography
                sx={{ fontSize: "22px", fontWeight: 500, lineHeight: 1.2 }}
              >
                {s.value}
              </Typography>
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "var(--color-text-secondary)",
                  mt: 0.25,
                }}
              >
                {s.label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Main Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Upcoming Assignments */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                  Upcoming Assignments
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                  onClick={() => navigate("/teacher/assignments")}
                  sx={{ fontSize: "12px", textTransform: "none" }}
                >
                  All assignments
                </Button>
              </Box>
              {upcomingDue.length === 0 && (
                <Typography
                  sx={{
                    fontSize: "13px",
                    color: "var(--color-text-secondary)",
                    py: 2,
                  }}
                >
                  No upcoming assignments
                </Typography>
              )}
              {upcomingDue.map((a, i) => {
                const due = dayjs(a.dueDate);
                const isOverdue = due.isBefore(dayjs(), "day");
                const isToday = due.isSame(dayjs(), "day");
                const ungradedCount =
                  (a.submissionCount || 0) - (a.gradedCount || 0);
                return (
                  <Box
                    key={a._id}
                    onClick={() =>
                      a.submissionCount > 0
                        ? navigate(`/teacher/assignments/${a._id}/grade`)
                        : null
                    }
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      py: 1.5,
                      cursor: a.submissionCount > 0 ? "pointer" : "default",
                      borderBottom:
                        i < upcomingDue.length - 1
                          ? "0.5px solid var(--color-border-tertiary)"
                          : "none",
                      "&:hover": {
                        bgcolor:
                          a.submissionCount > 0
                            ? "var(--color-background-secondary)"
                            : "transparent",
                      },
                      borderRadius: "var(--border-radius-md)",
                      px: 1,
                      mx: -1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "var(--border-radius-md)",
                        bgcolor: isOverdue
                          ? "var(--color-background-danger)"
                          : isToday
                            ? "var(--color-background-warning)"
                            : "var(--color-background-info)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <AssignmentOutlinedIcon
                        sx={{
                          fontSize: 18,
                          color: isOverdue
                            ? "var(--color-text-danger)"
                            : isToday
                              ? "var(--color-text-warning)"
                              : "var(--color-text-info)",
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{ fontSize: "13px", fontWeight: 500 }}
                        noWrap
                      >
                        {a.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "12px",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        {a.classId?.grade
                          ? `Class ${a.classId.grade}${a.classId.section || ""}`
                          : ""}{" "}
                        · {a.subjectId?.name || ""}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                      <Typography
                        sx={{
                          fontSize: "12px",
                          fontWeight: 500,
                          color: isOverdue
                            ? "var(--color-text-danger)"
                            : isToday
                              ? "var(--color-text-warning)"
                              : "var(--color-text-secondary)",
                        }}
                      >
                        {isToday
                          ? "Due today"
                          : isOverdue
                            ? `Overdue ${due.format("MMM D")}`
                            : `Due ${due.format("MMM D")}`}
                      </Typography>
                      {ungradedCount > 0 && (
                        <Typography
                          sx={{
                            fontSize: "11px",
                            color: "var(--color-text-warning)",
                          }}
                        >
                          {ungradedCount} to grade
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions + Content Progress */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 2 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {[
                  {
                    label: "Create Assignment",
                    icon: <AssignmentOutlinedIcon sx={{ fontSize: 16 }} />,
                    path: "/teacher/assignments/new",
                  },
                  {
                    label: "Add Chapter",
                    icon: <MenuBookOutlinedIcon sx={{ fontSize: 16 }} />,
                    path: "/teacher/content/add",
                  },
                  {
                    label: "Mark Attendance",
                    icon: <EventAvailableOutlinedIcon sx={{ fontSize: 16 }} />,
                    path: "/teacher/attendance",
                  },
                ].map((a) => (
                  <Box
                    key={a.label}
                    onClick={() => navigate(a.path)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      py: 1,
                      px: 1.5,
                      borderRadius: "var(--border-radius-md)",
                      cursor: "pointer",
                      border: "0.5px solid var(--color-border-tertiary)",
                      "&:hover": {
                        bgcolor: "var(--color-background-secondary)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        color: "var(--color-text-secondary)",
                        display: "flex",
                      }}
                    >
                      {a.icon}
                    </Box>
                    <Typography sx={{ fontSize: "13px", flex: 1 }}>
                      {a.label}
                    </Typography>
                    <ArrowForwardIcon
                      sx={{
                        fontSize: 14,
                        color: "var(--color-text-secondary)",
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 1.5 }}>
                Content Progress
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {publishedChapters} of {chapters.length} chapters published
                </Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color:
                      chapters.length > 0 &&
                      publishedChapters / chapters.length >= 0.5
                        ? "var(--color-text-success)"
                        : "var(--color-text-secondary)",
                  }}
                >
                  {chapters.length
                    ? Math.round((publishedChapters / chapters.length) * 100)
                    : 0}
                  %
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={
                  chapters.length
                    ? (publishedChapters / chapters.length) * 100
                    : 0
                }
                color="success"
                sx={{ mb: 1.5 }}
              />
              {draftChapters.length > 0 && (
                <Typography
                  sx={{ fontSize: "12px", color: "var(--color-text-warning)" }}
                >
                  {draftChapters.length} draft
                  {draftChapters.length !== 1 ? "s" : ""} to publish
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom Row */}
      <Grid container spacing={2}>
        {/* Continue where you left off */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 2 }}>
                Continue where you left off
              </Typography>
              {draftChapters.length === 0 && pendingReview.length === 0 && (
                <Typography
                  sx={{
                    fontSize: "13px",
                    color: "var(--color-text-secondary)",
                    py: 2,
                  }}
                >
                  All caught up — no pending items
                </Typography>
              )}
              <Box sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 0.5 }}>
                {draftChapters.slice(0, 3).map((c) => (
                  <Box
                    key={c._id}
                    onClick={() => navigate(`/teacher/content/${c._id}`)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 1.5,
                      border: "0.5px solid var(--color-border-tertiary)",
                      borderRadius: "var(--border-radius-md)",
                      minWidth: 220,
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: "var(--color-background-secondary)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "var(--border-radius-md)",
                        bgcolor: "var(--color-background-warning)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <DescriptionOutlinedIcon
                        sx={{
                          fontSize: 18,
                          color: "var(--color-text-warning)",
                        }}
                      />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{ fontSize: "13px", fontWeight: 500 }}
                        noWrap
                      >
                        {c.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "12px",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        Draft · {c.topicCount || 0} topics
                      </Typography>
                    </Box>
                  </Box>
                ))}
                {pendingReview.slice(0, 2).map((a) => (
                  <Box
                    key={a._id}
                    onClick={() =>
                      navigate(`/teacher/assignments/${a._id}/grade`)
                    }
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 1.5,
                      border: "0.5px solid var(--color-border-tertiary)",
                      borderRadius: "var(--border-radius-md)",
                      minWidth: 220,
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: "var(--color-background-secondary)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "var(--border-radius-md)",
                        bgcolor: "var(--color-background-info)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <GradingOutlinedIcon
                        sx={{ fontSize: 18, color: "var(--color-text-info)" }}
                      />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{ fontSize: "13px", fontWeight: 500 }}
                        noWrap
                      >
                        {a.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "12px",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        {(a.submissionCount || 0) - (a.gradedCount || 0)} to
                        grade
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Notices */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                  Recent Notices
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                  onClick={() => navigate("/teacher/notices")}
                  sx={{ fontSize: "12px", textTransform: "none" }}
                >
                  View all
                </Button>
              </Box>
              {notices.length === 0 && (
                <Typography
                  sx={{
                    fontSize: "13px",
                    color: "var(--color-text-secondary)",
                    py: 2,
                  }}
                >
                  No notices
                </Typography>
              )}
              {notices.slice(0, 4).map((n, i) => (
                <Box
                  key={n._id}
                  sx={{
                    py: 1.2,
                    borderBottom:
                      i < Math.min(notices.length, 4) - 1
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
                    <CampaignOutlinedIcon
                      sx={{
                        fontSize: 14,
                        color: "var(--color-text-secondary)",
                      }}
                    />
                    <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                      {n.title}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "var(--color-text-secondary)",
                      pl: 3,
                    }}
                  >
                    {dayjs(n.createdAt).format("MMM D")} ·{" "}
                    {n.authorId?.name || "Admin"}
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
