import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Button,
  LinearProgress,
  InputBase,
  Skeleton,
  Collapse,
  IconButton,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import ExpandLessOutlinedIcon from "@mui/icons-material/ExpandLessOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useGetSubjectsQuery } from "@/store/api/subjectApi";
import { useGetClassesQuery } from "@/store/api/classApi";
import { useGetChaptersQuery } from "@/store/api/chapterApi";

const typeConfig = {
  notes: {
    label: "Notes",
    icon: ArticleOutlinedIcon,
    color: "var(--color-text-info)",
  },
  video: { label: "Video", icon: VideocamOutlinedIcon, color: "#7c3aed" },
  pdf: {
    label: "PDF",
    icon: PictureAsPdfOutlinedIcon,
    color: "var(--color-text-danger)",
  },
  quiz: {
    label: "Quiz",
    icon: QuizOutlinedIcon,
    color: "var(--color-text-warning)",
  },
};

const statusConfig = {
  published: {
    label: "Published",
    color: "var(--color-text-success)",
    bg: "var(--color-background-success)",
  },
  draft: {
    label: "Draft",
    color: "var(--color-text-warning)",
    bg: "var(--color-background-warning)",
  },
  not_started: {
    label: "Not started",
    color: "var(--color-text-secondary)",
    bg: "var(--color-background-secondary)",
  },
};

