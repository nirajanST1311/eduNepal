import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Skeleton,
  Divider,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIosNew";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import HeadphonesOutlinedIcon from "@mui/icons-material/HeadphonesOutlined";
import { useSelector } from "react-redux";
import { useGetChapterQuery } from "@/store/api/chapterApi";
import {
  NoteContent,
  VideoContent,
  PdfContent,
  AudioContent,
  typeConfig,
} from "@/components/content/TopicContent";

const typeIcon = {
  note: DescriptionOutlinedIcon,
  video: PlayCircleOutlinedIcon,
  pdf: PictureAsPdfOutlinedIcon,
  audio: HeadphonesOutlinedIcon,
};

export default function ChapterDetail() {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const backPath = location.state?.from || "/teacher/content";
  const { user } = useSelector((s) => s.auth);
  const { data: chapter, isLoading } = useGetChapterQuery(chapterId, {
    skip: !chapterId,
  });

  const topics = chapter?.topics || [];
  const [selectedId, setSelectedId] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // For students: hide inactive topics; for teachers: show all but dimmed
  const visibleTopics = useMemo(
    () =>
      user?.role === "TEACHER"
        ? topics
        : topics.filter((t) => (t.status || "published") !== "inactive"),
    [topics, user?.role],
  );

  // Filter by type and status
  const filteredTopics = useMemo(() => {
    let list = visibleTopics;
    if (typeFilter !== "all") list = list.filter((t) => t.type === typeFilter);
    if (statusFilter !== "all") list = list.filter((t) => (t.status || "published") === statusFilter);
    return list;
  }, [visibleTopics, typeFilter, statusFilter]);

  // Auto-select first visible topic when filter changes
  useEffect(() => {
    if (filteredTopics.length > 0) setSelectedId(filteredTopics[0]._id || null);
  }, [typeFilter, statusFilter, filteredTopics]);

  // Auto-select first topic on initial load
  useEffect(() => {
    if (visibleTopics.length > 0 && !selectedId) setSelectedId(visibleTopics[0]._id || null);
  }, [visibleTopics.length]);

  const selectedTopic = filteredTopics.find((t) => t._id === selectedId) || filteredTopics[0] || null;

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  if (!chapter) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">Chapter not found.</Typography>
        <Button onClick={() => navigate(backPath)} sx={{ mt: 2 }}>
          Go back
        </Button>
      </Box>
    );
  }

  function renderTopicContent(topic) {
    if (!topic) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "var(--color-text-secondary)",
          }}
        >
          <Typography>No topic selected.</Typography>
        </Box>
      );
    }
    switch (topic.type) {
      case "video":
        return <VideoContent fileUrl={topic.fileUrl} content={topic.content} />;
      case "pdf":
        return <PdfContent fileUrl={topic.fileUrl} />;
      case "audio":
        return <AudioContent fileUrl={topic.fileUrl} content={topic.content} />;
      default:
        return <NoteContent content={topic.content} />;
    }
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "var(--color-background-primary)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderBottom: "1px solid var(--color-border-tertiary)",
          bgcolor: "var(--color-background-primary)",
        }}
      >
        <Button
          startIcon={<ArrowBackIcon sx={{ fontSize: 14 }} />}
          onClick={() => navigate(backPath)}
          size="small"
          sx={{ textTransform: "none", color: "var(--color-text-secondary)" }}
        >
          Back
        </Button>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: 600,
              color: "var(--color-text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {chapter.title}
          </Typography>
          {chapter.description && (
            <Typography
              sx={{
                fontSize: "12px",
                color: "var(--color-text-secondary)",
                mt: 0.25,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {chapter.description}
            </Typography>
          )}
        </Box>
        <Chip
          label={
            chapter.status === "published" ? "Published" :
            chapter.status === "inactive" ? "Inactive" : "Draft"
          }
          size="small"
          sx={{
            bgcolor:
              chapter.status === "published" ? "#e8f5e9" :
              chapter.status === "inactive" ? "#ffebee" : "#f5f5f5",
            color:
              chapter.status === "published" ? "#2e7d32" :
              chapter.status === "inactive" ? "#c62828" : "#757575",
            fontWeight: 500,
            fontSize: "11px",
          }}
        />

      </Box>

      {/* Body: topic list + content */}
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
        {/* Topic Sidebar */}
        <Box
          sx={{
            width: 270,
            flexShrink: 0,
            borderRight: "1px solid var(--color-border-tertiary)",
            display: "flex",
            flexDirection: "column",
            bgcolor: "var(--color-background-secondary)",
          }}
        >
          {/* Type + Status filter */}
          <Box sx={{ px: 1.5, pt: 1.5, pb: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--color-text-secondary)",
                }}
              >
                Topics ({filteredTopics.length}
                {(typeFilter !== "all" || statusFilter !== "all") ? ` of ${visibleTopics.length}` : ""})
              </Typography>
              {(typeFilter !== "all" || statusFilter !== "all") && (
                <Button
                  size="small"
                  startIcon={<CloseOutlinedIcon sx={{ fontSize: 12 }} />}
                  onClick={() => { setTypeFilter("all"); setStatusFilter("all"); }}
                  sx={{
                    fontSize: "11px",
                    textTransform: "none",
                    color: "var(--color-text-secondary)",
                    minWidth: 0,
                    p: 0.25,
                  }}
                >
                  Clear
                </Button>
              )}
            </Box>
            <ToggleButtonGroup
              value={typeFilter}
              exclusive
              onChange={(_, v) => { if (v) setTypeFilter(v); }}
              size="small"
              sx={{
                flexWrap: "wrap",
                gap: 0.5,
                "& .MuiToggleButtonGroup-grouped": {
                  border: "0.5px solid var(--color-border-tertiary) !important",
                  borderRadius: "6px !important",
                  px: 1,
                  py: 0.25,
                  fontSize: "11px",
                  textTransform: "none",
                  minWidth: 0,
                  color: "var(--color-text-secondary)",
                  "&.Mui-selected": {
                    bgcolor: "var(--color-primary)",
                    color: "#fff",
                    "&:hover": { bgcolor: "var(--color-primary)" },
                  },
                },
              }}
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="note">Notes</ToggleButton>
              <ToggleButton value="video">Video</ToggleButton>
              <ToggleButton value="pdf">PDF</ToggleButton>
              <ToggleButton value="audio">Audio</ToggleButton>
            </ToggleButtonGroup>
            {user?.role === "TEACHER" && (
              <ToggleButtonGroup
                value={statusFilter}
                exclusive
                onChange={(_, v) => { if (v) setStatusFilter(v); }}
                size="small"
                sx={{
                  mt: 0.75,
                  flexWrap: "wrap",
                  gap: 0.5,
                  "& .MuiToggleButtonGroup-grouped": {
                    border: "0.5px solid var(--color-border-tertiary) !important",
                    borderRadius: "6px !important",
                    px: 1,
                    py: 0.25,
                    fontSize: "11px",
                    textTransform: "none",
                    minWidth: 0,
                    color: "var(--color-text-secondary)",
                    "&.Mui-selected": {
                      bgcolor: "var(--color-primary)",
                      color: "#fff",
                      "&:hover": { bgcolor: "var(--color-primary)" },
                    },
                  },
                }}
              >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="published">Published</ToggleButton>
                <ToggleButton value="draft">Draft</ToggleButton>
                <ToggleButton value="inactive">Inactive</ToggleButton>
              </ToggleButtonGroup>
            )}
          </Box>
          <Divider />
          <Box sx={{ flex: 1, overflowY: "auto" }}>
            {filteredTopics.length === 0 && (
              <Typography
                sx={{
                  px: 2,
                  py: 3,
                  fontSize: "13px",
                  color: "var(--color-text-secondary)",
                  textAlign: "center",
                }}
              >
                {(typeFilter !== "all" || statusFilter !== "all") ? `No matching topics.` : "No topics yet."}
              </Typography>
            )}
            {filteredTopics.map((t, i) => {
              const cfg = typeConfig[t.type] || typeConfig.note;
              const Icon = typeIcon[t.type] || DescriptionOutlinedIcon;
              const isSelected = t._id === selectedId || (!selectedId && i === 0);
              const isInactive = (t.status || "published") === "inactive";
              return (
                <Box
                  key={t._id || i}
                  onClick={() => setSelectedId(t._id)}
                  sx={{
                    px: 2,
                    py: 1.5,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.5,
                    opacity: isInactive ? 0.5 : 1,
                    bgcolor: isSelected
                      ? "var(--color-background-primary)"
                      : "transparent",
                    borderLeft: isSelected
                      ? "3px solid var(--color-primary)"
                      : "3px solid transparent",
                    transition: "all 0.15s",
                    "&:hover": {
                      bgcolor: "var(--color-background-primary)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "6px",
                      bgcolor: cfg.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      mt: 0.25,
                    }}
                  >
                    <Icon sx={{ fontSize: 14, color: cfg.color }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: isSelected ? 600 : 400,
                        color: isSelected
                          ? "var(--color-text-primary)"
                          : "var(--color-text-secondary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        textDecoration: isInactive ? "line-through" : "none",
                      }}
                    >
                      {t.title || `Topic ${i + 1}`}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "10px",
                        color: isInactive ? "#c62828" : (t.status === "draft" ? "#e65100" : cfg.color),
                        textTransform: "capitalize",
                      }}
                    >
                      {isInactive ? "Inactive" : (t.status === "draft" ? "Draft" : cfg.label)}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Content Area */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 3,
            minWidth: 0,
          }}
        >
          {selectedTopic ? (
            <>
              <Typography
                sx={{
                  fontSize: "18px",
                  fontWeight: 600,
                  mb: 0.5,
                  color: "var(--color-text-primary)",
                }}
              >
                {selectedTopic.title}
              </Typography>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  fontSize: "11px",
                  fontWeight: 500,
                  px: 1,
                  py: 0.25,
                  borderRadius: "4px",
                  bgcolor: (typeConfig[selectedTopic.type] || typeConfig.note).bg,
                  color: (typeConfig[selectedTopic.type] || typeConfig.note).color,
                  mb: 2.5,
                  textTransform: "capitalize",
                }}
              >
                {(typeConfig[selectedTopic.type] || typeConfig.note).label}
              </Box>
              <Box sx={{ mt: 1 }}>{renderTopicContent(selectedTopic)}</Box>
            </>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: 300,
                color: "var(--color-text-secondary)",
              }}
            >
              <Typography>Select a topic from the list.</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
