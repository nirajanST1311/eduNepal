import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Chip,
} from "@mui/material";
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
        <Typography variant="h5">Assignments</Typography>
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
        <Card key={a._id} sx={{ mb: 1 }}>
          <CardContent
            sx={{
              py: 1.5,
              px: 2,
              "&:last-child": { pb: 1.5 },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {a.title}
              </Typography>
              <Typography variant="caption">
                {a.classId?.grade
                  ? `Grade ${a.classId.grade}${a.classId.section}`
                  : ""}{" "}
                · {a.subjectId?.name} · Due {dayjs(a.dueDate).format("MMM D")}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {a.gradedCount || 0}/{a.submissionCount || 0} graded
              </Typography>
              <StatusBadge status={a.status} />
              {a.status === "published" && a.submissionCount > 0 && (
                <Button
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: "0.7rem" }}
                  onClick={() =>
                    navigate(`/teacher/assignments/${a._id}/grade`)
                  }
                >
                  Grade
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      ))}

      {filtered.length === 0 && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", py: 4 }}
        >
          No assignments
        </Typography>
      )}
    </Box>
  );
}
