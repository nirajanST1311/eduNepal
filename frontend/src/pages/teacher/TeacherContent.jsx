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
import HeadphonesOutlinedIcon from "@mui/icons-material/HeadphonesOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import TopicOutlinedIcon from "@mui/icons-material/TopicOutlined";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useGetSubjectsQuery } from "@/store/api/subjectApi";
import { useGetClassesQuery } from "@/store/api/classApi";
import { useGetChaptersQuery } from "@/store/api/chapterApi";

/* ─── config ─── */
const typeIcon = {
  note: ArticleOutlinedIcon,
  video: VideocamOutlinedIcon,
  pdf: PictureAsPdfOutlinedIcon,
  audio: HeadphonesOutlinedIcon,
};
const typeColor = {
  note: "#2563eb",
  video: "#7c3aed",
  pdf: "#dc2626",
  audio: "#d97706",
};
const typeLabel = {
  note: "Notes",
  video: "Video",
  pdf: "PDF",
  audio: "Audio",
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

function timeAgo(date) {
  if (!date) return "";
  const ms = Date.now() - new Date(date).getTime();
  const days = Math.floor(ms / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

export default function TeacherContent() {
  const { user } = useSelector((s) => s.auth);
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});
  const navigate = useNavigate();

  const isOverview = !subjectId;

  /* ─── queries ─── */
  const { data: allClasses, isLoading: loadingClasses } = useGetClassesQuery({
    schoolId: user?.schoolId,
  });
  const classes = useMemo(
    () =>
      (allClasses || []).filter((c) =>
        user?.classIds?.length ? user.classIds.includes(c._id) : true,
      ),
    [allClasses, user?.classIds],
  );

  // Subjects for class dropdown
  const { data: dropdownSubjects, isLoading: loadingSubjects } =
    useGetSubjectsQuery(classId ? { classId } : undefined, {
      skip: !classId,
    });
  const subjects = useMemo(
    () =>
      (dropdownSubjects || []).filter((s) =>
        user?.subjectIds?.length ? user.subjectIds.includes(s._id) : true,
      ),
    [dropdownSubjects, user?.subjectIds],
  );

  // All teacher's subjects (overview)
  const { data: teacherSubjects, isLoading: loadingTeacherSubs } =
    useGetSubjectsQuery(user?._id ? { teacherId: user._id } : undefined, {
      skip: !!subjectId || !user?._id,
    });

  // Chapters for selected subject
  const { data: chapters, isLoading: loadingChapters } = useGetChaptersQuery(
    subjectId ? { subjectId } : undefined,
    { skip: !subjectId },
  );

  // All chapters for school (overview)
  const { data: schoolChapters, isLoading: loadingOverview } =
    useGetChaptersQuery(
      user?.schoolId ? { schoolId: user.schoolId } : undefined,
      { skip: !!subjectId || !user?.schoolId },
    );

  /* ─── overview data ─── */
  const teacherSubjectIds = useMemo(
    () => new Set((teacherSubjects || []).map((s) => s._id)),
    [teacherSubjects],
  );

  const myChapters = useMemo(
    () =>
      (schoolChapters || []).filter((ch) =>
        teacherSubjectIds.has(ch.subjectId),
      ),
    [schoolChapters, teacherSubjectIds],
  );

  const overallStats = useMemo(
    () => ({
      subjects: teacherSubjects?.length || 0,
      chapters: myChapters.length,
      published: myChapters.filter((c) => c.status === "published").length,
      topics: myChapters.reduce((sum, c) => sum + (c.topicCount || 0), 0),
    }),
    [teacherSubjects, myChapters],
  );

  const subjectStats = useMemo(() => {
    const map = {};
    for (const ch of myChapters) {
      if (!map[ch.subjectId])
        map[ch.subjectId] = { chapters: 0, published: 0, topics: 0 };
      map[ch.subjectId].chapters++;
      if (ch.status === "published") map[ch.subjectId].published++;
      map[ch.subjectId].topics += ch.topicCount || 0;
    }
    return map;
  }, [myChapters]);

  /* ─── subject-mode data ─── */

  const selectedClass = classes.find((c) => c._id === classId);
  const selectedSubject = subjects.find((s) => s._id === subjectId);

  const filtered = useMemo(() => {
    if (!chapters) return [];
    if (!search.trim()) return chapters;
    const q = search.toLowerCase();
    return chapters.filter((ch) => ch.title.toLowerCase().includes(q));
  }, [chapters, search]);

  const pubCount = (chapters || []).filter(
    (c) => c.status === "published",
  ).length;
  const draftCount = (chapters || []).filter(
    (c) => c.status === "draft",
  ).length;
  const totalCount = (chapters || []).length;
  const progress = totalCount ? Math.round((pubCount / totalCount) * 100) : 0;

  /* ─── handlers ─── */
  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleSubjectCardClick = (sub) => {
    const cid = sub.classId?._id || sub.classId;
    setClassId(cid);
    setSubjectId(sub._id);
    setSearch("");
    setExpanded({});
  };

  const handleBackToOverview = () => {
    setClassId("");
    setSubjectId("");
    setSearch("");
    setExpanded({});
  };

  const isLoading = isOverview
    ? loadingTeacherSubs || loadingOverview || loadingClasses
    : loadingChapters;

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
            {isOverview ? "My Content" : "Content"}
          </Typography>
          <Typography
            sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
            {isOverview
              ? "Overview of all your teaching content"
              : `Class ${selectedClass?.grade || ""}${selectedClass?.section || ""} · ${selectedSubject?.name || ""}`}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          {!isOverview && (
            <Button
              size="small"
              onClick={handleBackToOverview}
              sx={{ textTransform: "none" }}
            >
              ← Overview
            </Button>
          )}
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
            {classes.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                Class {c.grade} {c.section || ""}
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
            {subjects.map((s) => (
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
      {isLoading && (
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

      {/* ============ SUBJECT MODE ============ */}
      {!isOverview && !isLoading && (
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
                    {pubCount}
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
                    {draftCount}
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
                    {totalCount}
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
            const topicsList = ch.topics || [];
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
                    alignItems: "flex-start",
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
                      mt: 0.25,
                    }}
                  >
                    {ch.order || i + 1}
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
                    {ch.description && (
                      <Typography
                        sx={{
                          fontSize: "12px",
                          color: "var(--color-text-secondary)",
                          mb: 0.5,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {ch.description}
                      </Typography>
                    )}
                    {/* Topic pills */}
                    {topicsList.length > 0 && (
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.5,
                          mt: 0.5,
                        }}
                      >
                        {topicsList.map((t) => {
                          const Icon = typeIcon[t.type] || ArticleOutlinedIcon;
                          const color = typeColor[t.type] || "#6b7280";
                          return (
                            <Box
                              key={t._id}
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 0.5,
                                fontSize: "11px",
                                color: "var(--color-text-secondary)",
                                bgcolor: `${color}0a`,
                                border: `0.5px solid ${color}20`,
                                borderRadius: "4px",
                                px: 0.75,
                                py: 0.25,
                              }}
                            >
                              <Icon sx={{ fontSize: 12, color }} />
                              {t.title}
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                    {/* Meta line */}
                    <Box sx={{ display: "flex", gap: 2, mt: 0.75 }}>
                      <Typography
                        sx={{
                          fontSize: "11px",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        {ch.topicCount || 0} topic
                        {(ch.topicCount || 0) !== 1 ? "s" : ""}
                      </Typography>
                      {ch.updatedAt && (
                        <Typography
                          sx={{
                            fontSize: "11px",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          Updated {timeAgo(ch.updatedAt)}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  {topicsList.length > 0 && (
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
                    onClick={() => navigate(`/teacher/content/${ch._id}/edit`)}
                  >
                    {ch.status !== "not_started" ? "Edit" : "Start"}
                  </Button>
                </Box>
                {/* Expandable topics detail */}
                {topicsList.length > 0 && (
                  <Collapse in={isExpanded}>
                    <Box
                      sx={{
                        px: 2,
                        pb: 1.5,
                        pl: 7,
                        borderTop: "0.5px solid var(--color-border-tertiary)",
                      }}
                    >
                      {topicsList.map((t, ti) => {
                        const Icon = typeIcon[t.type] || ArticleOutlinedIcon;
                        const color = typeColor[t.type] || "#6b7280";
                        const label = typeLabel[t.type] || t.type;
                        return (
                          <Box
                            key={t._id || ti}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                              py: 0.75,
                              borderTop:
                                ti > 0
                                  ? "0.5px dashed var(--color-border-tertiary)"
                                  : "none",
                            }}
                          >
                            <Icon sx={{ fontSize: 14, color }} />
                            <Typography sx={{ fontSize: "12px", flex: 1 }}>
                              {t.title || `Topic ${ti + 1}`}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "11px",
                                color: "var(--color-text-secondary)",
                              }}
                            >
                              {label}
                            </Typography>
                          </Box>
                        );
                      })}
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

      {/* ============ OVERVIEW MODE ============ */}
      {isOverview && !isLoading && (
        <>
          {/* Overall stats */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 2,
              mb: 3,
            }}
          >
            {[
              {
                label: "Subjects",
                value: overallStats.subjects,
                icon: MenuBookOutlinedIcon,
                color: "#2563eb",
              },
              {
                label: "Chapters",
                value: overallStats.chapters,
                icon: FolderOpenOutlinedIcon,
                color: "#7c3aed",
              },
              {
                label: "Published",
                value: overallStats.published,
                icon: CheckCircleOutlinedIcon,
                color: "#059669",
              },
              {
                label: "Topics",
                value: overallStats.topics,
                icon: TopicOutlinedIcon,
                color: "#d97706",
              },
            ].map((s) => (
              <Box
                key={s.label}
                sx={{
                  bgcolor: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                  borderRadius: "var(--border-radius-lg)",
                  py: 2,
                  px: 2.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "10px",
                    bgcolor: `${s.color}14`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <s.icon sx={{ fontSize: 20, color: s.color }} />
                </Box>
                <Box>
                  <Typography
                    sx={{ fontSize: "20px", fontWeight: 600, lineHeight: 1.2 }}
                  >
                    {s.value}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {s.label}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Subject cards */}
          <Typography sx={{ fontSize: "14px", fontWeight: 500, mb: 2 }}>
            Subjects you teach
          </Typography>

          {teacherSubjects?.length === 0 && (
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
                }}
              >
                No subjects assigned yet
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 2,
            }}
          >
            {(teacherSubjects || []).map((sub) => {
              const stats = subjectStats[sub._id] || {
                chapters: 0,
                published: 0,
                topics: 0,
              };
              const pct = stats.chapters
                ? Math.round((stats.published / stats.chapters) * 100)
                : 0;
              const cls = sub.classId;
              const classLabel = cls?.grade
                ? `Class ${cls.grade}${cls.section || ""}`
                : "";
              return (
                <Box
                  key={sub._id}
                  onClick={() => handleSubjectCardClick(sub)}
                  sx={{
                    bgcolor: "var(--color-background-primary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                    borderRadius: "var(--border-radius-lg)",
                    p: 2.5,
                    cursor: "pointer",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                    "&:hover": {
                      borderColor: sub.color || "var(--color-border-secondary)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1.5,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: "8px",
                          bgcolor: (sub.color || "#6b7280") + "18",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <MenuBookOutlinedIcon
                          sx={{
                            fontSize: 18,
                            color: sub.color || "#6b7280",
                          }}
                        />
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
                          {sub.name}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "12px",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {classLabel}
                        </Typography>
                      </Box>
                    </Box>
                    <ArrowForwardIosIcon
                      sx={{
                        fontSize: 12,
                        color: "var(--color-text-secondary)",
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "11px",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        Progress
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "11px",
                          fontWeight: 500,
                          color:
                            pct >= 50
                              ? "var(--color-text-success)"
                              : "var(--color-text-secondary)",
                        }}
                      >
                        {pct}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        bgcolor: "var(--color-background-secondary)",
                        "& .MuiLinearProgress-bar": {
                          bgcolor: sub.color || "#059669",
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      <Box component="span" sx={{ fontWeight: 600 }}>
                        {stats.published}
                      </Box>
                      /{stats.chapters} chapters
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      <Box component="span" sx={{ fontWeight: 600 }}>
                        {stats.topics}
                      </Box>{" "}
                      topics
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </>
      )}
    </Box>
  );
}
