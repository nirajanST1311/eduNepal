import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";
import {
  useGetNoticesQuery,
  useCreateNoticeMutation,
} from "@/store/api/noticeApi";
import { useGetSchoolsQuery } from "@/store/api/schoolApi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "urgent", label: "Urgent" },
  { value: "holiday", label: "Holiday" },
  { value: "exam_schedule", label: "Exam schedule" },
  { value: "event", label: "Event" },
];

const CATEGORY_COLORS = {
  general: "var(--color-text-info)",
  urgent: "var(--color-text-danger)",
  holiday: "var(--color-text-success)",
  exam_schedule: "var(--color-text-warning)",
  event: "var(--color-text-info)",
};

export default function SuperadminNotices() {
  const { data: notices = [] } = useGetNoticesQuery({});
  const { data: schools = [] } = useGetSchoolsQuery();
  const [createNotice, { isLoading }] = useCreateNoticeMutation();

  const [form, setForm] = useState({
    title: "",
    body: "",
    schoolId: "all",
    category: "general",
  });

  const handleCreate = async () => {
    if (!form.title || !form.body) return;
    const payload = {
      title: form.title,
      body: form.body,
      category: form.category,
      targetAudience:
        form.schoolId === "all"
          ? "All schools"
          : schools.find((s) => s._id === form.schoolId)?.name || "",
    };
    if (form.schoolId !== "all") payload.schoolId = form.schoolId;
    await createNotice(payload).unwrap();
    setForm({ title: "", body: "", schoolId: "all", category: "general" });
  };

  const formatDate = (dateStr) => {
    const d = dayjs(dateStr);
    const now = dayjs();
    if (now.diff(d, "hour") < 24) return "Yesterday";
    return d.format("MMM D");
  };

  return (
    <Box>
      <Typography sx={{ fontSize: "22px", fontWeight: 500 }}>
        Notices
      </Typography>
      <Typography
        sx={{ fontSize: "13px", color: "var(--color-text-secondary)", mb: 3 }}
      >
        Broadcast to all schools, specific schools, or roles
      </Typography>

      {/* New notice form */}
      <Box
        sx={{
          bgcolor: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          p: 3,
          mb: 4,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
          New municipality notice
        </Typography>

        <TextField
          placeholder="Notice title..."
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          fullWidth
          size="small"
        />

        <TextField
          placeholder="Write notice content here..."
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          fullWidth
          multiline
          rows={3}
          size="small"
        />

        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControl size="small" fullWidth>
            <Select
              value={form.schoolId}
              onChange={(e) => setForm({ ...form, schoolId: e.target.value })}
              displayEmpty
            >
              <MenuItem value="all">All schools</MenuItem>
              {schools.map((s) => (
                <MenuItem key={s._id} value={s._id}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <Select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              displayEmpty
            >
              {CATEGORIES.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  {c.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            onClick={handleCreate}
            disabled={isLoading || !form.title || !form.body}
            sx={{
              textTransform: "none",
              color: "text.primary",
              borderColor: "divider",
              "&:hover": {
                borderColor: "text.secondary",
                bgcolor: "var(--color-background-secondary)",
              },
            }}
          >
            Broadcast
          </Button>
        </Box>
      </Box>

      {/* Sent notices */}
      <Divider sx={{ mb: 2 }} />
      <Typography
        sx={{
          fontSize: "12px",
          fontWeight: 500,
          color: "var(--color-text-secondary)",
          letterSpacing: 1,
          mb: 2,
          display: "block",
        }}
      >
        SENT NOTICES
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {notices.map((n) => {
          const dotColor =
            CATEGORY_COLORS[n.category] || CATEGORY_COLORS.general;
          return (
            <Box
              key={n._id}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1.5,
                py: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              {/* Colored dot */}
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: dotColor,
                  mt: 0.8,
                  flexShrink: 0,
                }}
              />

              {/* Content */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.3,
                  }}
                >
                  <Typography
                    sx={{ fontSize: "14px", fontWeight: 500, flex: 1 }}
                  >
                    {n.title}
                  </Typography>
                  {n.from === "municipality" && (
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: 500,
                        bgcolor: "var(--color-background-info)",
                        color: "var(--color-text-info)",
                        border: "0.5px solid var(--color-border-info)",
                      }}
                    >
                      Municipality
                    </Box>
                  )}
                </Box>
                <Typography
                  sx={{
                    fontSize: "13px",
                    color: "var(--color-text-secondary)",
                    mb: 0.5,
                  }}
                >
                  {n.body}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {formatDate(n.createdAt)} ·{" "}
                  {dayjs(n.createdAt).format("h:mm A")} ·{" "}
                  {n.targetAudience || "All schools"}
                  {n.category === "urgent" ? " · Principal only" : ""}
                </Typography>
              </Box>
            </Box>
          );
        })}

        {notices.length === 0 && (
          <Typography
            sx={{
              fontSize: "13px",
              color: "var(--color-text-secondary)",
              py: 4,
              textAlign: "center",
            }}
          >
            No notices sent yet
          </Typography>
        )}
      </Box>
    </Box>
  );
}
