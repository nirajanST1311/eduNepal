import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Avatar,
  Grid,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import {
  useGetSubmissionsQuery,
  useGradeSubmissionMutation,
  useGetAssignmentQuery,
} from "@/store/api/assignmentApi";
import dayjs from "dayjs";

function getInitials(name) {
  if (!name) return "?";
  const parts = name.split(" ");
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0][0].toUpperCase();
}

export default function GradeAssignment() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { data: assignment } = useGetAssignmentQuery(assignmentId);
  const { data: submissions = [] } = useGetSubmissionsQuery(assignmentId);
  const [gradeSubmission, { isLoading }] = useGradeSubmissionMutation();
  const [idx, setIdx] = useState(0);
  const [marks, setMarks] = useState("");
  const [comment, setComment] = useState("");

  const current = submissions[idx];

  useEffect(() => {
    if (current) {
      setMarks(current.marks != null ? String(current.marks) : "");
      setComment(current.comment || "");
    }
  }, [idx, current?._id]);

  const handleGrade = async () => {
    if (!current || marks === "") return;
    await gradeSubmission({
      id: current._id,
      marks: Number(marks),
      comment,
    }).unwrap();
    if (idx < submissions.length - 1) setIdx(idx + 1);
  };

  const gradedCount = submissions.filter((s) => s.status === "graded").length;

  if (!submissions.length) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIosNewIcon sx={{ fontSize: 14 }} />}
          onClick={() => navigate("/teacher/assignments")}
          sx={{
            mb: 2,
            textTransform: "none",
            color: "var(--color-text-secondary)",
            fontSize: "13px",
          }}
        >
          Back to assignments
        </Button>
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography
            sx={{ fontSize: "14px", color: "var(--color-text-secondary)" }}
          >
            No submissions yet for this assignment.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIosNewIcon sx={{ fontSize: 14 }} />}
        onClick={() => navigate("/teacher/assignments")}
        sx={{
          mb: 2,
          textTransform: "none",
          color: "var(--color-text-secondary)",
          fontSize: "13px",
        }}
      >
        Back to assignments
      </Button>

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: "22px", fontWeight: 500, mb: 0.25 }}>
            {assignment?.title || "Grade Submissions"}
          </Typography>
          <Typography
            sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
            {gradedCount}/{submissions.length} graded ·{" "}
            {assignment?.maxMarks || 100} max marks
          </Typography>
        </Box>
        <Chip
          label={`${idx + 1} of ${submissions.length}`}
          size="small"
          sx={{
            bgcolor: "var(--color-background-info)",
            color: "var(--color-text-info)",
            fontWeight: 500,
          }}
        />
      </Box>

      <Grid container spacing={2}>
        {/* Student List Sidebar */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ maxHeight: 500, overflow: "auto" }}>
            <CardContent sx={{ p: 0 }}>
              {submissions.map((s, i) => (
                <Box
                  key={s._id}
                  onClick={() => setIdx(i)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 2,
                    py: 1.2,
                    cursor: "pointer",
                    bgcolor:
                      i === idx
                        ? "var(--color-background-info)"
                        : "transparent",
                    borderBottom: "0.5px solid var(--color-border-tertiary)",
                    "&:hover": {
                      bgcolor:
                        i === idx
                          ? "var(--color-background-info)"
                          : "var(--color-background-secondary)",
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      fontSize: "11px",
                      fontWeight: 500,
                      bgcolor:
                        s.status === "graded"
                          ? "var(--color-background-success)"
                          : "var(--color-background-secondary)",
                      color:
                        s.status === "graded"
                          ? "var(--color-text-success)"
                          : "var(--color-text-secondary)",
                    }}
                  >
                    {s.status === "graded" ? (
                      <CheckCircleOutlinedIcon sx={{ fontSize: 16 }} />
                    ) : (
                      getInitials(s.studentId?.name)
                    )}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        fontWeight: i === idx ? 500 : 400,
                      }}
                      noWrap
                    >
                      {s.studentId?.name || "Student"}
                    </Typography>
                    {s.status === "graded" && s.marks != null && (
                      <Typography
                        sx={{
                          fontSize: "11px",
                          color: "var(--color-text-success)",
                        }}
                      >
                        {s.marks}/{assignment?.maxMarks || 100}
                      </Typography>
                    )}
                  </Box>
                  {s.isLate && (
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: "var(--color-text-warning)",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Submission Content */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Card>
            <CardContent>
              {/* Student info */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 2,
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    fontSize: "13px",
                    fontWeight: 500,
                    bgcolor: "var(--color-background-info)",
                    color: "var(--color-text-info)",
                  }}
                >
                  {getInitials(current?.studentId?.name)}
                </Avatar>
                <Box>
                  <Typography sx={{ fontSize: "15px", fontWeight: 500 }}>
                    {current?.studentId?.name || "Student"}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    Submitted{" "}
                    {current?.submittedAt
                      ? dayjs(current.submittedAt).format("MMM D, h:mm A")
                      : "—"}
                  </Typography>
                </Box>
                <Box sx={{ ml: "auto", display: "flex", gap: 0.75 }}>
                  {current?.isLate && (
                    <Chip
                      label="Late"
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: "11px",
                        bgcolor: "var(--color-background-warning)",
                        color: "var(--color-text-warning)",
                      }}
                    />
                  )}
                  {current?.status === "graded" && (
                    <Chip
                      label="Graded"
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: "11px",
                        bgcolor: "var(--color-background-success)",
                        color: "var(--color-text-success)",
                      }}
                    />
                  )}
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Submission content */}
              <Box
                sx={{
                  minHeight: 120,
                  mb: 2,
                  bgcolor: "var(--color-background-secondary)",
                  borderRadius: "var(--border-radius-md)",
                  p: 2,
                }}
              >
                {current?.text ? (
                  <Typography sx={{ fontSize: "13px", whiteSpace: "pre-wrap" }}>
                    {current.text}
                  </Typography>
                ) : (
                  <Typography
                    sx={{
                      fontSize: "13px",
                      color: "var(--color-text-secondary)",
                      fontStyle: "italic",
                    }}
                  >
                    No text content submitted
                  </Typography>
                )}
              </Box>

              {current?.fileUrl && (
                <Button
                  variant="outlined"
                  size="small"
                  href={current.fileUrl}
                  target="_blank"
                  sx={{ mb: 2, textTransform: "none" }}
                >
                  View Attachment
                </Button>
              )}

              <Divider sx={{ mb: 2 }} />

              {/* Grade Form */}
              <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 1.5 }}>
                Grade
              </Typography>
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField
                  label="Marks"
                  type="number"
                  size="small"
                  sx={{ width: 120 }}
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  InputProps={{
                    inputProps: {
                      min: 0,
                      max: assignment?.maxMarks || 100,
                    },
                  }}
                  helperText={`out of ${assignment?.maxMarks || 100}`}
                />
                <TextField
                  label="Feedback / Comment"
                  size="small"
                  fullWidth
                  multiline
                  minRows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Optional feedback for the student…"
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Button
                  disabled={idx === 0}
                  onClick={() => setIdx(idx - 1)}
                  sx={{ textTransform: "none" }}
                >
                  ← Previous
                </Button>
                <Button
                  variant="contained"
                  onClick={handleGrade}
                  disabled={isLoading || marks === ""}
                  sx={{ textTransform: "none" }}
                >
                  {isLoading
                    ? "Saving…"
                    : idx < submissions.length - 1
                      ? "Save & Next"
                      : "Save Grade"}
                </Button>
                <Button
                  disabled={idx === submissions.length - 1}
                  onClick={() => setIdx(idx + 1)}
                  sx={{ textTransform: "none" }}
                >
                  Next →
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
