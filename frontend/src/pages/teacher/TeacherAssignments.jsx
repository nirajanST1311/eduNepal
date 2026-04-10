import { useState } from "react";
import { Box, Typography, Button, Tabs, Tab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { useGetAssignmentsQuery } from "@/store/api/assignmentApi";
import StatusBadge from "@/components/common/StatusBadge";
import dayjs from "dayjs";

export default function TeacherAssignments() {
  const [tab, setTab] = useState(0);
  const { data: assignments = [] } = useGetAssignmentsQuery({});
  const navigate = useNavigate();

  const filtered =
    tab === 0
      ? assignments
      : tab === 1
        ? assignments.filter(
            (a) =>
              a.submissionCount > a.gradedCount && a.status === "published",
          )
        : assignments.filter((a) => a.status === "draft");

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography sx={{ fontSize: "22px", fontWeight: 500 }}>
          Assignments
        </Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => navigate("/teacher/assignments/new")}
        >
          New assignment
        </Button>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="All" />
        <Tab label="Pending review" />
        <Tab label="Draft" />
      </Tabs>

      {filtered.map((a) => (
        <Box
          key={a._id}
          sx={{
            bgcolor: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-md)",
            mb: 1,
            py: 1.5,
            px: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
              {a.title}
            </Typography>
            <Typography
              sx={{ fontSize: "12px", color: "var(--color-text-secondary)" }}
            >
              {a.classId?.grade
                ? `Grade ${a.classId.grade}${a.classId.section}`
                : ""}{" "}
              · {a.subjectId?.name} · Due {dayjs(a.dueDate).format("MMM D")}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              sx={{ fontSize: "12px", color: "var(--color-text-secondary)" }}
            >
              {a.gradedCount || 0}/{a.submissionCount || 0} graded
            </Typography>
            <StatusBadge status={a.status} />
            {a.status === "published" && a.submissionCount > 0 && (
              <Button
                size="small"
                variant="outlined"
                sx={{ fontSize: "11px" }}
                onClick={() => navigate(`/teacher/assignments/${a._id}/grade`)}
              >
                Grade
              </Button>
            )}
          </Box>
        </Box>
      ))}

      {filtered.length === 0 && (
        <Typography
          sx={{
            fontSize: "13px",
            color: "var(--color-text-secondary)",
            textAlign: "center",
            py: 4,
          }}
        >
          No assignments
        </Typography>
      )}
    </Box>
  );
}
