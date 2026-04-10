import { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { useGetSubjectsQuery } from "@/store/api/subjectApi";
import { useGetChaptersQuery } from "@/store/api/chapterApi";
import { useSelector } from "react-redux";

export default function MySubjects() {
  const { user } = useSelector((s) => s.auth);
  const { data: subjects = [] } = useGetSubjectsQuery({
    classId: user?.classId,
  });
  const [selected, setSelected] = useState(null);
  const { data: chapters = [] } = useGetChaptersQuery(
    selected ? { subjectId: selected } : undefined,
    { skip: !selected },
  );

  const published = chapters.filter((c) => c.status === "published");

  return (
    <Box>
      <Typography sx={{ fontSize: "22px", fontWeight: 500, mb: "14px" }}>
        My subjects
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "280px 1fr" },
          gap: "14px",
        }}
      >
        <Box
          sx={{
            bgcolor: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
          }}
        >
          <List disablePadding>
            {subjects.map((s) => (
              <ListItemButton
                key={s._id}
                selected={selected === s._id}
                onClick={() => setSelected(s._id)}
              >
                <ListItemText primary={s.name} secondary={s.teacherId?.name} />
              </ListItemButton>
            ))}
          </List>
        </Box>
        <Box>
          {selected ? (
            published.length > 0 ? (
              published.map((ch) => (
                <Box
                  key={ch._id}
                  sx={{
                    bgcolor: "var(--color-background-primary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                    borderRadius: "var(--border-radius-lg)",
                    p: 2,
                    mb: "14px",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography sx={{ fontSize: "14px" }}>
                      Ch {ch.order}: {ch.title}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      {(ch.contentTypes || []).map((t) => (
                        <Box
                          key={t}
                          sx={{
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: 500,
                            bgcolor: "var(--color-background-secondary)",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {t}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  {ch.topicCount != null && (
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {ch.topicCount} topics
                    </Typography>
                  )}
                </Box>
              ))
            ) : (
              <Typography
                sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
              >
                No published chapters yet.
              </Typography>
            )
          ) : (
            <Typography
              sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
            >
              Select a subject to view chapters.
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
