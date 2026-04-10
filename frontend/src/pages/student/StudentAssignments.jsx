import { useState } from "react";
import { Box, Typography, Tabs, Tab, Button, TextField } from "@mui/material";
import {
  useGetAssignmentsQuery,
  useSubmitAssignmentMutation,
} from "@/store/api/assignmentApi";
import StatusBadge from "@/components/common/StatusBadge";

export default function StudentAssignments() {
  const [tab, setTab] = useState(0);
  const { data: assignments = [] } = useGetAssignmentsQuery({});
  const [submitAssignment, { isLoading }] = useSubmitAssignmentMutation();
  const [submitting, setSubmitting] = useState(null);
  const [text, setText] = useState("");

  const due = assignments.filter(
    (a) => !a.submitted && a.status === "published",
  );
  const graded = assignments.filter((a) => a.submission?.status === "graded");
  const lists = [assignments, due, graded];

  const handleSubmit = async (assignmentId) => {
    await submitAssignment({ assignmentId, text }).unwrap();
    setSubmitting(null);
    setText("");
  };

  return (
    <Box>
      <Typography sx={{ fontSize: "22px", fontWeight: 500, mb: "14px" }}>
        Assignments
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: "14px" }}>
        <Tab label="All" />
        <Tab label={`Due (${due.length})`} />
        <Tab label="Graded" />
      </Tabs>
      {lists[tab].map((a) => (
        <Box
          key={a._id}
          sx={{
            bgcolor: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
            p: 2,
            mb: "14px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 0.5,
            }}
          >
            <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
              {a.title}
            </Typography>
            <StatusBadge
              status={
                a.submitted ? a.submission?.status || "submitted" : "pending"
              }
            />
          </Box>
          <Typography
            sx={{ fontSize: "12px", color: "var(--color-text-secondary)" }}
          >
            {a.subjectId?.name} · Due{" "}
            {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "—"}
            {a.submission?.marks != null &&
              ` · ${a.submission.marks}/${a.maxMarks}`}
          </Typography>
          {!a.submitted && (
            <Box sx={{ mt: 1 }}>
              {submitting === a._id ? (
                <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                  <TextField
                    size="small"
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Your answer…"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                  <Button
                    size="small"
                    onClick={() => handleSubmit(a._id)}
                    disabled={isLoading}
                  >
                    Submit
                  </Button>
                  <Button size="small" onClick={() => setSubmitting(null)}>
                    Cancel
                  </Button>
                </Box>
              ) : (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setSubmitting(a._id)}
                >
                  Submit
                </Button>
              )}
            </Box>
          )}
        </Box>
      ))}
      {lists[tab].length === 0 && (
        <Typography
          sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
        >
          No assignments.
        </Typography>
      )}
    </Box>
  );
}