export default function TeacherContent() {
  const { user } = useSelector((s) => s.auth);
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});
  const navigate = useNavigate();

  const { data: classes, isLoading: loadingClasses } = useGetClassesQuery({
    schoolId: user?.schoolId,
  });
  const { data: subjects, isLoading: loadingSubjects } = useGetSubjectsQuery(
    classId ? { classId } : undefined,
    { skip: !classId },
  );
  const { data: chapters, isLoading: loadingChapters } = useGetChaptersQuery(
    subjectId ? { subjectId } : undefined,
    { skip: !subjectId },
  );

  const selectedClass = (classes || []).find((c) => c._id === classId);
  const selectedSubject = (subjects || []).find((s) => s._id === subjectId);

  const filtered = useMemo(() => {
    if (!chapters) return [];
    if (!search.trim()) return chapters;
    const q = search.toLowerCase();
    return chapters.filter((ch) => ch.title.toLowerCase().includes(q));
  }, [chapters, search]);

  const published = (chapters || []).filter(
    (c) => c.status === "published",
  ).length;
  const drafts = (chapters || []).filter((c) => c.status === "draft").length;
  const total = (chapters || []).length;
  const progress = total ? Math.round((published / total) * 100) : 0;

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <Box>
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
            Content
          </Typography>
          <Typography
            sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
            {selectedClass && selectedSubject
              ? `Class ${selectedClass.grade} · ${selectedSubject.name}`
              : "Select a class and subject to manage chapters"}
          </Typography>
        </Box>
        {subjectId && (
          <Button
            variant="contained"
            size="small"
            startIcon={<AddOutlinedIcon />}
            onClick={() =>
              navigate(`/teacher/content/add?subjectId=${subjectId}`)
            }
            sx={{ textTransform: "none" }}
          >
            Add chapter
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <FormControl sx={{ minWidth: 180 }}>
          <Select
            value={classId}
            displayEmpty
            size="small"
            onChange={(e) => {
              setClassId(e.target.value);
              setSubjectId("");
              setSearch("");
            }}
            sx={{ bgcolor: "var(--color-background-primary)" }}
          >
            <MenuItem value="" disabled>
              Select class
            </MenuItem>
            {(classes || []).map((c) => (
              <MenuItem key={c._id} value={c._id}>
                Class {c.grade}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 180 }}>
          <Select
            value={subjectId}
            displayEmpty
            size="small"
            onChange={(e) => {
              setSubjectId(e.target.value);
              setSearch("");
            }}
            disabled={!classId}
            sx={{ bgcolor: "var(--color-background-primary)" }}
          >
            <MenuItem value="" disabled>
              Select subject
            </MenuItem>
            {(subjects || []).map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {subjectId && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: "var(--border-radius-md)",
              px: 1.5,
              height: 40,
              ml: "auto",
              minWidth: 200,
            }}
          >
            <SearchOutlinedIcon
              sx={{ fontSize: 18, color: "var(--color-text-secondary)" }}
            />
            <InputBase
              placeholder="Search chapters…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ fontSize: "13px", flex: 1 }}
            />
          </Box>
        )}
      </Box>

      {/* Loading */}
      {subjectId && loadingChapters && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={80}
              sx={{ borderRadius: "var(--border-radius-md)" }}
            />
          ))}
        </Box>
      )}

      {/* Content area */}
      {subjectId && !loadingChapters && (
        <>
          {/* Stats summary */}
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <Box
              sx={{
                flex: 1,
                bgcolor: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: "var(--border-radius-lg)",
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
                      progress >= 50
                        ? "var(--color-text-success)"
                        : "var(--color-text-secondary)",
                  }}
                >
                  {progress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                color="success"
              />
              <Box sx={{ display: "flex", gap: 3, mt: 1.5 }}>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  <Box
                    component="span"
                    sx={{ fontWeight: 600, color: "var(--color-text-success)" }}
                  >
                    {published}
                  </Box>{" "}
                  published
                </Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  <Box
                    component="span"
                    sx={{ fontWeight: 600, color: "var(--color-text-warning)" }}
                  >
                    {drafts}
                  </Box>{" "}
                  drafts
                </Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  <Box component="span" sx={{ fontWeight: 600 }}>
                    {total}
                  </Box>{" "}
                  total
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Chapter list header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
              Chapters
              {search
                ? ` · ${filtered.length} result${filtered.length !== 1 ? "s" : ""}`
                : ""}
            </Typography>
          </Box>

          {/* Chapters */}
          {filtered.map((ch, i) => {
            const st = statusConfig[ch.status] || statusConfig.not_started;
            const isExpanded = expanded[ch._id];
            return (
              <Box
                key={ch._id}
                sx={{
                  bgcolor: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                  borderRadius: "var(--border-radius-md)",
                  mb: 1.5,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    py: 1.5,
                    px: 2,
                  }}
                >
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
                    }}
                  >
                    {i + 1}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 0.25,
                      }}
                    >
                      <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                        {ch.title}
                      </Typography>
                      <Box
                        component="span"
                        sx={{
                          fontSize: "11px",
                          fontWeight: 500,
                          px: 1,
                          py: 0.25,
                          borderRadius: "4px",
                          bgcolor: st.bg,
                          color: st.color,
                        }}
                      >
                        {st.label}
                      </Box>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {ch.topicCount || 0} topic{ch.topicCount !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                  {/* Content type icons */}
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    {Object.entries(typeConfig).map(([key, cfg]) => {
                      const has = ch.contentTypes?.includes(key);
                      const Icon = cfg.icon;
                      return (
                        <Box
                          key={key}
                          title={cfg.label}
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: has ? `${cfg.color}14` : "transparent",
                            border: has
                              ? "none"
                              : "0.5px solid var(--color-border-tertiary)",
                          }}
                        >
                          <Icon
                            sx={{
                              fontSize: 16,
                              color: has
                                ? cfg.color
                                : "var(--color-text-secondary)",
                              opacity: has ? 1 : 0.4,
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                  {ch.topics?.length > 0 && (
                    <IconButton
                      size="small"
                      onClick={() => toggleExpand(ch._id)}
                    >
                      {isExpanded ? (
                        <ExpandLessOutlinedIcon fontSize="small" />
                      ) : (
                        <ExpandMoreOutlinedIcon fontSize="small" />
                      )}
                    </IconButton>
                  )}
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      minWidth: 60,
                      fontSize: "12px",
                      flexShrink: 0,
                      textTransform: "none",
                    }}
                    onClick={() => navigate(`/teacher/content/${ch._id}`)}
                  >
                    {ch.status !== "not_started" ? "Edit" : "Start"}
                  </Button>
                </Box>
                {/* Expandable topics */}
                {ch.topics?.length > 0 && (
                  <Collapse in={isExpanded}>
                    <Box sx={{ px: 2, pb: 1.5, pl: 7 }}>
                      {ch.topics.map((t, ti) => (
                        <Box
                          key={t._id || ti}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            py: 0.75,
                            borderTop:
                              ti === 0
                                ? "0.5px solid var(--color-border-tertiary)"
                                : "none",
                          }}
                        >
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              bgcolor:
                                t.status === "published"
                                  ? "var(--color-text-success)"
                                  : "var(--color-border-tertiary)",
                              flexShrink: 0,
                            }}
                          />
                          <Typography
                            sx={{
                              fontSize: "12px",
                              color: "var(--color-text-secondary)",
                            }}
                          >
                            {t.title || `Topic ${ti + 1}`}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Collapse>
                )}
              </Box>
            );
          })}

          {filtered.length === 0 && search && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography
                sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
              >
                No chapters matching "{search}"
              </Typography>
            </Box>
          )}

          {filtered.length === 0 && !search && (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <FolderOpenOutlinedIcon
                sx={{
                  fontSize: 40,
                  color: "var(--color-text-secondary)",
                  mb: 1,
                  opacity: 0.5,
                }}
              />
              <Typography
                sx={{
                  fontSize: "13px",
                  color: "var(--color-text-secondary)",
                  mb: 2,
                }}
              >
                No chapters yet
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddOutlinedIcon />}
                onClick={() =>
                  navigate(`/teacher/content/add?subjectId=${subjectId}`)
                }
                sx={{ textTransform: "none" }}
              >
                Add first chapter
              </Button>
            </Box>
          )}
        </>
      )}

      {/* Empty state */}
      {!subjectId && !loadingClasses && !loadingSubjects && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <FolderOpenOutlinedIcon
            sx={{
              fontSize: 48,
              color: "var(--color-text-secondary)",
              mb: 1.5,
              opacity: 0.4,
            }}
          />
          <Typography sx={{ fontSize: "14px", fontWeight: 500, mb: 0.5 }}>
            Select a class and subject
          </Typography>
          <Typography
            sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
            Choose from the dropdowns above to view and manage content
          </Typography>
        </Box>
      )}
    </Box>
  );
}
