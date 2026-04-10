import { useState } from "react";
import { Box, Typography, Card, CardContent, Tabs, Tab, Button, TextField, Chip } from "@mui/material";
import { useGetAssignmentsQuery, useSubmitAssignmentMutation } from "@/store/api/assignmentApi";
import StatusBadge from "@/components/common/StatusBadge";

export default function StudentAssignments() {
  const [tab, setTab] = useState(0);
  const { data: assignments = [] } = useGetAssignmentsQuery({});
  const [submitAssignment, { isLoading }] = useSubmitAssignmentMutation();
  const [submitting, setSubmitting] = useState(null);
  const [text, setText] = useState("");

  const due = assignments.filter((a) => !a.submitted && a.status === "published");
  const graded = assignments.filter((a) => a.submission?.status === "graded");
  const lists = [assignments, due, graded];

  const handleSubmit = async (assignmentId) => {
    await submitAssignment({ assignmentId, text }).unwrap();
    setSubmitting(null);
    setText("");
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Assignments</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="All" />
        <Tab label={`Due (${due.length})`} />
        <Tab label="Graded" />
      </Tabs>
      {lists[tab].map((a) => (
        <Card key={a._id} sx={{ mb: 1.5 }}>
          <CardContent sx={{ py: 1.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
              <Typography variant="body1" fontWeight={500}>{a.title}</Typography>
              <StatusBadge status={a.submitted ? (a.submission?.status || "submitted") : "pending"} />
            </Box>
            <Typography variant="caption" color="text.secondary">
              {a.subjectId?.name} · Due {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "—"}
              {a.submission?.marks != null && ` · ${a.submission.marks}/${a.maxMarks}`}
            </Typography>
            {!a.submitted && (
              <Box sx={{ mt: 1 }}>
                {submitting === a._id ? (
                  <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                    <TextField size="small" fullWidth multiline rows={2} placeholder="Your answer…" value={text} onChange={(e) => setText(e.target.value)} />
                    <Button variant="contained" size="small" onClick={() => handleSubmit(a._id)} disabled={isLoading}>Submit</Button>
                    <Button size="small" onClick={() => setSubmitting(null)}>Cancel</Button>
                  </Box>
                ) : (
                  <Button size="small" variant="outlined" onClick={() => setSubmitting(a._id)}>Submit</Button>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      ))}
      {lists[tab].length === 0 && <Typography variant="body2" color="text.secondary">No assignments.</Typography>}
    </Box>
  );
}
