import {
  Box,
  Typography,
  Chip,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import HeadphonesOutlinedIcon from "@mui/icons-material/HeadphonesOutlined";
import { useGetSubjectsQuery } from "@/store/api/subjectApi";
import { useGetChaptersQuery } from "@/store/api/chapterApi";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const typeIcon = {
  note: <DescriptionOutlinedIcon sx={{ fontSize: 15 }} />,
  video: <PlayCircleOutlinedIcon sx={{ fontSize: 15 }} />,
  pdf: <PictureAsPdfOutlinedIcon sx={{ fontSize: 15 }} />,
  audio: <HeadphonesOutlinedIcon sx={{ fontSize: 15 }} />,
};

const defaultColors = [
  "#4361ee",
  "#e63946",
  "#2a9d8f",
  "#e76f51",
  "#7209b7",
  "#06d6a0",
  "#118ab2",
  "#f4a261",
];

function SubjectCard({ subject, index, chapters, chaptersLoading }) {
  const navigate = useNavigate();
  const color = subject.color || defaultColors[index % defaultColors.length];
  const published = chapters.filter((c) => c.status === "published");
  const totalTopics = published.reduce(
    (sum, ch) => sum + (ch.topicCount || 0),
    0,
  );
  const allTypes = [
    ...new Set(published.flatMap((ch) => ch.contentTypes || [])),
  ];

  return (
    <Box
      onClick={() => navigate(`/student/subjects/${subject._id}`)}
      sx={{
        bgcolor: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-lg)",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.2s",
        "&:hover": {
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          transform: "translateY(-2px)",
        },
      }}
    >
      {/* Color accent bar */}
      <Box sx={{ height: 4, bgcolor: color }} />

      <Box sx={{ p: 2.5 }}>
        {/* Icon + name */}
        <Box
          sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 2 }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              bgcolor: color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              flexShrink: 0,
            }}
          >
            <MenuBookOutlinedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: "15px",
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {subject.name}
            </Typography>
            {subject.teacherId?.name && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mt: 0.25,
                }}
              >
                <PersonOutlineOutlinedIcon
                  sx={{
                    fontSize: 14,
                    color: "var(--color-text-tertiary)",
                  }}
                />
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {subject.teacherId.name}
                </Typography>
              </Box>
            )}
          </Box>
          <ArrowForwardIcon
            sx={{
              fontSize: 18,
              color: "var(--color-text-tertiary)",
              mt: 0.5,
            }}
          />
        </Box>

        {/* Stats */}
        {chaptersLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
            <CircularProgress size={16} />
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: 1.5,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: "20px",
                    fontWeight: 600,
                    lineHeight: 1,
                    color,
                  }}
                >
                  {published.length}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "11px",
                    color: "var(--color-text-tertiary)",
                  }}
                >
                  chapters
                </Typography>
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: "20px",
                    fontWeight: 600,
                    lineHeight: 1,
                    color,
                  }}
                >
                  {totalTopics}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "11px",
                    color: "var(--color-text-tertiary)",
                  }}
                >
                  topics
                </Typography>
              </Box>
            </Box>

            {/* Content types */}
            {allTypes.length > 0 && (
              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                {allTypes.map((t) => (
                  <Chip
                    key={t}
                    icon={typeIcon[t]}
                    label={t}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: "11px",
                      bgcolor: "var(--color-background-secondary)",
                      color: "var(--color-text-secondary)",
                      fontWeight: 500,
                      "& .MuiChip-label": { px: 0.5 },
                      "& .MuiChip-icon": {
                        ml: 0.5,
                        color: "inherit",
                      },
                    }}
                  />
                ))}
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

export default function MySubjects() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const { data: subjects = [], isLoading: subjectsLoading } =
    useGetSubjectsQuery({ classId: user?.classId });

  // Fetch chapters for all subjects in one go (each subject triggers a separate cached query)
  const chapterQueries = subjects.map((s) => s._id);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: "22px", fontWeight: 500, mb: 0.25 }}>
          My Subjects
        </Typography>
        <Typography
          sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
        >
          {subjects.length > 0
            ? `${subjects.length} subject${subjects.length !== 1 ? "s" : ""} in your class`
            : "Explore your subjects and learning materials"}
        </Typography>
      </Box>

      {subjectsLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={28} />
        </Box>
      ) : subjects.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            bgcolor: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
          }}
        >
          <MenuBookOutlinedIcon
            sx={{
              fontSize: 48,
              color: "var(--color-text-secondary)",
              mb: 1.5,
              opacity: 0.5,
            }}
          />
          <Typography sx={{ fontSize: "15px", fontWeight: 500, mb: 0.5 }}>
            No subjects assigned yet
          </Typography>
          <Typography
            sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
            Subjects will appear here once your school assigns them to your
            class.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: 2,
          }}
        >
          {subjects.map((subject, idx) => (
            <SubjectCardWrapper
              key={subject._id}
              subject={subject}
              index={idx}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

/* Wrapper that fetches chapters for a single subject card */
function SubjectCardWrapper({ subject, index }) {
  const { data: chapters = [], isLoading } = useGetChaptersQuery({
    subjectId: subject._id,
  });
  return (
    <SubjectCard
      subject={subject}
      index={index}
      chapters={chapters}
      chaptersLoading={isLoading}
    />
  );
}
