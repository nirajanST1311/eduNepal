import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box, Typography, TextField, Button, Divider, Avatar, Chip, LinearProgress,
} from "@mui/material";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import {
  useGetSubmissionsQuery,
  useGradeSubmissionMutation,
  useGetAssignmentQuery,
} from "@/store/api/assignmentApi";
import dayjs from "dayjs";

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0][0].toUpperCase();
}

export default function GradeAssignment() {
  const { assignmentId } = useParams();
  const { data: assignment } = useGetAssignmentQuery(assignmentId);
  const { data: submissions = [] } = useGetSubmissionsQuery(assignmentId);
  const [gradeSubmission, { isLoading }] = useGradeSubmissionMutation();
  const [idx, setIdx] = useState(0);
  const [marks, setMarks] = useState("");
  const [comment, setComment] = useState("");

  const maxMarks = assignment?.maxMarks ?? 100;
  const current = submissions[idx];

  const gradedSubs = submissions.filter((s) => s.marks != null);
  const gradedCount = gradedSubs.length;
  const totalSubs = submissions.length;
  const avgScore =
    gradedCount > 0
      ? Math.round(gradedSubs.reduce((acc, s) => acc + s.marks, 0) / gradedCount)
      : null;
  const passCount = gradedSubs.filter((s) => (s.marks / maxMarks) * 100 >= 40).length;
  const passRate = gradedCount > 0 ? Math.round((passCount / gradedCount) * 100) : null;

  const marksNum = marks !== "" ? Number(marks) : null;
  const marksPct = marksNum !== null ? (marksNum / maxMarks) * 100 : null;
  const marksColor =
    marksPct === null ? "inherit"
      : marksPct < 40 ? "var(--color-text-danger)"
      : marksPct < 60 ? "var(--color-text-warning)"
      : "var(--color-text-success)";
  const currentPct = current?.marks != null ? (current.marks / maxMarks) * 100 : null;

  useEffect(() => {
    if (current) {
      setMarks(current.marks != null ? String(current.marks) : "");
      setComment(current.comment || "");
    }
  }, [idx, current?._id]);

  const handleGrade = async () => {
    if (!current || marks === "") return;
    try {
      await gradeSubmission({ id: current._id, marks: Number(marks), comment }).unwrap();
      if (idx < submissions.length - 1) setIdx(idx + 1);
    } catch { /* ignore */ }
  };

  if (!submissions.length) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography sx={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
          No submissions yet for this assignment.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Typography sx={{ fontSize: "22px", fontWeight: 600 }}>
            {assignment?.title || "Grade Submissions"}
          </Typography>
          <Chip
            label={`${idx + 1} / ${totalSubs}`}
            size="small"
            sx={{
              bgcolor: "var(--color-background-secondary)",
              color: "var(--color-text-secondary)",
              fontWeight: 500,
            }}
          />
        </Box>

        {/* Stats row */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 1.5 }}>
          <Box sx={{
            px: 1.5, py: 0.6,
            bgcolor: "var(--color-background-secondary)",
            borderRadius: "var(--border-radius-sm)",
          }}>
            <Typography sx={{ fontSize: "12px" }}>{gradedCount} / {totalSubs} graded</Typography>
          </Box>
          {avgScore !== null && (
            <Box sx={{
              px: 1.5, py: 0.6,
              bgcolor: "var(--color-background-secondary)",
              borderRadius: "var(--border-radius-sm)",
            }}>
              <Typography sx={{ fontSize: "12px" }}>Avg: {avgScore} / {maxMarks}</Typography>
            </Box>
          )}
          {passRate !== null && (
            <Box sx={{
              px: 1.5, py: 0.6,
              borderRadius: "var(--border-radius-sm)",
              bgcolor:
                passRate >= 60 ? "var(--color-background-success)"
                  : passRate >= 40 ? "var(--color-background-warning)"
                  : "var(--color-background-danger)",
            }}>
              <Typography sx={{
                fontSize: "12px", fontWeight: 500,
                color:
                  passRate >= 60 ? "var(--color-text-success)"
                    : passRate >= 40 ? "var(--color-text-warning)"
                    : "var(--color-text-danger)",
              }}>
                Pass rate: {passRate}%
              </Typography>
            </Box>
          )}
        </Box>

        <LinearProgress
          variant="determinate"
          value={(gradedCount / totalSubs) * 100}
          sx={{ height: 4, borderRadius: 2 }}
        />
        <Typography sx={{ fontSize: "11px", color: "var(--color-text-secondary)", mt: 0.5 }}>
          {Math.round((gradedCount / totalSubs) * 100)}% graded
        </Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "220px 1fr" }, gap: 2 }}>
        {/* Student list sidebar */}
        <Box sx={{
          bgcolor: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-md)",
          overflow: "hidden",
          maxHeight: 560,
          overflowY: "auto",
        }}>
          {submissions.map((s, i) => {
            const sg = s.marks != null;
            const spct = sg ? (s.marks / maxMarks) * 100 : null;
            const scolor =
              spct !== null
                ? spct < 40 ? "var(--color-text-danger)"
                : spct < 60 ? "var(--color-text-warning)"
                : "var(--color-text-success)"
                : "var(--color-text-secondary)";
            const sbg =
              spct !== null
                ? spct < 40 ? "var(--color-background-danger)"
                : spct < 60 ? "var(--color-background-warning)"
                : "var(--color-background-success)"
                : "var(--color-background-secondary)";
            return (
              <Box
                key={s._id}
                onClick={() => setIdx(i)}
                sx={{
                  display: "flex", alignItems: "center", gap: 1.5,
                  px: 2, py: 1.25, cursor: "pointer",
                  bgcolor: i === idx ? "var(--color-background-info)" : "transparent",
                  borderBottom: "0.5px solid var(--color-border-tertiary)",
                  "&:hover": {
                    bgcolor: i === idx
                      ? "var(--color-background-info)"
                      : "var(--color-background-secondary)",
                  },
                }}
              >
                <Avatar sx={{
                  width: 28, height: 28, fontSize: "11px", fontWeight: 500,
                  bgcolor: sbg,
                  color: scolor,
                }}>
                  {sg ? <CheckCircleOutlinedIcon sx={{ fontSize: 16 }} /> : getInitials(s.studentId?.name)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: "12px", fontWeight: i === idx ? 500 : 400 }} noWrap>
                    {s.studentId?.name || "Student"}
                  </Typography>
                  {sg ? (
                    <Typography sx={{ fontSize: "11px", color: scolor, fontWeight: 500 }}>
                      {s.marks}/{maxMarks}{spct < 40 ? " · Fail" : spct < 60 ? " · Low" : " · Pass"}
                    </Typography>
                  ) : (
                    <Typography sx={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>
                      Pending
                    </Typography>
                  )}
                </Box>
                {s.isLate && (
                  <Box sx={{
                    width: 6, height: 6, borderRadius: "50%",
                    bgcolor: "var(--color-text-warning)", flexShrink: 0,
                  }} />
                )}
              </Box>
            );
          })}
        </Box>

        {/* Grade panel */}
        <Box sx={{
          bgcolor: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-md)",
          p: 2.5,
        }}>
          {/* Student header */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <Avatar sx={{
              width: 38, height: 38, fontSize: "14px", fontWeight: 500,
              bgcolor: "var(--color-background-info)",
              color: "var(--color-text-info)",
            }}>
              {getInitials(current?.studentId?.name)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: "15px", fontWeight: 500 }}>
                {current?.studentId?.name || "Student"}
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
                Submitted{" "}
                {current?.submittedAt
                  ? dayjs(current.submittedAt).format("MMM D, h:mm A")
                  : "—"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 0.75 }}>
              {current?.isLate && (
                <Chip
                  label="Late" size="small"
                  sx={{ height: 22, fontSize: "11px", bgcolor: "var(--color-background-warning)", color: "var(--color-text-warning)" }}
                />
              )}
              {currentPct !== null && (
                <Chip
                  label={`${current.marks}/${maxMarks}`}
                  size="small"
                  sx={{
                    height: 22, fontSize: "11px", fontWeight: 600,
                    bgcolor:
                      currentPct < 40 ? "var(--color-background-danger)"
                        : currentPct < 60 ? "var(--color-background-warning)"
                        : "var(--color-background-success)",
                    color:
                      currentPct < 40 ? "var(--color-text-danger)"
                        : currentPct < 60 ? "var(--color-text-warning)"
                        : "var(--color-text-success)",
                  }}
                />
              )}
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Submission text */}
          <Box sx={{
            minHeight: 80, mb: 2,
            bgcolor: "var(--color-background-secondary)",
            borderRadius: "var(--border-radius-sm)",
            p: 2,
          }}>
            {current?.text ? (
              <Typography sx={{ fontSize: "13px", whiteSpace: "pre-wrap" }}>
                {current.text}
              </Typography>
            ) : (
              <Typography sx={{ fontSize: "13px", color: "var(--color-text-secondary)", fontStyle: "italic" }}>
                No text content submitted
              </Typography>
            )}
          </Box>

          {current?.fileUrl && (
            <Button
              variant="outlined" size="small"
              href={current.fileUrl} target="_blank" rel="noopener noreferrer"
              sx={{ mb: 2, textTransform: "none" }}
            >
              View Attachment
            </Button>
          )}

          <Divider sx={{ mb: 2 }} />

          {/* Grade form */}
          <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 1.5 }}>Grade</Typography>
          <Box sx={{ display: "flex", gap: 2, mb: 0.5, alignItems: "flex-start" }}>
            <Box sx={{ width: 140, flexShrink: 0 }}>
              <TextField
                label="Marks" type="number" size="small" fullWidth
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                slotProps={{ htmlInput: { min: 0, max: maxMarks } }}
                helperText={`out of ${maxMarks}`}
                sx={{ "& .MuiInputBase-input": { color: marksColor, fontWeight: marks ? 600 : 400 } }}
              />
              {marksPct !== null && (
                <Typography sx={{ fontSize: "11px", color: marksColor, mt: 0.25, fontWeight: 500 }}>
                  {Math.round(marksPct)}%
                  {marksPct < 40 ? " · Fail" : marksPct < 60 ? " · Low" : " · Pass"}
                </Typography>
              )}
            </Box>
            <TextField
              label="Feedback (optional)" size="small" fullWidth multiline minRows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optional feedback for the student…"
            />
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
            <Button disabled={idx === 0} onClick={() => setIdx(idx - 1)} sx={{ textTransform: "none" }}>
              ← Previous
            </Button>
            <Button
              variant="contained" onClick={handleGrade}
              disabled={isLoading || marks === ""}
              sx={{ textTransform: "none" }}
            >
              {isLoading ? "Saving…" : idx < submissions.length - 1 ? "Save & Next →" : "Save Grade"}
            </Button>
            <Button
              disabled={idx === submissions.length - 1}
              onClick={() => setIdx(idx + 1)}
              sx={{ textTransform: "none" }}
            >
              Next →
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
