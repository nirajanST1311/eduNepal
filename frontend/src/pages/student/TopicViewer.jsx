import { Box, Typography, Button, Chip, CircularProgress } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import HeadphonesOutlinedIcon from "@mui/icons-material/HeadphonesOutlined";
import { useParams, useNavigate } from "react-router-dom";
import { useGetChapterQuery } from "@/store/api/chapterApi";

const typeConfig = {
  note: {
    icon: <DescriptionOutlinedIcon sx={{ fontSize: 18 }} />,
    label: "Note",
    bg: "#e8f5e9",
    color: "#2e7d32",
  },
  video: {
    icon: <PlayCircleOutlinedIcon sx={{ fontSize: 18 }} />,
    label: "Video",
    bg: "#e3f2fd",
    color: "#1565c0",
  },
  pdf: {
    icon: <PictureAsPdfOutlinedIcon sx={{ fontSize: 18 }} />,
    label: "PDF",
    bg: "#fce4ec",
    color: "#c62828",
  },
  audio: {
    icon: <HeadphonesOutlinedIcon sx={{ fontSize: 18 }} />,
    label: "Audio",
    bg: "#fff3e0",
    color: "#e65100",
  },
};

function NoteContent({ content }) {
  if (!content) {
    return (
      <Typography
        sx={{ fontSize: "14px", color: "var(--color-text-secondary)" }}
      >
        No content available.
      </Typography>
    );
  }
  return (
    <Box
      sx={{
        fontSize: "14px",
        lineHeight: 1.8,
        color: "var(--color-text-primary)",
        "& p": { mb: 1.5 },
        "& h1,& h2,& h3": { mt: 2, mb: 1, fontWeight: 600 },
        "& ul,& ol": { pl: 3, mb: 1.5 },
        "& li": { mb: 0.5 },
        whiteSpace: "pre-wrap",
      }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

function VideoContent({ fileUrl, content }) {
  const url = fileUrl || "";
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );

  return (
    <Box>
      {youtubeMatch ? (
        <Box
          sx={{
            position: "relative",
            paddingTop: "56.25%",
            borderRadius: "var(--border-radius-lg)",
            overflow: "hidden",
            bgcolor: "#000",
          }}
        >
          <iframe
            src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
            title="Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: 0,
            }}
          />
        </Box>
      ) : url ? (
        <Box
          sx={{
            borderRadius: "var(--border-radius-lg)",
            overflow: "hidden",
            bgcolor: "#000",
          }}
        >
          <video controls style={{ width: "100%", display: "block" }} src={url}>
            Your browser does not support the video tag.
          </video>
        </Box>
      ) : (
        <Typography
          sx={{ fontSize: "14px", color: "var(--color-text-secondary)" }}
        >
          No video available.
        </Typography>
      )}
      {content && (
        <Box sx={{ mt: 2 }}>
          <Typography
            sx={{
              fontSize: "13px",
              fontWeight: 500,
              mb: 1,
              color: "var(--color-text-secondary)",
            }}
          >
            Description
          </Typography>
          <Typography
            sx={{
              fontSize: "14px",
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              color: "var(--color-text-primary)",
            }}
          >
            {content}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

function PdfContent({ fileUrl }) {
  if (!fileUrl) {
    return (
      <Typography
        sx={{ fontSize: "14px", color: "var(--color-text-secondary)" }}
      >
        No PDF available.
      </Typography>
    );
  }
  return (
    <Box>
      <Box
        sx={{
          borderRadius: "var(--border-radius-lg)",
          overflow: "hidden",
          border: "1px solid var(--color-border-tertiary)",
          height: { xs: 400, md: 600 },
        }}
      >
        <iframe
          src={fileUrl}
          title="PDF viewer"
          style={{ width: "100%", height: "100%", border: 0 }}
        />
      </Box>
      <Button
        variant="outlined"
        size="small"
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ mt: 1.5, textTransform: "none", fontSize: "13px" }}
      >
        Open in new tab
      </Button>
    </Box>
  );
}

function AudioContent({ fileUrl, content }) {
  if (!fileUrl) {
    return (
      <Typography
        sx={{ fontSize: "14px", color: "var(--color-text-secondary)" }}
      >
        No audio available.
      </Typography>
    );
  }
  return (
    <Box>
      <Box
        sx={{
          bgcolor: "var(--color-background-secondary)",
          borderRadius: "var(--border-radius-lg)",
          p: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <audio controls style={{ width: "100%", maxWidth: 500 }} src={fileUrl}>
          Your browser does not support the audio element.
        </audio>
      </Box>
      {content && (
        <Box sx={{ mt: 2 }}>
          <Typography
            sx={{
              fontSize: "13px",
              fontWeight: 500,
              mb: 1,
              color: "var(--color-text-secondary)",
            }}
          >
            Transcript / Notes
          </Typography>
          <Typography
            sx={{
              fontSize: "14px",
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              color: "var(--color-text-primary)",
            }}
          >
            {content}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default function TopicViewer() {
  const { subjectId, chapterId, topicId } = useParams();
  const navigate = useNavigate();

  const { data: chapter, isLoading } = useGetChapterQuery(chapterId, {
    skip: !chapterId,
  });

  const topic = chapter?.topics?.find((t) => t._id === topicId);
  const topics = chapter?.topics || [];
  const currentIdx = topics.findIndex((t) => t._id === topicId);
  const prevTopic = currentIdx > 0 ? topics[currentIdx - 1] : null;
  const nextTopic =
    currentIdx >= 0 && currentIdx < topics.length - 1
      ? topics[currentIdx + 1]
      : null;

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (!topic) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/student/subjects/${subjectId}`)}
          sx={{
            mb: 2,
            fontSize: "13px",
            color: "var(--color-text-secondary)",
            textTransform: "none",
          }}
        >
          Back to subject
        </Button>
        <Typography
          sx={{ fontSize: "14px", color: "var(--color-text-secondary)" }}
        >
          Topic not found.
        </Typography>
      </Box>
    );
  }

  const cfg = typeConfig[topic.type] || typeConfig.note;

  return (
    <Box>
      {/* Back + breadcrumb */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/student/subjects/${subjectId}`)}
        sx={{
          mb: 2,
          fontSize: "13px",
          color: "var(--color-text-secondary)",
          textTransform: "none",
        }}
      >
        {chapter?.title || "Back to chapters"}
      </Button>

      {/* Topic header */}
      <Box
        sx={{
          bgcolor: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          p: 2.5,
          mb: 2.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              bgcolor: cfg.bg,
              color: cfg.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {cfg.icon}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: "16px", fontWeight: 600 }}>
              {topic.title}
            </Typography>
            <Chip
              label={cfg.label}
              size="small"
              sx={{
                mt: 0.5,
                height: 20,
                fontSize: "11px",
                fontWeight: 500,
                bgcolor: cfg.bg,
                color: cfg.color,
                "& .MuiChip-label": { px: 1 },
              }}
            />
          </Box>
          {topics.length > 1 && (
            <Typography
              sx={{
                fontSize: "12px",
                color: "var(--color-text-tertiary)",
                flexShrink: 0,
              }}
            >
              {currentIdx + 1} / {topics.length}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Content */}
      <Box
        sx={{
          bgcolor: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          p: { xs: 2, md: 3 },
          mb: 2.5,
          minHeight: 200,
        }}
      >
        {topic.type === "note" && <NoteContent content={topic.content} />}
        {topic.type === "video" && (
          <VideoContent fileUrl={topic.fileUrl} content={topic.content} />
        )}
        {topic.type === "pdf" && <PdfContent fileUrl={topic.fileUrl} />}
        {topic.type === "audio" && (
          <AudioContent fileUrl={topic.fileUrl} content={topic.content} />
        )}
      </Box>

      {/* Prev / Next navigation */}
      {(prevTopic || nextTopic) && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          {prevTopic ? (
            <Button
              variant="outlined"
              size="small"
              startIcon={<ArrowBackIcon sx={{ fontSize: "16px !important" }} />}
              onClick={() =>
                navigate(
                  `/student/subjects/${subjectId}/chapters/${chapterId}/topics/${prevTopic._id}`,
                )
              }
              sx={{
                textTransform: "none",
                fontSize: "13px",
                borderColor: "var(--color-border-tertiary)",
                color: "var(--color-text-primary)",
                maxWidth: "48%",
              }}
            >
              <Box
                component="span"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {prevTopic.title}
              </Box>
            </Button>
          ) : (
            <Box />
          )}
          {nextTopic ? (
            <Button
              variant="outlined"
              size="small"
              endIcon={
                <ArrowBackIcon
                  sx={{
                    fontSize: "16px !important",
                    transform: "rotate(180deg)",
                  }}
                />
              }
              onClick={() =>
                navigate(
                  `/student/subjects/${subjectId}/chapters/${chapterId}/topics/${nextTopic._id}`,
                )
              }
              sx={{
                textTransform: "none",
                fontSize: "13px",
                borderColor: "var(--color-border-tertiary)",
                color: "var(--color-text-primary)",
                maxWidth: "48%",
              }}
            >
              <Box
                component="span"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {nextTopic.title}
              </Box>
            </Button>
          ) : (
            <Box />
          )}
        </Box>
      )}
    </Box>
  );
}
