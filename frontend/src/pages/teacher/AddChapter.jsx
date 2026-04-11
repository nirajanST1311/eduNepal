import { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import { useSelector } from "react-redux";
import { useCreateChapterMutation } from "@/store/api/chapterApi";
import { useCreateTopicMutation } from "@/store/api/topicApi";
import { useGetSubjectsQuery } from "@/store/api/subjectApi";
import { useGetClassesQuery } from "@/store/api/classApi";
import { useUploadFileMutation } from "@/store/api/uploadApi";

export default function AddChapter() {
  const { user } = useSelector((s) => s.auth);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const preSubjectId = params.get("subjectId") || "";

  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState(preSubjectId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topics, setTopics] = useState([]);
  const [saveError, setSaveError] = useState("");
  const [uploading, setUploading] = useState({});
  const [saveAttempted, setSaveAttempted] = useState(false);

  const { data: allClasses } = useGetClassesQuery({ schoolId: user?.schoolId });
  const classes = useMemo(
    () =>
      (allClasses || []).filter((c) =>
        user?.classIds?.length ? user.classIds.includes(c._id) : true,
      ),
    [allClasses, user?.classIds],
  );

  const { data: allSubjects } = useGetSubjectsQuery(
    classId ? { classId } : undefined,
    { skip: !classId && !preSubjectId },
  );
  const subjects = useMemo(
    () =>
      (allSubjects || []).filter((s) =>
        user?.subjectIds?.length ? user.subjectIds.includes(s._id) : true,
      ),
    [allSubjects, user?.subjectIds],
  );

  const [createChapter, { isLoading: saving }] = useCreateChapterMutation();
  const [createTopic] = useCreateTopicMutation();
  const [uploadFile] = useUploadFileMutation();

  /* ─── topic helpers ─── */
  const addTopic = () =>
    setTopics([...topics, { title: "", type: "note", content: "", fileUrl: "", fileName: "", status: "published" }]);
  const removeTopic = (i) => setTopics(topics.filter((_, idx) => idx !== i));
  const updateTopic = (i, field, value) => {
    const next = [...topics];
    next[i] = { ...next[i], [field]: value };
    setTopics(next);
  };
  const handleTypeChange = (i, newType) => {
    const next = [...topics];
    next[i] = { ...next[i], type: newType };
    if (newType === "note" || newType === "video") {
      next[i].fileUrl = "";
      next[i].fileName = "";
    }
    setTopics(next);
  };

  const handleFileUpload = async (i, file) => {
    if (!file) return;
    setUploading((prev) => ({ ...prev, [i]: true }));
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadFile(formData).unwrap();
      // Update both fields atomically to avoid stale-closure overwrite
      setTopics((prev) => {
        const next = [...prev];
        next[i] = { ...next[i], fileUrl: result.url, fileName: file.name };
        return next;
      });
    } catch {
      setSaveError("Upload failed — check backend is running and Cloudinary is configured.");
    }
    setUploading((prev) => ({ ...prev, [i]: false }));
  };

  /* ─── save ─── */
  const hasInvalidTopics = topics.some(
    (t) =>
      !t.title.trim() ||
      (t.type === "video" && !t.fileUrl.trim()) ||
      ((t.type === "pdf" || t.type === "audio") && !t.fileUrl),
  );

  const handleSave = async (statusToSave) => {
    setSaveAttempted(true);
    setSaveError("");
    if (!subjectId) { setSaveError("Please select a subject."); return; }
    if (!title.trim()) { setSaveError("Chapter title is required."); return; }
    if (hasInvalidTopics) { setSaveError("Please fill in all required fields for every topic."); return; }
    const topicsSnapshot = [...topics]; // snapshot before awaits to prevent stale closure
    const validTopics = topicsSnapshot.filter((t) => t.title.trim());
    if (statusToSave === "published" && validTopics.length === 0) {
      setSaveError("Add at least one topic before publishing.");
      return;
    }
    try {
      const chapter = await createChapter({ subjectId, title, description, status: statusToSave }).unwrap();
      for (let i = 0; i < topicsSnapshot.length; i++) {
        const t = topicsSnapshot[i];
        if (t.title.trim()) {
          await createTopic({
            chapterId: chapter._id,
            title: t.title,
            type: t.type,
            content: t.content,
            fileUrl: t.fileUrl,
            status: t.status || "published",
            order: i + 1,
          });
        }
      }
      if (statusToSave === "draft") {
        navigate(`/teacher/content/${chapter._id}/edit`);
      } else {
        navigate(`/teacher/content/${chapter._id}`);
      }
    } catch {
      setSaveError("Failed to save. Please try again.");
    }
  };

  const validTopicCount = topics.filter((t) => t.title.trim()).length;

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2, textTransform: "none", color: "var(--color-text-secondary)", fontSize: "13px" }}
      >
        Back
      </Button>
      <Typography sx={{ fontSize: "22px", fontWeight: 500, mb: 3 }}>
        Add Chapter
      </Typography>

      {/* Class + Subject — hidden if preSubjectId is set */}
      {!preSubjectId && (
        <Box
          sx={{
            bgcolor: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
            p: 2,
            mb: 2,
          }}
        >
          <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 2 }}>
            Class & Subject
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Class</InputLabel>
              <Select
                value={classId}
                label="Class"
                onChange={(e) => { setClassId(e.target.value); setSubjectId(""); }}
              >
                {(classes || []).map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    Grade {c.grade} {c.section}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Subject</InputLabel>
              <Select
                value={subjectId}
                label="Subject"
                onChange={(e) => setSubjectId(e.target.value)}
                disabled={!classId}
              >
                {(subjects || []).map((s) => (
                  <MenuItem key={s._id} value={s._id}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      )}

      {/* Chapter details */}
      <Box
        sx={{
          bgcolor: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          p: 2,
          mb: 2,
        }}
      >
        <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 2 }}>
          Chapter Details
        </Typography>
        <TextField
          label="Chapter title"
          fullWidth
          sx={{ mb: 2 }}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          label="Description (optional)"
          fullWidth
          multiline
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Box>

      {/* Topics */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
        <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
          Topics {topics.length > 0 && `(${validTopicCount})`}
        </Typography>
        <Button size="small" startIcon={<AddIcon />} onClick={addTopic} sx={{ textTransform: "none" }}>
          Add topic
        </Button>
      </Box>

      {topics.map((t, i) => (
        <Box
          key={i}
          sx={{
            bgcolor: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-md)",
            mb: 1.5,
            py: 1.5,
            px: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
            <Box
              sx={{
                width: 24, height: 24, borderRadius: "50%",
                bgcolor: "var(--color-background-secondary)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: 500, color: "var(--color-text-secondary)",
                flexShrink: 0, mt: 1,
              }}
            >
              {i + 1}
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                label="Topic title *"
                size="small"
                fullWidth
                sx={{ mb: 1.5 }}
                value={t.title}
                error={saveAttempted && !t.title.trim()}
                helperText={saveAttempted && !t.title.trim() ? "Title is required" : ""}
                onChange={(e) => updateTopic(i, "title", e.target.value)}
              />
              <FormControl size="small" sx={{ minWidth: 120, mb: 1.5 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={t.type}
                  label="Type"
                  onChange={(e) => handleTypeChange(i, e.target.value)}
                >
                  <MenuItem value="note">Notes</MenuItem>
                  <MenuItem value="video">Video</MenuItem>
                  <MenuItem value="pdf">PDF</MenuItem>
                  <MenuItem value="audio">Audio</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 130, mb: 1.5, ml: 1 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={t.status || "published"}
                  label="Status"
                  onChange={(e) => updateTopic(i, "status", e.target.value)}
                >
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>

              {t.type === "note" && (
                <TextField
                  label="Content"
                  multiline
                  rows={3}
                  fullWidth
                  value={t.content}
                  onChange={(e) => updateTopic(i, "content", e.target.value)}
                  placeholder="Write lesson content here…"
                />
              )}

              {t.type === "video" && (
                <TextField
                  label="YouTube / video URL *"
                  fullWidth
                  size="small"
                  value={t.fileUrl}
                  error={saveAttempted && !t.fileUrl.trim()}
                  helperText={saveAttempted && !t.fileUrl.trim() ? "Video URL is required" : ""}
                  onChange={(e) => updateTopic(i, "fileUrl", e.target.value)}
                  placeholder="https://youtube.com/watch?v=…"
                />
              )}

              {(t.type === "pdf" || t.type === "audio") && (
                <Box>
                  {t.fileUrl ? (
                    <Box
                      sx={{
                        display: "flex", alignItems: "center", gap: 1, p: 1.25,
                        borderRadius: "var(--border-radius-md)",
                        border: "0.5px solid var(--color-border-tertiary)",
                        bgcolor: "var(--color-background-secondary)",
                      }}
                    >
                      <InsertDriveFileOutlinedIcon sx={{ fontSize: 16, color: "primary.main", flexShrink: 0 }} />
                      <Typography sx={{ fontSize: "12px", flex: 1 }} noWrap>
                        {t.fileName || "Uploaded"}
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => window.open(t.fileUrl, "_blank", "noopener,noreferrer")}
                        sx={{ fontSize: "12px", textTransform: "none", minWidth: 0, py: 0 }}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => { updateTopic(i, "fileUrl", ""); updateTopic(i, "fileName", ""); }}
                        sx={{ fontSize: "12px", textTransform: "none", minWidth: 0, py: 0 }}
                      >
                        Remove
                      </Button>
                    </Box>
                  ) : (
                    <>
                    <Button
                      variant="outlined"
                      component="label"
                      size="small"
                      disabled={uploading[i]}
                      startIcon={uploading[i] ? <CircularProgress size={14} /> : <CloudUploadOutlinedIcon />}
                      sx={{
                        textTransform: "none", fontSize: "13px",
                        borderColor: saveAttempted && !t.fileUrl ? "error.main" : undefined,
                        color: saveAttempted && !t.fileUrl ? "error.main" : undefined,
                      }}
                    >
                      {uploading[i] ? "Uploading…" : `Upload ${t.type.toUpperCase()} *`}
                      <input
                        type="file"
                        hidden
                        accept={t.type === "pdf" ? ".pdf,application/pdf" : "audio/*"}
                        onChange={(e) => {
                          if (e.target.files[0]) handleFileUpload(i, e.target.files[0]);
                          e.target.value = "";
                        }}
                      />
                    </Button>
                    {saveAttempted && !t.fileUrl && (
                      <Typography sx={{ fontSize: "12px", color: "error.main", mt: 0.5 }}>
                        File upload is required
                      </Typography>
                    )}
                    </>
                  )}
                </Box>
              )}
            </Box>
            <IconButton size="small" color="error" onClick={() => removeTopic(i)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      ))}

      {topics.length === 0 && (
        <Box
          sx={{
            textAlign: "center", py: 4,
            bgcolor: "var(--color-background-primary)",
            border: "0.5px dashed var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-md)", mb: 2,
          }}
        >
          <Typography sx={{ fontSize: "13px", color: "var(--color-text-secondary)", mb: 1 }}>
            No topics yet
          </Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={addTopic} sx={{ textTransform: "none" }}>
            Add first topic
          </Button>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {saveError && (
        <Alert severity="error" sx={{ mb: 1.5, fontSize: "13px" }} onClose={() => setSaveError("")}>
          {saveError}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
        <Button onClick={() => navigate(-1)} sx={{ textTransform: "none", color: "var(--color-text-secondary)" }}>
          Cancel
        </Button>
        <Button
          variant="outlined"
          onClick={() => handleSave("draft")}
          disabled={saving || !title.trim() || !subjectId || hasInvalidTopics}
          sx={{ textTransform: "none" }}
        >
          {saving ? "Saving…" : "Save as Draft"}
        </Button>
        <Button
          variant="contained"
          onClick={() => handleSave("published")}
          disabled={saving || !title.trim() || !subjectId || validTopicCount === 0 || hasInvalidTopics}
          sx={{ textTransform: "none" }}
        >
          {saving ? "Saving…" : "Publish"}
        </Button>
      </Box>
      {validTopicCount === 0 && title.trim() && subjectId && (
        <Typography sx={{ fontSize: "12px", color: "var(--color-text-secondary)", mt: 1, textAlign: "right" }}>
          Add at least one topic to publish
        </Typography>
      )}
    </Box>
  );
}
