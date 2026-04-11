import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { useSelector } from "react-redux";
import { useGetClassesQuery } from "@/store/api/classApi";
import { useGetSubjectsQuery } from "@/store/api/subjectApi";
import { useCreateAssignmentMutation } from "@/store/api/assignmentApi";
import { useUploadFileMutation } from "@/store/api/uploadApi";

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
  const [errors, setErrors] = useState({});
  const { data: allClasses } = useGetClassesQuery({ schoolId: user?.schoolId });
  const classes = useMemo(
    () =>
      (allClasses || []).filter((c) =>
        user?.classIds?.length ? user.classIds.includes(c._id) : true,
      ),
    [allClasses, user?.classIds],
  );
  const { data: allSubjects } = useGetSubjectsQuery(
    form.classId ? { classId: form.classId } : undefined,
    { skip: !form.classId },
  );
  const subjects = useMemo(
    () =>
      (allSubjects || []).filter((s) =>
        user?.subjectIds?.length ? user.subjectIds.includes(s._id) : true,
      ),
    [allSubjects, user?.subjectIds],
  );
  const [createAssignment, { isLoading }] = useCreateAssignmentMutation();
  const [uploadFile] = useUploadFileMutation();
  const [attachment, setAttachment] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const handleAttachmentUpload = async (file) => {
    if (!file) return;
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadFile(formData).unwrap();
      setAttachment({ url: result.url, name: file.name });
    } catch {
      // upload failed
    }
    setUploadingFile(false);
  };

  const set = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.classId) errs.classId = "Select a class";
    if (!form.subjectId) errs.subjectId = "Select a subject";
    if (!form.dueDate) errs.dueDate = "Due date is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (status) => {
    if (status === "published" && !validate()) return;
    if (status === "draft" && !form.title.trim()) {
      setErrors({ title: "Title is required" });
      return;
    }
    try {
      await createAssignment({
        ...form,
        status,
        ...(attachment?.url && { fileUrl: attachment.url }),
      }).unwrap();
      navigate("/teacher/assignments");
    } catch {
      /* handled by RTK */
    }
  };

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

      <Typography sx={{ fontSize: "22px", fontWeight: 500, mb: 0.5 }}>
        New Assignment
      </Typography>
      <Typography
        sx={{ fontSize: "13px", color: "var(--color-text-secondary)", mb: 3 }}
      >
        Create an assignment for your students
      </Typography>

      <Grid container spacing={3}>
        {/* Left Column - Main Details */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent
              sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
            >
              <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                Assignment Details
              </Typography>
              <TextField
                label="Title"
                fullWidth
                value={form.title}
                onChange={set("title")}
                error={!!errors.title}
                helperText={errors.title}
                placeholder="e.g. Chapter 5 — Practice Problems"
              />
              <TextField
                label="Description / Instructions"
                fullWidth
                multiline
                rows={4}
                value={form.description}
                onChange={set("description")}
                placeholder="Describe the assignment, include instructions…"
              />

              {/* Attachment Upload */}
              <Box>
                <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 1 }}>
                  Attachment (optional)
                </Typography>
                {attachment ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      p: 1.5,
                      border: "1px solid var(--color-border-tertiary)",
                      borderRadius: "var(--border-radius-md)",
                      bgcolor: "var(--color-background-secondary)",
                    }}
                  >
                    <InsertDriveFileOutlinedIcon
                      sx={{ color: "primary.main", fontSize: 20 }}
                    />
                    <Typography
                      sx={{
                        fontSize: "13px",
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {attachment.name}
                    </Typography>
                    <Button
                      size="small"
                      href={attachment.url}
                      target="_blank"
                      sx={{ textTransform: "none", fontSize: "12px", minWidth: 0 }}
                    >
                      View
                    </Button>
                    <Box
                      component="span"
                      onClick={() => setAttachment(null)}
                      sx={{
                        cursor: "pointer",
                        display: "flex",
                        color: "text.secondary",
                        "&:hover": { color: "error.main" },
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 18 }} />
                    </Box>
                  </Box>
                ) : (
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={
                      uploadingFile ? (
                        <CircularProgress size={16} />
                      ) : (
                        <CloudUploadOutlinedIcon />
                      )
                    }
                    disabled={uploadingFile}
                    sx={{ textTransform: "none", fontSize: "13px" }}
                  >
                    {uploadingFile ? "Uploading…" : "Upload file"}
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.mp4,.mp3"
                      onChange={(e) => {
                        if (e.target.files[0]) handleAttachmentUpload(e.target.files[0]);
                        e.target.value = "";
                      }}
                    />
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Settings */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent
              sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
            >
              <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                Class & Subject
              </Typography>
              <FormControl fullWidth error={!!errors.classId}>
                <InputLabel>Class</InputLabel>
                <Select
                  value={form.classId}
                  label="Class"
                  onChange={(e) => {
                    setForm({
                      ...form,
                      classId: e.target.value,
                      subjectId: "",
                    });
                    if (errors.classId)
                      setErrors((p) => ({ ...p, classId: "" }));
                  }}
                >
                  {(classes || []).map((c) => (
                    <MenuItem key={c._id} value={c._id}>
                      Class {c.grade} {c.section}
                    </MenuItem>
                  ))}
                </Select>
                {errors.classId && (
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "var(--color-text-danger)",
                      mt: 0.5,
                      ml: 1.5,
                    }}
                  >
                    {errors.classId}
                  </Typography>
                )}
              </FormControl>
              <FormControl
                fullWidth
                disabled={!form.classId}
                error={!!errors.subjectId}
              >
                <InputLabel>Subject</InputLabel>
                <Select
                  value={form.subjectId}
                  label="Subject"
                  onChange={set("subjectId")}
                >
                  {(subjects || []).map((s) => (
                    <MenuItem key={s._id} value={s._id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.subjectId && (
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "var(--color-text-danger)",
                      mt: 0.5,
                      ml: 1.5,
                    }}
                  >
                    {errors.subjectId}
                  </Typography>
                )}
              </FormControl>
            </CardContent>
          </Card>

          <Card>
            <CardContent
              sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
            >
              <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                Settings
              </Typography>
              <TextField
                label="Due Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={form.dueDate}
                onChange={set("dueDate")}
                error={!!errors.dueDate}
                helperText={errors.dueDate}
              />
              <TextField
                label="Max Marks"
                type="number"
                fullWidth
                value={form.maxMarks}
                onChange={set("maxMarks")}
              />
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
                  <Typography sx={{ fontSize: "13px" }}>
                    Allow late submissions
                  </Typography>
                }
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          mt: 3,
          justifyContent: "flex-end",
        }}
      >
        <Button
          onClick={() => navigate("/teacher/assignments")}
          sx={{ textTransform: "none", color: "text.primary" }}
        >
          Cancel
        </Button>
        <Button
          variant="outlined"
          onClick={() => handleSubmit("draft")}
          disabled={isLoading}
          sx={{ textTransform: "none" }}
        >
          Save as Draft
        </Button>
        <Button
          variant="contained"
          onClick={() => handleSubmit("published")}
          disabled={isLoading}
          sx={{ textTransform: "none" }}
        >
          {isLoading ? "Publishing…" : "Publish"}
        </Button>
      </Box>
    </Box>
  );
}
