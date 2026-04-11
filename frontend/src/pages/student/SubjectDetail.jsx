import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Collapse,
  IconButton,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import HeadphonesOutlinedIcon from "@mui/icons-material/HeadphonesOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import { useParams, useNavigate } from "react-router-dom";
import { useGetSubjectsQuery } from "@/store/api/subjectApi";
import { useGetChaptersQuery } from "@/store/api/chapterApi";
import { useSelector } from "react-redux";

const typeIcon = {
  note: <DescriptionOutlinedIcon sx={{ fontSize: 18 }} />,
  video: <PlayCircleOutlinedIcon sx={{ fontSize: 18 }} />,
  pdf: <PictureAsPdfOutlinedIcon sx={{ fontSize: 18 }} />,
  audio: <HeadphonesOutlinedIcon sx={{ fontSize: 18 }} />,
};

const typeColor = {
  note: { bg: "#e8f5e9", color: "#2e7d32" },
  video: { bg: "#e3f2fd", color: "#1565c0" },
  pdf: { bg: "#fce4ec", color: "#c62828" },
  audio: { bg: "#fff3e0", color: "#e65100" },
};

export default function SubjectDetail() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [expanded, setExpanded] = useState({});

  const { data: subjects = [] } = useGetSubjectsQuery({
    classId: user?.classId,
  });
  const subject = subjects.find((s) => s._id === subjectId);

  const { data: chapters = [], isLoading } = useGetChaptersQuery(
    { subjectId },
    { skip: !subjectId },
  );
  const published = chapters.filter((c) => c.status === "published");

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const totalTopics = published.reduce(
    (sum, ch) => sum + (ch.topicCount || 0),
    0,
  );

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Back + header */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{
          mb: 2,
          fontSize: "13px",
          color: "var(--color-text-secondary)",
          textTransform: "none",
        }}
      >
        All subjects
      </Button>

      <Box
        sx={{
          bgcolor: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          p: 2.5,
          mb: 3,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "12px",
            bgcolor: subject?.color || "var(--color-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            flexShrink: 0,
          }}
        >
          <MenuBookOutlinedIcon />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: "18px", fontWeight: 600 }}>
            {subject?.name || "Subject"}
          </Typography>
          <Typography
            sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
            {subject?.teacherId?.name
              ? `Taught by ${subject.teacherId.name}`
              : ""}
            {subject?.teacherId?.name && totalTopics > 0 ? " · " : ""}
            {totalTopics > 0
              ? `${published.length} chapters · ${totalTopics} topics`
              : `${published.length} chapters`}
          </Typography>
        </Box>
      </Box>

      {/* Chapters */}
      {published.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            bgcolor: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
          }}
        >
          <MenuBookOutlinedIcon
            sx={{
              fontSize: 40,
              color: "var(--color-text-secondary)",
              mb: 1,
              opacity: 0.5,
            }}
          />
          <Typography
            sx={{ fontSize: "14px", color: "var(--color-text-secondary)" }}
          >
            No chapters published yet
          </Typography>
          <Typography
            sx={{ fontSize: "12px", color: "var(--color-text-tertiary)" }}
          >
            Your teacher hasn&apos;t published any content for this subject.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {published.map((ch, idx) => {
            const isOpen = expanded[ch._id];
            const topics = ch.topics || [];
            return (
              <Box
                key={ch._id}
                sx={{
                  bgcolor: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                  borderRadius: "var(--border-radius-lg)",
                  overflow: "hidden",
                  transition: "box-shadow 0.2s",
                  "&:hover": {
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  },
                }}
              >
                {/* Chapter header - clickable */}
                <Box
                  onClick={() => toggle(ch._id)}
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    cursor: "pointer",
                    userSelect: "none",
                    "&:hover": {
                      bgcolor: "var(--color-background-secondary)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "8px",
                      bgcolor: "var(--color-background-secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--color-text-secondary)",
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: "14px",
                        fontWeight: 500,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ch.title}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 0.25,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "12px",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        {ch.topicCount || 0} topic
                        {(ch.topicCount || 0) !== 1 ? "s" : ""}
                      </Typography>
                      {(ch.contentTypes || []).length > 0 && (
                        <>
                          <Box
                            sx={{
                              width: 3,
                              height: 3,
                              borderRadius: "50%",
                              bgcolor: "var(--color-text-tertiary)",
                            }}
                          />
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            {ch.contentTypes.map((t) => (
                              <Chip
                                key={t}
                                label={t}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: "11px",
                                  bgcolor:
                                    typeColor[t]?.bg ||
                                    "var(--color-background-secondary)",
                                  color:
                                    typeColor[t]?.color ||
                                    "var(--color-text-secondary)",
                                  fontWeight: 500,
                                  "& .MuiChip-label": { px: 1 },
                                }}
                              />
                            ))}
                          </Box>
                        </>
                      )}
                    </Box>
                  </Box>
                  <IconButton size="small" sx={{ ml: "auto" }}>
                    {isOpen ? (
                      <ExpandLessIcon fontSize="small" />
                    ) : (
                      <ExpandMoreIcon fontSize="small" />
                    )}
                  </IconButton>
                </Box>

                {/* Expanded topic list */}
                <Collapse in={isOpen}>
                  <Box
                    sx={{
                      borderTop: "1px solid var(--color-border-tertiary)",
                    }}
                  >
                    {ch.description && (
                      <Box
                        sx={{
                          px: 2,
                          py: 1.5,
                          bgcolor: "var(--color-background-secondary)",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "13px",
                            color: "var(--color-text-secondary)",
                            lineHeight: 1.5,
                          }}
                        >
                          {ch.description}
                        </Typography>
                      </Box>
                    )}
                    {topics.length === 0 ? (
                      <Box sx={{ px: 2, py: 2 }}>
                        <Typography
                          sx={{
                            fontSize: "13px",
                            color: "var(--color-text-tertiary)",
                          }}
                        >
                          No topics in this chapter yet
                        </Typography>
                      </Box>
                    ) : (
                      topics.map((topic, tIdx) => (
                        <Box
                          key={topic._id}
                          onClick={() =>
                            navigate(
                              `/student/subjects/${subjectId}/chapters/${ch._id}/topics/${topic._id}`,
                            )
                          }
                          sx={{
                            px: 2,
                            py: 1.5,
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            cursor: "pointer",
                            borderTop:
                              tIdx > 0 || ch.description
                                ? "1px solid var(--color-border-tertiary)"
                                : "none",
                            "&:hover": {
                              bgcolor: "var(--color-background-secondary)",
                            },
                            transition: "background 0.15s",
                          }}
                        >
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: "8px",
                              bgcolor:
                                typeColor[topic.type]?.bg ||
                                "var(--color-background-secondary)",
                              color:
                                typeColor[topic.type]?.color ||
                                "var(--color-text-secondary)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {typeIcon[topic.type] || (
                              <DescriptionOutlinedIcon sx={{ fontSize: 18 }} />
                            )}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontSize: "13px",
                                fontWeight: 500,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {topic.title}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "11px",
                                color:
                                  typeColor[topic.type]?.color ||
                                  "var(--color-text-secondary)",
                                fontWeight: 500,
                                textTransform: "capitalize",
                              }}
                            >
                              {topic.type}
                            </Typography>
                          </Box>
                          <ArrowBackIcon
                            sx={{
                              fontSize: 16,
                              color: "var(--color-text-tertiary)",
                              transform: "rotate(180deg)",
                            }}
                          />
                        </Box>
                      ))
                    )}
                  </Box>
                </Collapse>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
