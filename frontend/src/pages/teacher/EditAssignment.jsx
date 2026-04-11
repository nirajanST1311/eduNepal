import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box, Typography, TextField, Button, FormControl, InputLabel, Select,
  MenuItem, Switch, FormControlLabel, Grid, Card, CardContent, CircularProgress,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import { useSelector } from "react-redux";
import { useGetClassesQuery } from "@/store/api/classApi";
import { useGetSubjectsQuery } from "@/store/api/subjectApi";
import { useGetAssignmentQuery, useUpdateAssignmentMutation } from "@/store/api/assignmentApi";
import { useUploadFileMutation } from "@/store/api/uploadApi";
import dayjs from "dayjs";

export default function EditAssignment() {
  const { assignmentId } = useParams();
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  const { data: existing, isLoading: loadingAssignment } = useGetAssignmentQuery(assignmentId);
  const [updateAssignment, { isLoading }] = useUpdateAssignmentMutation();
  const [uploadFile] = useUploadFileMutation();

  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [attachment, setAttachment] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Prefill form once assignment loads
  useEffect(() => {
    if (existing && !form) {
      setForm({
        title: existing.title || "",
        description: existing.description || "",
        classId: existing.classId?._id || existing.classId || "",
        subjectId: existing.subjectId?._id || existing.subjectId || "",
        dueDate: existing.dueDate ? dayjs(existing.dueDate).format("YYYY-MM-DD") : "",
        maxMarks: existing.maxMarks ?? 100,
        allowLate: existing.allowLate ?? false,
      });
      if (existing.fileUrl) setAttachment({ url: existing.fileUrl, name: "Existing attachment" });
    }
  }, [existing]);

  const { data: allClasses } = useGetClassesQuery({ schoolId: user?.schoolId });
  const classes = useMemo(
    () => (allClasses || []).filter((c) => user?.classIds?.length ? user.classIds.includes(c._id) : true),
    [allClasses, user?.classIds],
  );
  const { data: allSubjects } = useGetSubjectsQuery(
    form?.classId ? { classId: form.classId } : undefined,
    { skip: !form?.classId },
  );
  const subjects = useMemo(
    () => (allSubjects || []).filter((s) => user?.subjectIds?.length ? user.subjectIds.includes(s._id) : true),
    [allSubjects, user?.subjectIds],
  );

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

  const handleAttachmentUpload = async (file) => {
    setUploadingFile(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadFile(fd).unwrap();
      setAttachment({ url: result.url, name: file.name });
    } catch { /* ignore */ }
    setUploadingFile(false);
  };

  const handleSubmit = async (status) => {
    if (status === "published" && !validate()) return;
    if (status === "draft" && !form.title.trim()) { setErrors({ title: "Title is required" }); return; }
    try {
      await updateAssignment({
        id: assignmentId,
        ...form,
        status,
        ...(attachment?.url && { fileUrl: attachment.url }),
      }).unwrap();
      navigate("/teacher/assignments");
    } catch { /* handled by RTK */ }
  };

  if (loadingAssignment || !form) {
    return <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIosNewIcon sx={{ fontSize: 14 }} />}
        onClick={() => navigate("/teacher/assignments")}
        sx={{ mb: 2, textTransform: "none", color: "var(--color-text-secondary)", fontSize: "13px" }}
      >
        Back to assignments
      </Button>

      <Typography sx={{ fontSize: "22px", fontWeight: 500, mb: 0.5 }}>Edit Assignment</Typography>
      <Typography sx={{ fontSize: "13px", color: "var(--color-text-secondary)", mb: 3 }}>
        Update assignment details
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>Assignment Details</Typography>
              <TextField label="Title" fullWidth value={form.title} onChange={set("title")}
                error={!!errors.title} helperText={errors.title} />
              <TextField label="Description / Instructions" fullWidth multiline rows={4}
                value={form.description} onChange={set("description")} />

              <Box>
                <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 1 }}>Attachment (optional)</Typography>
                {attachment ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1.5,
                    border: "1px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)",
                    bgcolor: "var(--color-background-secondary)" }}>
                    <InsertDriveFileOutlinedIcon sx={{ color: "primary.main", fontSize: 20 }} />
                    <Typography sx={{ fontSize: "13px", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {attachment.name}
                    </Typography>
                    <Button size="small" href={attachment.url} target="_blank"
                      sx={{ textTransform: "none", fontSize: "12px", minWidth: 0 }}>View</Button>
                    <Box component="span" onClick={() => setAttachment(null)}
                      sx={{ cursor: "pointer", display: "flex", color: "text.secondary", "&:hover": { color: "error.main" } }}>
                      <CloseIcon sx={{ fontSize: 18 }} />
                    </Box>
                  </Box>
                ) : (
                  <Button component="label" variant="outlined"
                    startIcon={uploadingFile ? <CircularProgress size={16} /> : <CloudUploadOutlinedIcon />}
                    disabled={uploadingFile} sx={{ textTransform: "none", fontSize: "13px" }}>
                    {uploadingFile ? "Uploading…" : "Upload file"}
                    <input type="file" hidden
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4,.mp3"
                      onChange={(e) => { if (e.target.files[0]) handleAttachmentUpload(e.target.files[0]); e.target.value = ""; }} />
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>Class &amp; Subject</Typography>
              <FormControl fullWidth error={!!errors.classId}>
                <InputLabel>Class</InputLabel>
                <Select value={form.classId} label="Class"
                  onChange={(e) => { setForm({ ...form, classId: e.target.value, subjectId: "" }); }}>
                  {(classes || []).map((c) => (
                    <MenuItem key={c._id} value={c._id}>Class {c.grade} {c.section}</MenuItem>
                  ))}
                </Select>
                {errors.classId && <Typography sx={{ fontSize: "12px", color: "var(--color-text-danger)", mt: 0.5, ml: 1.5 }}>{errors.classId}</Typography>}
              </FormControl>
              <FormControl fullWidth disabled={!form.classId} error={!!errors.subjectId}>
                <InputLabel>Subject</InputLabel>
                <Select value={form.subjectId} label="Subject" onChange={set("subjectId")}>
                  {(subjects || []).map((s) => (
                    <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
                  ))}
                </Select>
                {errors.subjectId && <Typography sx={{ fontSize: "12px", color: "var(--color-text-danger)", mt: 0.5, ml: 1.5 }}>{errors.subjectId}</Typography>}
              </FormControl>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>Settings</Typography>
              <TextField label="Due Date" type="date" fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                value={form.dueDate} onChange={set("dueDate")}
                error={!!errors.dueDate} helperText={errors.dueDate} />
              <TextField label="Max Marks" type="number" fullWidth
                value={form.maxMarks} onChange={set("maxMarks")} />
              <FormControlLabel
                control={<Switch checked={form.allowLate} onChange={(e) => setForm({ ...form, allowLate: e.target.checked })} />}
                label={<Typography sx={{ fontSize: "13px" }}>Allow late submissions</Typography>}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", gap: 1.5, mt: 3, justifyContent: "flex-end" }}>
        <Button onClick={() => navigate("/teacher/assignments")} sx={{ textTransform: "none", color: "text.primary" }}>
          Cancel
        </Button>
        <Button variant="outlined" onClick={() => handleSubmit("draft")} disabled={isLoading} sx={{ textTransform: "none" }}>
          Save as Draft
        </Button>
        <Button variant="contained" onClick={() => handleSubmit("published")} disabled={isLoading} sx={{ textTransform: "none" }}>
          {isLoading ? "Saving…" : "Save & Publish"}
        </Button>
      </Box>
    </Box>
  );
}
