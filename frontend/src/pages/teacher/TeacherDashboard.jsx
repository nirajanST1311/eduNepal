import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Skeleton,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import StatCard from "@/components/common/StatCard";
import { useGetStudentsQuery } from "@/store/api/studentApi";
import { useGetAssignmentsQuery } from "@/store/api/assignmentApi";
import { useGetChaptersQuery } from "@/store/api/chapterApi";
import { useGetSubjectsQuery } from "@/store/api/subjectApi";

export default function TeacherDashboard() {
  const { user } = useSelector((s) => s.auth);
  const { data: students, isLoading: loadingStudents } = useGetStudentsQuery({
    schoolId: user?.schoolId,
  });
  const { data: assignments } = useGetAssignmentsQuery({});
  const { data: chapters } = useGetChaptersQuery({});
  const { data: subjects } = useGetSubjectsQuery({});

  const totalStudents = students?.length || 0;
  const pendingReview = (assignments || []).filter(
    (a) => a.submissionCount > a.gradedCount,
  ).length;
  const contentUploaded = (chapters || []).filter(
    (c) => c.status === "published",
  ).length;

  const today = dayjs();
  const dayName = today.format("dddd");

  const todaysClasses = (subjects || []).slice(0, 3).map((s, i) => ({
    grade: `${s.className || "10"} ${s.section || String.fromCharCode(65 + i)}`,
    subject: s.name,
    time: `${10 + i * 2}:00 ${i < 2 ? "AM" : "PM"}`,
    color: i % 2 === 0 ? "var(--color-text-success)" : "var(--color-text-info)",
  }));

  const pendingTasks = [
    ...(assignments || [])
      .filter((a) => a.submissionCount > a.gradedCount)
      .slice(0, 2)
      .map((a) => ({
        label: `Grade assignments — ${a.className || "Class"}`,
        detail: `${a.submissionCount - a.gradedCount} left`,
        color: "var(--color-text-warning)",
      })),
    ...(chapters || [])
      .filter((c) => c.status === "draft")
      .slice(0, 1)
      .map((c) => ({
        label: `Add ${c.title} notes — Class ${c.className || ""}`,
        detail: "Draft",
        color: "var(--color-text-success)",
      })),
  ];

  const drafts = (chapters || [])
    .filter((c) => c.status === "draft")
    .slice(0, 2);
  const dueAssignments = (assignments || [])
    .filter((a) => a.status === "published")
    .slice(0, 1);

  if (loadingStudents) {
    return (
      <Box>
        <Skeleton width={280} height={36} sx={{ mb: 1 }} />
        <Skeleton width={180} height={20} sx={{ mb: 3 }} />
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid size={{ xs: 6, sm: 3 }} key={i}>
              <Skeleton variant="rounded" height={80} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

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
            Good morning, {user?.name?.split(" ")[0]} sir
          </Typography>
          <Typography
            sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
            {dayName} · {todaysClasses.length} classes today
          </Typography>
        </Box>
        <IconButton size="small">
          <MoreHorizIcon />
        </IconButton>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="My students" value={totalStudents} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Pending review" value={pendingReview} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            label="Content uploaded"
            value={contentUploaded}
            color="var(--color-text-success)"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            label="Avg attendance"
            value="88%"
            color="var(--color-text-success)"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 2 }}>
                Today's classes
              </Typography>
              {todaysClasses.map((c, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    py: 1,
                    borderBottom:
                      i < todaysClasses.length - 1
                        ? "0.5px solid var(--color-border-tertiary)"
                        : "none",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Chip
                      label={c.grade}
                      size="small"
                      sx={{
                        bgcolor: "var(--color-background-info)",
                        color: "var(--color-text-info)",
                        fontWeight: 500,
                        fontSize: "11px",
                        height: 24,
                        borderRadius: "4px",
                      }}
                    />
                    <Typography sx={{ fontSize: "13px" }}>
                      {c.subject}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {c.time}
                  </Typography>
                </Box>
              ))}
              {todaysClasses.length === 0 && (
                <Typography
                  sx={{
                    fontSize: "13px",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  No classes today
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 2 }}>
                Pending tasks
              </Typography>
              {pendingTasks.map((t, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    py: 1,
                    borderBottom:
                      i < pendingTasks.length - 1
                        ? "0.5px solid var(--color-border-tertiary)"
                        : "none",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        bgcolor: t.color,
                        flexShrink: 0,
                      }}
                    />
                    <Typography sx={{ fontSize: "13px" }}>{t.label}</Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "var(--color-text-secondary)",
                      whiteSpace: "nowrap",
                      ml: 1,
                    }}
                  >
                    {t.detail}
                  </Typography>
                </Box>
              ))}
              {pendingTasks.length === 0 && (
                <Typography
                  sx={{
                    fontSize: "13px",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  All caught up
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 2 }}>
            Continue where you left off
          </Typography>
          <Box sx={{ display: "flex", gap: 2, overflowX: "auto" }}>
            {drafts.map((c) => (
              <Box
                key={c._id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  border: "0.5px solid var(--color-border-tertiary)",
                  borderRadius: "var(--border-radius-md)",
                  minWidth: 240,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "var(--color-background-secondary)" },
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: "var(--color-background-warning)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <DescriptionOutlinedIcon
                    sx={{ fontSize: 18, color: "var(--color-text-warning)" }}
                  />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "13px", fontWeight: 500 }} noWrap>
                    Ch. {drafts.indexOf(c) + 1} · {c.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    Class {c.className || "10"} · Draft
                  </Typography>
                </Box>
              </Box>
            ))}
            {dueAssignments.map((a) => (
              <Box
                key={a._id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  border: "0.5px solid var(--color-border-tertiary)",
                  borderRadius: "var(--border-radius-md)",
                  minWidth: 240,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "var(--color-background-secondary)" },
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: "var(--color-background-info)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AssignmentOutlinedIcon
                    sx={{ fontSize: 18, color: "var(--color-text-info)" }}
                  />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "13px", fontWeight: 500 }} noWrap>
                    Assignment · {a.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {a.className || "Class"} · Due{" "}
                    {a.dueDate ? dayjs(a.dueDate).format("dddd") : ""}
                  </Typography>
                </Box>
              </Box>
            ))}
            {drafts.length === 0 && dueAssignments.length === 0 && (
              <Typography
                sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
              >
                No pending items
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
