import { useState } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import HeadphonesOutlinedIcon from "@mui/icons-material/HeadphonesOutlined";
import DOMPurify from "dompurify";

export const typeConfig = {
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

export function NoteContent({ content }) {
  if (!content)
    return (
      <Typography sx={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
        No content available.
      </Typography>
    );

  // Detect if content contains HTML tags; render accordingly
  const hasHtml = /<[a-z][\s\S]*>/i.test(content);
  if (hasHtml) {
    const clean = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        "p", "br", "b", "strong", "i", "em", "u", "s", "del",
        "h1", "h2", "h3", "h4", "h5", "h6",
        "ul", "ol", "li", "blockquote", "pre", "code",
        "a", "span", "div", "hr", "table", "thead", "tbody", "tr", "th", "td",
      ],
      ALLOWED_ATTR: ["href", "target", "rel", "class", "style"],
    });
    return (
      <Box
        sx={{
          fontSize: "14px",
          lineHeight: 1.8,
          color: "var(--color-text-primary)",
          fontFamily: "inherit",
          "& h1,& h2,& h3,& h4": { mt: 2, mb: 0.5, fontWeight: 600 },
          "& p": { mb: 1 },
          "& ul,& ol": { pl: 3, mb: 1 },
          "& li": { mb: 0.25 },
          "& code": {
            bgcolor: "var(--color-background-secondary)",
            px: 0.5,
            borderRadius: "4px",
            fontFamily: "monospace",
            fontSize: "13px",
          },
          "& pre": {
            bgcolor: "var(--color-background-secondary)",
            p: 1.5,
            borderRadius: "var(--border-radius-md)",
            overflow: "auto",
          },
          "& blockquote": {
            borderLeft: "3px solid var(--color-primary)",
            pl: 2,
            my: 1,
            color: "var(--color-text-secondary)",
            fontStyle: "italic",
          },
          "& a": { color: "var(--color-primary)" },
          "& table": { borderCollapse: "collapse", width: "100%", mb: 1 },
          "& th,& td": {
            border: "1px solid var(--color-border-tertiary)",
            p: 1,
            fontSize: "13px",
          },
        }}
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    );
  }

  return (
    <Box
      sx={{
        fontSize: "14px",
        lineHeight: 1.8,
        color: "var(--color-text-primary)",
        whiteSpace: "pre-wrap",
        fontFamily: "inherit",
      }}
    >
      {content}
    </Box>
  );
}

export function VideoContent({ fileUrl, content }) {
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
        <Typography sx={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
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
            sx={{ fontSize: "14px", lineHeight: 1.7, whiteSpace: "pre-wrap" }}
          >
            {content}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export function PdfContent({ fileUrl }) {
  const [loading, setLoading] = useState(true);

  if (!fileUrl)
    return (
      <Typography sx={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
        No PDF available.
      </Typography>
    );

  // Cloudinary PDFs uploaded with wrong resource_type appear as image/upload.
  // Correct to raw/upload so the URL is publicly accessible.
  const correctedUrl = fileUrl.replace(
    /\/image\/upload\/(.*\.pdf)/i,
    "/raw/upload/$1",
  );

  return (
    <Box>
      {/* Action buttons */}
      <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<DownloadOutlinedIcon sx={{ fontSize: 14 }} />}
          component="a"
          href={correctedUrl}
          download
          rel="noopener noreferrer"
          sx={{ textTransform: "none", fontSize: "13px" }}
        >
          Download
        </Button>
      </Box>
      <Box
        sx={{
          borderRadius: "var(--border-radius-lg)",
          overflow: "hidden",
          border: "1px solid var(--color-border-tertiary)",
          height: { xs: 400, md: 600 },
          bgcolor: "var(--color-background-secondary)",
          position: "relative",
        }}
      >
        {loading && (
          <Box sx={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 1.5,
            bgcolor: "var(--color-background-secondary)",
            zIndex: 1,
          }}>
            <CircularProgress size={32} />
            <Typography sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Loading PDF…</Typography>
          </Box>
        )}
        <iframe
          src={`https://docs.google.com/gview?url=${encodeURIComponent(correctedUrl)}&embedded=true`}
          title="PDF Viewer"
          style={{ width: "100%", height: "100%", border: 0 }}
          onLoad={() => setLoading(false)}
        />
      </Box>
    </Box>
  );
}

export function AudioContent({ fileUrl, content }) {
  if (!fileUrl)
    return (
      <Typography sx={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
        No audio available.
      </Typography>
    );
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
        <audio
          controls
          style={{ width: "100%", maxWidth: 500 }}
          src={fileUrl}
        >
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
            sx={{ fontSize: "14px", lineHeight: 1.7, whiteSpace: "pre-wrap" }}
          >
            {content}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
