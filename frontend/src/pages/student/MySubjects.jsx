import { useState } from "react";
import { Box, Typography, Card, CardContent, List, ListItemButton, ListItemText, Chip, LinearProgress } from "@mui/material";
import { useGetSubjectsQuery } from "@/store/api/subjectApi";
import { useGetChaptersQuery } from "@/store/api/chapterApi";
import { useSelector } from "react-redux";

export default function MySubjects() {
  const { user } = useSelector((s) => s.auth);
  const { data: subjects = [] } = useGetSubjectsQuery({ classId: user?.classId });
  const [selected, setSelected] = useState(null);
  const { data: chapters = [] } = useGetChaptersQuery(selected ? { subjectId: selected } : undefined, { skip: !selected });

  const published = chapters.filter((c) => c.status === "published");

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>My subjects</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "280px 1fr" }, gap: 2 }}>
        <Card>
          <List disablePadding>
            {subjects.map((s) => (
              <ListItemButton key={s._id} selected={selected === s._id} onClick={() => setSelected(s._id)}>
                <ListItemText primary={s.name} secondary={s.teacherId?.name} />
              </ListItemButton>
            ))}
          </List>
        </Card>
        <Box>
          {selected ? (
            published.length > 0 ? published.map((ch) => (
              <Card key={ch._id} sx={{ mb: 1.5 }}>
                <CardContent sx={{ py: 1.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body1">Ch {ch.order}: {ch.title}</Typography>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      {(ch.contentTypes || []).map((t) => <Chip key={t} label={t} size="small" variant="outlined" />)}
                    </Box>
                  </Box>
                  {ch.topicCount != null && (
                    <Typography variant="caption" color="text.secondary">{ch.topicCount} topics</Typography>
                  )}
                </CardContent>
              </Card>
            )) : <Typography variant="body2" color="text.secondary">No published chapters yet.</Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">Select a subject to view chapters.</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
