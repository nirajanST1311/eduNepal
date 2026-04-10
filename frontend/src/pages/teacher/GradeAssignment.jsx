import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, TextField, Button, Divider } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import {
  useGetSubmissionsQuery,
  useGradeSubmissionMutation,
} from "@/store/api/assignmentApi";

export default function GradeAssignment() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { data: submissions = [] } = useGetSubmissionsQuery(assignmentId);
  const [gradeSubmission, { isLoading }] = useGradeSubmissionMutation();
  const [idx, setIdx] = useState(0);
  const [marks, setMarks] = useState("");
  const [comment, setComment] = useState("");

  const current = submissions[idx];

  const handleGrade = async () => {
    if (!current) return;
    await gradeSubmission({
      submissionId: current._id,
      marks: Number(marks),
      comment,
    }).unwrap();
    setMarks("");
    setComment("");
    if (idx < submissions.length - 1) setIdx(idx + 1);
  };

  if (!submissions.length) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Typography
          sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
        >
          No submissions yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back
      </Button>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography sx={{ fontSize: "22px", fontWeight: 500 }}>
          Grade submissions
        </Typography>
        <Typography
          sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
        >
          {idx + 1} of {submissions.length}
        </Typography>
      </Box>
      <Box
        sx={{
          bgcolor: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          p: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Typography sx={{ fontSize: "16px", fontWeight: 500 }}>
            {current?.studentId?.name || "Student"}
          </Typography>
          {current?.isLate && (
            <Box
              component="span"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                padding: "2px 8px",
                borderRadius: "4px",
                bgcolor: "var(--color-background-warning)",
                color: "var(--color-text-warning)",
                fontWeight: 500,
                fontSize: "11px",
              }}
            >
              Late
            </Box>
          )}
          {current?.status === "graded" && (
            <Box
              component="span"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                padding: "2px 8px",
                borderRadius: "4px",
                bgcolor: "var(--color-background-success)",
                color: "var(--color-text-success)",
                fontWeight: 500,
                fontSize: "11px",
              }}
            >
              Graded
            </Box>
          )}
        </Box>
        <Typography
          sx={{ fontSize: "13px", color: "var(--color-text-secondary)", mb: 2 }}
        >
          Submitted{" "}
          {current?.submittedAt
            ? new Date(current.submittedAt).toLocaleDateString()
            : "—"}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {current?.text && (
          <Typography sx={{ fontSize: "13px", mb: 2, whiteSpace: "pre-wrap" }}>
            {current.text}
          </Typography>
        )}
        {current?.fileUrl && (
          <Button
            variant="outlined"
            size="small"
            href={current.fileUrl}
            target="_blank"
            sx={{ mb: 2 }}
          >
            View attachment
          </Button>
        )}
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", mb: 2 }}>
          <TextField
            label="Marks"
            type="number"
            size="small"
            sx={{ width: 100 }}
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
          />
          <TextField
            label="Comment"
            size="small"
            fullWidth
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            startIcon={<NavigateBeforeIcon />}
            disabled={idx === 0}
            onClick={() => setIdx(idx - 1)}
          >
            Previous
          </Button>
          <Button
            variant="contained"
            onClick={handleGrade}
            disabled={isLoading || marks === ""}
          >
            Save & next
          </Button>
          <Button
            endIcon={<NavigateNextIcon />}
            disabled={idx === submissions.length - 1}
            onClick={() => setIdx(idx + 1)}
          >
            Next
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
