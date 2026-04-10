import { useState } from "react";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useSelector } from "react-redux";
import { useCreateChapterMutation } from "@/store/api/chapterApi";
import { useCreateTopicMutation } from "@/store/api/topicApi";
import { useGetSubjectsQuery } from "@/store/api/subjectApi";
import { useGetClassesQuery } from "@/store/api/classApi";

export default function AddChapter() {
  const { user } = useSelector((s) => s.auth);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const preSubjectId = params.get("subjectId") || "";

  const [step, setStep] = useState(preSubjectId ? 2 : 1);
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState(preSubjectId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState(1);
  const [topics, setTopics] = useState([]);
  const [status, setStatus] = useState("draft");

  const { data: classes } = useGetClassesQuery({ schoolId: user?.schoolId });
  const { data: subjects } = useGetSubjectsQuery(
    classId ? { classId } : undefined,
    { skip: !classId },
  );

  const [createChapter, { isLoading: savingChapter }] =
    useCreateChapterMutation();
  const [createTopic] = useCreateTopicMutation();

  const addTopic = () =>
    setTopics([
      ...topics,
      { title: "", type: "note", content: "", fileUrl: "" },
    ]);
  const removeTopic = (i) => setTopics(topics.filter((_, idx) => idx !== i));
  const updateTopic = (i, field, value) => {
    const next = [...topics];
    next[i] = { ...next[i], [field]: value };
    setTopics(next);
  };

  const handleSave = async () => {
    const chapter = await createChapter({
      subjectId,
      title,
      description,
      order,
      status,
    }).unwrap();
    for (let i = 0; i < topics.length; i++) {
      const t = topics[i];
      if (t.title.trim()) {
        await createTopic({
          chapterId: chapter._id,
          title: t.title,
          type: t.type,
          content: t.content,
          fileUrl: t.fileUrl,
          order: i + 1,
        });
      }
    }
    navigate("/teacher/content");
  };

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/teacher/content")}
        sx={{ mb: 2 }}
      >
        Back to content
      </Button>
      <Typography sx={{ fontSize: "22px", fontWeight: 500, mb: 3 }}>
        Add chapter
      </Typography>

      {step === 1 && (
        <Box
          sx={{
            bgcolor: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
            p: 2,
          }}
        >
          <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 2 }}>
            Select class and subject
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Class</InputLabel>
              <Select
                value={classId}
                label="Class"
                onChange={(e) => {
                  setClassId(e.target.value);
                  setSubjectId("");
                }}
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
          <Button
            variant="contained"
            disabled={!subjectId}
            onClick={() => setStep(2)}
          >
            Next
          </Button>
        </Box>
      )}

      {step === 2 && (
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
            Chapter details
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
          <TextField
            label="Order"
            type="number"
            sx={{ width: 100 }}
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
          />
          <Button
            variant="contained"
            sx={{ ml: 2 }}
            disabled={!title.trim()}
            onClick={() => setStep(3)}
          >
            Next
          </Button>
        </Box>
      )}

      {step === 3 && (
        <>
          <Box
            sx={{
              bgcolor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: "var(--border-radius-md)",
              mb: 2,
              p: 2,
            }}
          >
            <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 0.5 }}>
              {title}
            </Typography>
            <Typography
              sx={{ fontSize: "12px", color: "var(--color-text-secondary)" }}
            >
              {description}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
              Topics
            </Typography>
            <Button size="small" startIcon={<AddIcon />} onClick={addTopic}>
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
                <Box sx={{ flex: 1 }}>
                  <TextField
                    label="Topic title"
                    size="small"
                    fullWidth
                    sx={{ mb: 1.5 }}
                    value={t.title}
                    onChange={(e) => updateTopic(i, "title", e.target.value)}
                  />
                  <FormControl
                    size="small"
                    sx={{ minWidth: 120, mb: 1.5, mr: 1.5 }}
                  >
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={t.type}
                      label="Type"
                      onChange={(e) => updateTopic(i, "type", e.target.value)}
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
                        updateTopic(i, "content", e.target.value)
                      }
                    />
                  )}
                  {t.type !== "note" && (
                    <TextField
                      label="File URL / YouTube link"
                      fullWidth
                      value={t.fileUrl}
                      onChange={(e) =>
                        updateTopic(i, "fileUrl", e.target.value)
                      }
                    />
                  )}
                </Box>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => removeTopic(i)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          ))}

          {topics.length === 0 && (
            <Typography
              sx={{
                fontSize: "13px",
                color: "var(--color-text-secondary)",
                textAlign: "center",
                py: 3,
              }}
            >
              Add topics to this chapter
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={() => {
                setStatus("draft");
                handleSave();
              }}
              disabled={savingChapter || !title.trim()}
            >
              Save as draft
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setStatus("published");
                handleSave();
              }}
              disabled={savingChapter || !title.trim()}
            >
              Publish
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}
