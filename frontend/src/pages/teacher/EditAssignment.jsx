import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box, Typography, TextField, Button, FormControl, InputLabel, Select,
  MenuItem, Switch, FormControlLabel, CircularProgress, IconButton,
} from "@mui/material";
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
    } catch {}
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
    } catch {}
  };

  if (loadingAssignment || !form) {
    return <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography sx={{ fontSize: "22px", fontWeight: 500, mb: 0.5 }}>Edit Assignment</Typography>
      <Typography sx={{ fontSize: "13px", color: "var(--color-text-secondary)", mb: 3 }}>
        Update assignment details
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 340px" }, gap: 3, alignItems: "start" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <TextField
            label="Title" fullWidth
            value={form.title} onChange={set("title")}
            error={!!errors.title} helperText={errors.title || ""}
          />
          <TextField
            label="Description / Instructions" fullWidth multiline rows={6}
            value={form.description} onChange={set("description")}
            placeholder="Describe the assignment and include any instructions…"
          />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <FormControl fullWidth error={!!errors.classId}>
            <InputLabel shrink>Class *</InputLabel>
            <Select
              value={form.classId}
              label="Class *"
              displayEmpty
              notched
              renderValue={(v) => {
                if (!v) return <span style={{ color: "var(--color-text-secondary)" }}>Select class</span>;
                const c = (classes || []).find((x) => x._id === v);
                return c ? `Class ${c.grade} ${c.section || ""}`.trim() : v;
              }}
              onChange={(e) => { setForm({ ...form, classId: e.target.value, subjectId: "" }); }}
            >
              {(classes || []).map((c) => (
                <MenuItem key={c._id} value={c._id}>Class {c.grade} {c.section}</MenuItem>
              ))}
            </Select>
            {errors.classId && (
              <Typography sx={{ fontSize: "12px", color: "var(--color-text-danger)", mt: 0.5, ml: 1.5 }}>
                {errors.classId}
              </Typography>
            )}
          </FormControl>

          <FormControl fullWidth disabled={!form.classId} error={!!errors.subjectId}>
            <InputLabel shrink>Subject *</InputLabel>
            <Select
              value={form.subjectId}
              label="Subject *"
              displayEmpty
              notched
              renderValue={(v) => {
                if (!v) return <span style={{ color: "var(--color-text-secondary)" }}>{form.classId ? "Select subject" : "Select class first"}</span>;
                const s = (subjects || []).find((x) => x._id === v);
                return s ? s.name : v;
              }}
              onChange={set("subjectId")}
            >
              {(subjects || []).map((s) => (
                <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
              ))}
            </Select>
            {errors.subjectId && (
              <Typography sx={{ fontSize: "12px", color: "var(--color-text-danger)", mt: 0.5, ml: 1.5 }}>
                {errors.subjectId}
              </Typography>
            )}
          </FormControl>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              label="Due Date *" type="date" fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={form.dueDate} onChange={set("dueDate")}
              error={!!errors.dueDate} helperText={errors.dueDate || ""}
            />
            <TextField
              label="Max Marks" type="number" fullWidth
              value={form.maxMarks} onChange={set("maxMarks")}
            />
          </Box>

          <FormControlLabel
            control={
              <Switch checked={form.allowLate}
                onChange={(e) => setForm({ ...form, allowLate: e.target.checked })} />
            }
            label={<Typography sx={{ fontSize: "13px" }}>Allow late submissions</Typography>}
          />

          <Box>
            <Typography sx={{ fontSize: "12px", fontWeight: 500, mb: 1, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Attachment
            </Typography>
            {attachment ? (
              <Box sx={{
                display: "flex", flexDirection: "column", gap: 1,
                p: 2, border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: "var(--border-radius-md)",
                bgcolor: "var(--color-background-secondary)",
              }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <InsertDriveFileOutlinedIcon sx={{ color: "primary.main", fontSize: 20, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: "13px", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {attachment.name}
                  </Typography>
                  <IconButton size="small" onClick={() => setAttachment(null)}>
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
                <Button size="small" variant="outlined" href={attachment.url} target="_blank"
                  sx={{ textTransform: "none", fontSize: "12px", alignSelf: "flex-start" }}>
                  View file
                </Button>
              </Box>
            ) : (
              <Button component="label" variant="outlined" fullWidth
                startIcon={uploadingFile ? <CircularProgress size={16} /> : <CloudUploadOutlinedIcon />}
                disabled={uploadingFile} sx={{ textTransform: "none", fontSize: "13px" }}>
                {uploadingFile ? "Uploading…" : "Upload file"}
                <input type="file" hidden
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4,.mp3"
                  onChange={(e) => {
                    if (e.target.files[0]) handleAttachmentUpload(e.target.files[0]);
                    e.target.value = "";
                  }}
                />
              </Button>
            )}
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, pt: 1, borderTop: "0.5px solid var(--color-border-tertiary)" }}>
            <Button variant="contained" onClick={() => handleSubmit("published")} disabled={isLoading}
              sx={{ textTransform: "none" }}>
              {isLoading ? "Saving…" : "Save & Publish"}
            </Button>
            <Button variant="outlined" onClick={() => handleSubmit("draft")} disabled={isLoading}
              sx={{ textTransform: "none" }}>
              Save as Draft
            </Button>
            <Button onClick={() => navigate(-1)}
              sx={{ textTransform: "none", color: "var(--color-text-secondary)" }}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}