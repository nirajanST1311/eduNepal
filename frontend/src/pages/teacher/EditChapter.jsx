import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Divider,
  Skeleton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIosNew";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import PublishOutlinedIcon from "@mui/icons-material/PublishOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import CloseIcon from "@mui/icons-material/Close";
import {
  useGetChapterQuery,
  useUpdateChapterMutation,
} from "@/store/api/chapterApi";
import {
  useCreateTopicMutation,
  useUpdateTopicMutation,
  useDeleteTopicMutation,
} from "@/store/api/topicApi";
import { useUploadFileMutation } from "@/store/api/uploadApi";

export default function EditChapter() {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const { data: chapter, isLoading } = useGetChapterQuery(chapterId);
  const [updateChapter, { isLoading: saving }] = useUpdateChapterMutation();
  const [createTopic] = useCreateTopicMutation();
  const [updateTopic] = useUpdateTopicMutation();
  const [deleteTopic] = useDeleteTopicMutation();
  const [uploadFile] = useUploadFileMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topics, setTopics] = useState([]);
  const [topicDeleteIdx, setTopicDeleteIdx] = useState(null);
  const [uploading, setUploading] = useState({});
  const [saveAttempted, setSaveAttempted] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (chapter) {
      setTitle(chapter.title || "");
      setDescription(chapter.description || "");
      setTopics(
        (chapter.topics || []).map((t) => ({
          _id: t._id,
          title: t.title || "",
          type: t.type || "note",
          content: t.content || "",
          fileUrl: t.fileUrl || "",
          fileName: "",          status: t.status || "published",          _existing: true,
        })),
      );
    }
  }, [chapter]);

  const addTopic = () =>
    setTopics([
      ...topics,
      { title: "", type: "note", content: "", fileUrl: "", fileName: "", status: "draft", _existing: false },
    ]);

  const removeTopic = () => {
    const i = topicDeleteIdx;
    const t = topics[i];
    if (t._existing && t._id) deleteTopic(t._id);
    setTopics(topics.filter((_, idx) => idx !== i));
    setTopicDeleteIdx(null);
  };

  const updateField = (i, field, value) => {
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

  const clearTopicFile = (i) => {
    const next = [...topics];
    next[i] = { ...next[i], fileUrl: "", fileName: "" };
    setTopics(next);
  };

  const handleFileUpload = async (i, file) => {
    if (!file) return;
    setUploading((prev) => ({ ...prev, [i]: true }));
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadFile(formData).unwrap();
      setTopics((prev) => {
        const next = [...prev];
        next[i] = { ...next[i], fileUrl: result.url, fileName: file.name };
        return next;
      });
    } catch {
      setSnackbar({
        open: true,
        message: "Upload failed — check backend is running and Cloudinary is configured.",
        severity: "error",
      });
    }
    setUploading((prev) => ({ ...prev, [i]: false }));
  };

  const handleSave = async (newStatus) => {
    const topicsSnapshot = [...topics]; // snapshot before async ops that may reset state
    setSaveAttempted(true);
    if (!title.trim()) {
      setSnackbar({ open: true, message: "Chapter title is required.", severity: "error" });
      return;
    }
    const validTopics = topicsSnapshot.filter((t) => t.title.trim());
    if (newStatus === "published" && validTopics.length === 0) {
      setSnackbar({
        open: true,
        message: "Add at least one topic before publishing.",
        severity: "error",
      });
      return;
    }
    try {
      await updateChapter({ id: chapterId, title, description, status: newStatus }).unwrap();
      for (let i = 0; i < topicsSnapshot.length; i++) {
        const t = topicsSnapshot[i];
        if (!t.title.trim()) continue;
        const topicData = { title: t.title, type: t.type, content: t.content, fileUrl: t.fileUrl, status: t.status || "published", order: i + 1 };
        if (t._existing && t._id) {
          await updateTopic({ id: t._id, ...topicData });
        } else {
          await createTopic({ chapterId, ...topicData });
        }
      }
      if (newStatus === "draft") {
        setSnackbar({ open: true, message: "Saved as draft.", severity: "success" });
      } else {
        navigate(`/teacher/content/${chapterId}`);
      }
    } catch {
      setSnackbar({ open: true, message: "Failed to save chapter.", severity: "error" });
    }
  };

  if (isLoading) {
    return (
      <Box>
        <Skeleton width={120} height={36} sx={{ mb: 2 }} />
        <Skeleton width={300} height={32} sx={{ mb: 3 }} />
        <Skeleton variant="rounded" height={200} />
      </Box>
    );
  }

  if (!chapter) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon sx={{ fontSize: 14 }} />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2, textTransform: "none", color: "var(--color-text-secondary)", fontSize: "13px" }}
        >
          Back
        </Button>
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography sx={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
            Chapter not found.
          </Typography>
        </Box>
      </Box>
    );
  }

  const validTopicCount = topics.filter((t) => t.title.trim()).length;
  const hasInvalidTopics = topics.some(
    (t) =>
      !t.title.trim() ||
      (t.type === "video" && !t.fileUrl.trim()) ||
      ((t.type === "pdf" || t.type === "audio") && !t.fileUrl),
  );
  const currentStatus = chapter.status || "draft";

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon sx={{ fontSize: 14 }} />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2, textTransform: "none", color: "var(--color-text-secondary)", fontSize: "13px" }}
      >
        Back
      </Button>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: "22px", fontWeight: 500, mb: 0.25 }}>Edit Chapter</Typography>
          <Typography sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
            {currentStatus === "published" ? "Published" : currentStatus === "inactive" ? "Inactive" : "Draft"} · {topics.length} topic
            {topics.length !== 1 ? "s" : ""}
          </Typography>
        </Box>
      </Box>

      {/* Chapter details */}
      <Box
        sx={{
          bgcolor: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          mb: 2,
          p: 2,
        }}
      >
        <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 2 }}>Chapter Details</Typography>
        <TextField
          label="Chapter title"
          fullWidth
          sx={{ mb: 2 }}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          label="Description"
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
          Topics ({validTopicCount})
        </Typography>
        <Button size="small" startIcon={<AddIcon />} onClick={addTopic} sx={{ textTransform: "none" }}>
          Add topic
        </Button>
      </Box>

      {topics.map((t, i) => (
        <Box
          key={t._id || i}
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
                onChange={(e) => updateField(i, "title", e.target.value)}
              />
              <FormControl size="small" sx={{ minWidth: 130, mb: 1.5 }}>
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
                  onChange={(e) => updateField(i, "status", e.target.value)}
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
                  onChange={(e) => updateField(i, "content", e.target.value)}
                  placeholder="Write the lesson content here…"
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
                  onChange={(e) => updateField(i, "fileUrl", e.target.value)}
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
                      <InsertDriveFileOutlinedIcon
                        sx={{ fontSize: 18, color: "primary.main", flexShrink: 0 }}
                      />
                      <Typography
                        sx={{
                          fontSize: "13px", flex: 1,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}
                      >
                        {t.fileName ||
                          decodeURIComponent(t.fileUrl.split("/").pop().split("?")[0])}
                      </Typography>
                      <Button
                        size="small"
                        href={t.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ textTransform: "none", fontSize: "12px", minWidth: 0, py: 0 }}
                      >
                        View
                      </Button>
                      <Button
                        component="label"
                        size="small"
                        disabled={uploading[i]}
                        startIcon={
                          uploading[i] ? (
                            <CircularProgress size={12} />
                          ) : (
                            <CloudUploadOutlinedIcon sx={{ fontSize: 14 }} />
                          )
                        }
                        sx={{ textTransform: "none", fontSize: "12px", minWidth: 0, py: 0 }}
                      >
                        Replace
                        <input
                          type="file"
                          hidden
                          accept={t.type === "pdf" ? ".pdf" : "audio/*"}
                          onChange={(e) => {
                            if (e.target.files[0]) handleFileUpload(i, e.target.files[0]);
                            e.target.value = "";
                          }}
                        />
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => clearTopicFile(i)}
                        sx={{ color: "error.main", p: 0.5 }}
                      >
                        <CloseIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  ) : (
                    <>
                    <Button
                      variant="outlined"
                      component="label"
                      size="small"
                      disabled={uploading[i]}
                      startIcon={
                        uploading[i] ? (
                          <CircularProgress size={14} />
                        ) : (
                          <CloudUploadOutlinedIcon />
                        )
                      }
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
                        accept={t.type === "pdf" ? ".pdf" : "audio/*"}
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
            <IconButton
              size="small"
              color="error"
              onClick={() => setTopicDeleteIdx(i)}
              sx={{ mt: 0.5 }}
            >
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
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-md)", mb: 2,
          }}
        >
          <Typography sx={{ fontSize: "13px", color: "var(--color-text-secondary)", mb: 1 }}>
            No topics yet — add at least one to publish
          </Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={addTopic} sx={{ textTransform: "none" }}>
            Add first topic
          </Button>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end", alignItems: "center" }}>
        <Button
          onClick={() => navigate(-1)}
          sx={{ textTransform: "none", color: "var(--color-text-secondary)" }}
        >
          Cancel
        </Button>
        <Button
          variant="outlined"
          startIcon={<SaveOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={() => handleSave("draft")}
          disabled={saving || !title.trim() || hasInvalidTopics}
          sx={{ textTransform: "none" }}
        >
          Save as Draft
        </Button>
        <Button
          variant="contained"
          startIcon={<PublishOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={() => handleSave("published")}
          disabled={saving || !title.trim() || validTopicCount === 0 || hasInvalidTopics}
          sx={{ textTransform: "none" }}
        >
          {saving ? "Saving…" : "Publish"}
        </Button>
      </Box>
      {validTopicCount === 0 && (
        <Typography
          sx={{ fontSize: "12px", color: "var(--color-text-secondary)", mt: 1, textAlign: "right" }}
        >
          Add at least one topic to publish
        </Typography>
      )}

      {/* Delete topic confirmation */}
      <Dialog open={topicDeleteIdx !== null} onClose={() => setTopicDeleteIdx(null)}>
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 500 }}>Remove topic?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "13px" }}>
            Remove &ldquo;
            {topicDeleteIdx !== null
              ? topics[topicDeleteIdx]?.title || `Topic ${topicDeleteIdx + 1}`
              : ""}
            &rdquo; from this chapter?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTopicDeleteIdx(null)} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={removeTopic} sx={{ textTransform: "none" }}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
