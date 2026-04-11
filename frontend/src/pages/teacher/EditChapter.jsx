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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIosNew";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import PublishOutlinedIcon from "@mui/icons-material/PublishOutlined";
import {
  useGetChapterQuery,
  useUpdateChapterMutation,
  useDeleteChapterMutation,
} from "@/store/api/chapterApi";
import {
  useCreateTopicMutation,
  useUpdateTopicMutation,
  useDeleteTopicMutation,
} from "@/store/api/topicApi";

export default function EditChapter() {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const { data: chapter, isLoading } = useGetChapterQuery(chapterId);
  const [updateChapter, { isLoading: saving }] = useUpdateChapterMutation();
  const [deleteChapter] = useDeleteChapterMutation();
  const [createTopic] = useCreateTopicMutation();
  const [updateTopic] = useUpdateTopicMutation();
  const [deleteTopic] = useDeleteTopicMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState(1);
  const [status, setStatus] = useState("draft");
  const [topics, setTopics] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Populate form when chapter loads
  useEffect(() => {
    if (chapter) {
      setTitle(chapter.title || "");
      setDescription(chapter.description || "");
      setOrder(chapter.order || 1);
      setStatus(chapter.status || "draft");
      setTopics(
        (chapter.topics || []).map((t) => ({
          _id: t._id,
          title: t.title || "",
          type: t.type || "note",
          content: t.content || "",
          fileUrl: t.fileUrl || "",
          _existing: true,
        })),
      );
    }
  }, [chapter]);

  const addTopic = () =>
    setTopics([
      ...topics,
      { title: "", type: "note", content: "", fileUrl: "", _existing: false },
    ]);

  const removeTopic = (i) => {
    const t = topics[i];
    setTopics(topics.filter((_, idx) => idx !== i));
    // If it's an existing topic, delete from server
    if (t._existing && t._id) {
      deleteTopic(t._id);
    }
  };

  const updateTopicField = (i, field, value) => {
    const next = [...topics];
    next[i] = { ...next[i], [field]: value };
    setTopics(next);
  };

  const handleSave = async (newStatus) => {
    if (!title.trim()) return;
    try {
      // Update chapter
      await updateChapter({
        id: chapterId,
        title,
        description,
        order,
        status: newStatus || status,
      }).unwrap();

      // Save topics
      for (let i = 0; i < topics.length; i++) {
        const t = topics[i];
        if (!t.title.trim()) continue;
        const topicData = {
          title: t.title,
          type: t.type,
          content: t.content,
          fileUrl: t.fileUrl,
          order: i + 1,
        };
        if (t._existing && t._id) {
          await updateTopic({ id: t._id, ...topicData });
        } else {
          await createTopic({ chapterId, ...topicData });
        }
      }

      setSnackbar({
        open: true,
        message:
          newStatus === "published"
            ? "Chapter published successfully"
            : "Chapter saved successfully",
        severity: "success",
      });

      // Navigate back after short delay so user sees feedback
      setTimeout(() => navigate("/teacher/content"), 800);
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to save chapter",
        severity: "error",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteChapter(chapterId).unwrap();
      navigate("/teacher/content");
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to delete chapter",
        severity: "error",
      });
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
          onClick={() => navigate("/teacher/content")}
          sx={{
            mb: 2,
            textTransform: "none",
            color: "var(--color-text-secondary)",
            fontSize: "13px",
          }}
        >
          Back to content
        </Button>
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography
            sx={{ fontSize: "14px", color: "var(--color-text-secondary)" }}
          >
            Chapter not found
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Back link */}
      <Button
        startIcon={<ArrowBackIcon sx={{ fontSize: 14 }} />}
        onClick={() => navigate("/teacher/content")}
        sx={{
          mb: 2,
          textTransform: "none",
          color: "var(--color-text-secondary)",
          fontSize: "13px",
        }}
      >
        Back to content
      </Button>

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: "22px", fontWeight: 500, mb: 0.25 }}>
            Edit Chapter
          </Typography>
          <Typography
            sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
            {chapter.status === "published" ? "Published" : "Draft"} ·{" "}
            {topics.length} topic{topics.length !== 1 ? "s" : ""}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => setDeleteDialog(true)}
            sx={{ textTransform: "none" }}
          >
            Delete
          </Button>
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
          label="Description"
          fullWidth
          multiline
          rows={2}
          sx={{ mb: 2 }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            label="Order"
            type="number"
            sx={{ width: 100 }}
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
          />
          <FormControl sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="published">Published</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Topics */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
          Topics ({topics.length})
        </Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={addTopic}
          sx={{ textTransform: "none" }}
        >
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
                width: 24,
                height: 24,
                borderRadius: "50%",
                bgcolor: "var(--color-background-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--color-text-secondary)",
                flexShrink: 0,
                mt: 1,
              }}
            >
              {i + 1}
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                label="Topic title"
                size="small"
                fullWidth
                sx={{ mb: 1.5 }}
                value={t.title}
                onChange={(e) => updateTopicField(i, "title", e.target.value)}
              />
              <FormControl
                size="small"
                sx={{ minWidth: 120, mb: 1.5, mr: 1.5 }}
              >
                <InputLabel>Type</InputLabel>
                <Select
                  value={t.type}
                  label="Type"
                  onChange={(e) => updateTopicField(i, "type", e.target.value)}
                >
                  <MenuItem value="note">Notes</MenuItem>
                  <MenuItem value="video">Video</MenuItem>
                  <MenuItem value="pdf">PDF</MenuItem>
                  <MenuItem value="audio">Audio</MenuItem>
                </Select>
              </FormControl>
              {t.type === "note" && (
                <TextField
                  label="Content"
                  multiline
                  rows={3}
                  fullWidth
                  value={t.content}
                  onChange={(e) =>
                    updateTopicField(i, "content", e.target.value)
                  }
                />
              )}
              {t.type !== "note" && (
                <TextField
                  label="File URL / YouTube link"
                  fullWidth
                  value={t.fileUrl}
                  onChange={(e) =>
                    updateTopicField(i, "fileUrl", e.target.value)
                  }
                />
              )}
            </Box>
            <IconButton
              size="small"
              color="error"
              onClick={() => removeTopic(i)}
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
            textAlign: "center",
            py: 4,
            bgcolor: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-md)",
            mb: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: "13px",
              color: "var(--color-text-secondary)",
              mb: 1,
            }}
          >
            No topics yet
          </Typography>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={addTopic}
            sx={{ textTransform: "none" }}
          >
            Add first topic
          </Button>
        </Box>
      )}

      {/* Action bar */}
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
        <Button
          onClick={() => navigate("/teacher/content")}
          sx={{ textTransform: "none", color: "var(--color-text-secondary)" }}
        >
          Cancel
        </Button>
        <Button
          variant="outlined"
          startIcon={<SaveOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={() => handleSave("draft")}
          disabled={saving || !title.trim()}
          sx={{ textTransform: "none" }}
        >
          Save as Draft
        </Button>
        <Button
          variant="contained"
          startIcon={<PublishOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={() => handleSave("published")}
          disabled={saving || !title.trim()}
          sx={{ textTransform: "none" }}
        >
          {saving ? "Saving…" : "Publish"}
        </Button>
      </Box>

      {/* Delete confirmation */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 500 }}>
          Delete chapter?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "13px" }}>
            This will permanently delete "{title}" and all its topics. This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog(false)}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            sx={{ textTransform: "none" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
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
