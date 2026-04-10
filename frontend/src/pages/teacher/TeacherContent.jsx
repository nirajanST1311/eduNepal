import { useState } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Button,
  LinearProgress,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useGetSubjectsQuery } from "@/store/api/subjectApi";
import { useGetClassesQuery } from "@/store/api/classApi";
import { useGetChaptersQuery } from "@/store/api/chapterApi";

const typeChips = ["Notes", "Video", "PDF", "Quiz"];

export default function TeacherContent() {
  const { user } = useSelector((s) => s.auth);
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const navigate = useNavigate();

  const { data: classes } = useGetClassesQuery({ schoolId: user?.schoolId });
  const { data: subjects } = useGetSubjectsQuery(
    classId ? { classId } : undefined,
    { skip: !classId },
  );
  const { data: chapters } = useGetChaptersQuery(
    subjectId ? { subjectId } : undefined,
    { skip: !subjectId },
  );

  const selectedClass = (classes || []).find((c) => c._id === classId);
  const selectedSubject = (subjects || []).find((s) => s._id === subjectId);

  const published = (chapters || []).filter(
    (c) => c.status === "published",
  ).length;
  const total = (chapters || []).length;
  const progress = total ? Math.round((published / total) * 100) : 0;

  return (
    <Box>
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
            Content
          </Typography>
          <Typography
            sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
            {selectedClass && selectedSubject
              ? `Class ${selectedClass.grade} · ${selectedSubject.name}`
              : "Select a class and subject"}
          </Typography>
        </Box>
        <IconButton size="small">
          <MoreHorizIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
        <FormControl sx={{ minWidth: 200 }}>
          <Select
            value={classId}
            displayEmpty
            onChange={(e) => {
              setClassId(e.target.value);
              setSubjectId("");
            }}
            sx={{ bgcolor: "var(--color-background-primary)" }}
          >
            <MenuItem value="" disabled>
              Class
            </MenuItem>
            {(classes || []).map((c) => (
              <MenuItem key={c._id} value={c._id}>
                Class {c.grade}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }}>
          <Select
            value={subjectId}
            displayEmpty
            onChange={(e) => setSubjectId(e.target.value)}
            disabled={!classId}
            sx={{ bgcolor: "var(--color-background-primary)" }}
          >
            <MenuItem value="" disabled>
              Subject
            </MenuItem>
            {(subjects || []).map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {subjectId && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={() =>
              navigate(`/teacher/content/add?subjectId=${subjectId}`)
            }
            sx={{ whiteSpace: "nowrap", ml: "auto" }}
          >
            Add chapter
          </Button>
        )}
      </Box>

      {subjectId && (
        <>
          <Box
            sx={{
              bgcolor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: "var(--border-radius-lg)",
              mb: 3,
              py: 1.5,
              px: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                Syllabus progress
              </Typography>
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color:
                    progress > 50
                      ? "var(--color-text-success)"
                      : "var(--color-text-secondary)",
                }}
              >
                {progress}% complete
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              color="success"
            />
          </Box>

          <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 2 }}>
            Chapters
          </Typography>

          {(chapters || []).map((ch, i) => {
            const statusLabel =
              ch.status === "published"
                ? "Published"
                : ch.status === "draft"
                  ? "Draft"
                  : "Not started";
            const isStarted = ch.status !== "not_started";
            return (
              <Box
                key={ch._id}
                sx={{
                  bgcolor: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                  borderRadius: "var(--border-radius-md)",
                  mb: 1.5,
                  py: 1.5,
                  px: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      bgcolor: "var(--color-background-secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 500,
                      fontSize: "13px",
                      color: "var(--color-text-secondary)",
                      flexShrink: 0,
                      mt: 0.25,
                    }}
                  >
                    {i + 1}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{ fontSize: "13px", fontWeight: 500, mb: 0.25 }}
                    >
                      {ch.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {ch.topicCount || 0} topic
                      {ch.topicCount !== 1 ? "s" : ""} · {statusLabel}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.5, mt: 1 }}>
                      {typeChips.map((t) => {
                        const key = t.toLowerCase();
                        const has = ch.contentTypes?.includes(key);
                        return (
                          <Box
                            component="span"
                            key={t}
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              fontSize: "11px",
                              height: 22,
                              px: 1,
                              borderRadius: "4px",
                              fontWeight: 500,
                              bgcolor: has
                                ? "var(--color-background-success)"
                                : "transparent",
                              color: has
                                ? "var(--color-text-success)"
                                : "var(--color-text-secondary)",
                              border: has
                                ? "none"
                                : "0.5px solid var(--color-border-tertiary)",
                            }}
                          >
                            {t}
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ minWidth: 60, fontSize: "12px", flexShrink: 0 }}
                    onClick={() => navigate(`/teacher/content/${ch._id}`)}
                  >
                    {isStarted ? "Edit" : "Start"}
                  </Button>
                </Box>
              </Box>
            );
          })}

          {(chapters || []).length === 0 && (
            <Typography
              sx={{
                fontSize: "13px",
                color: "var(--color-text-secondary)",
                textAlign: "center",
                py: 4,
              }}
            >
              No chapters yet — add one to get started
            </Typography>
          )}
        </>
      )}

      {!subjectId && (
        <Typography
          sx={{
            fontSize: "13px",
            color: "var(--color-text-secondary)",
            textAlign: "center",
            py: 6,
          }}
        >
          Select a class and subject to view content
        </Typography>
      )}
    </Box>
  );
}
