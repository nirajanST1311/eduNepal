import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useSelector } from "react-redux";
import { useGetClassesQuery } from "@/store/api/classApi";
import { useGetSubjectsQuery } from "@/store/api/subjectApi";
import { useCreateAssignmentMutation } from "@/store/api/assignmentApi";

export default function CreateAssignment() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    classId: "",
    subjectId: "",
    dueDate: "",
    maxMarks: 100,
    allowLate: false,
  });
  const { data: classes } = useGetClassesQuery({ schoolId: user?.schoolId });
  const { data: subjects } = useGetSubjectsQuery(
    form.classId ? { classId: form.classId } : undefined,
    { skip: !form.classId },
  );
  const [createAssignment, { isLoading }] = useCreateAssignmentMutation();

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (status) => {
    await createAssignment({ ...form, status }).unwrap();
    navigate("/teacher/assignments");
  };

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/teacher/assignments")}
        sx={{ mb: 2 }}
      >
        Back
      </Button>
      <Typography variant="h5" sx={{ mb: 3 }}>
        New assignment
      </Typography>
      <Card>
        <CardContent>
          <TextField
            label="Title"
            fullWidth
            sx={{ mb: 2 }}
            value={form.title}
            onChange={set("title")}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            sx={{ mb: 2 }}
            value={form.description}
            onChange={set("description")}
          />
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>Class</InputLabel>
              <Select
                value={form.classId}
                label="Class"
                onChange={(e) =>
                  setForm({ ...form, classId: e.target.value, subjectId: "" })
                }
              >
                {(classes || []).map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    Grade {c.grade} {c.section}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>Subject</InputLabel>
              <Select
                value={form.subjectId}
                label="Subject"
                onChange={set("subjectId")}
                disabled={!form.classId}
              >
                {(subjects || []).map((s) => (
                  <MenuItem key={s._id} value={s._id}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              label="Due date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={form.dueDate}
              onChange={set("dueDate")}
            />
            <TextField
              label="Max marks"
              type="number"
              sx={{ width: 120 }}
              value={form.maxMarks}
              onChange={set("maxMarks")}
            />
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={form.allowLate}
                onChange={(e) =>
                  setForm({ ...form, allowLate: e.target.checked })
                }
              />
            }
            label={
              <Typography variant="body2">Allow late submissions</Typography>
            }
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={() => handleSubmit("draft")}
              disabled={isLoading || !form.title}
            >
              Save as draft
            </Button>
            <Button
              variant="contained"
              onClick={() => handleSubmit("published")}
              disabled={
                isLoading ||
                !form.title ||
                !form.classId ||
                !form.subjectId ||
                !form.dueDate
              }
            >
              Publish
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
