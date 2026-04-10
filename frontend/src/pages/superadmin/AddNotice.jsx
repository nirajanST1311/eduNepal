import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  Grid,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CampaignIcon from "@mui/icons-material/Campaign";
import GroupsIcon from "@mui/icons-material/Groups";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useCreateNoticeMutation } from "@/store/api/noticeApi";
import { useGetSchoolsQuery } from "@/store/api/schoolApi";
import dayjs from "dayjs";

const CATEGORIES = [
  { value: "general", label: "General", icon: "📋" },
  { value: "urgent", label: "Urgent", icon: "🚨" },
  { value: "holiday", label: "Holiday", icon: "🎉" },
  { value: "exam_schedule", label: "Exam Schedule", icon: "📝" },
  { value: "event", label: "Event", icon: "📅" },
];

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const CAT_COLORS = {
  general: { bg: "var(--color-background-info)", text: "var(--color-text-info)", border: "var(--color-border-info)" },
  urgent: { bg: "var(--color-background-danger)", text: "var(--color-text-danger)", border: "var(--color-border-danger)" },
  holiday: { bg: "var(--color-background-success)", text: "var(--color-text-success)", border: "var(--color-border-success)" },
  exam_schedule: { bg: "var(--color-background-warning)", text: "var(--color-text-warning)", border: "var(--color-border-warning)" },
  event: { bg: "var(--color-background-info)", text: "var(--color-text-info)", border: "var(--color-border-info)" },
};

const PRI_COLORS = {
  low: "var(--color-text-success)",
  medium: "var(--color-text-warning)",
  high: "var(--color-text-danger)",
};

export default function AddNotice() {
  const navigate = useNavigate();
  const { data: schools = [] } = useGetSchoolsQuery();
  const [createNotice, { isLoading }] = useCreateNoticeMutation();

  const [form, setForm] = useState({
    title: "",
    body: "",
    schoolId: "all",
    category: "general",
    priority: "medium",
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (fieldErrors[field]) setFieldErrors((e) => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.body.trim()) errs.body = "Content is required";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const payload = {
      title: form.title.trim(),
      body: form.body.trim(),
      category: form.category,
      priority: form.priority,
      targetAudience:
        form.schoolId === "all"
          ? "All schools"
          : schools.find((s) => s._id === form.schoolId)?.name || "",
    };
    if (form.schoolId !== "all") payload.schoolId = form.schoolId;
    try {
      await createNotice(payload).unwrap();
      navigate("/superadmin/notices");
    } catch {
      /* handled by RTK */
    }
  };

  const cc = CAT_COLORS[form.category] || CAT_COLORS.general;
  const catObj = CATEGORIES.find((c) => c.value === form.category);
  const audienceLabel =
    form.schoolId === "all"
      ? "All schools"
      : schools.find((s) => s._id === form.schoolId)?.name || "—";

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
        <Box
          onClick={() => navigate("/superadmin/notices")}
          sx={{
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "var(--border-radius-md)",
            border: "0.5px solid var(--color-border-tertiary)",
            cursor: "pointer",
            "&:hover": { bgcolor: "var(--color-background-secondary)" },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: "22px", fontWeight: 500 }}>
            Create Notice
          </Typography>
        </Box>
      </Box>
      <Typography
        sx={{ fontSize: "13px", color: "var(--color-text-secondary)", mb: 3, ml: 5.5 }}
      >
        Broadcast a notice to all schools or a specific school
      </Typography>

      {/* Two-column layout */}
      <Grid container spacing={3}>
        {/* Left - Form */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Box
            sx={{
              bgcolor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: "var(--border-radius-lg)",
              p: 3,
            }}
          >
            {/* Category selector — clickable chips */}
            <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 1 }}>
              Category
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
              {CATEGORIES.map((c) => {
                const active = form.category === c.value;
                const colors = CAT_COLORS[c.value] || CAT_COLORS.general;
                return (
                  <Box
                    key={c.value}
                    onClick={() => set("category", c.value)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      px: 1.5,
                      py: 0.75,
                      borderRadius: "var(--border-radius-md)",
                      border: active
                        ? `1.5px solid ${colors.text}`
                        : "1px solid var(--color-border-tertiary)",
                      bgcolor: active ? colors.bg : "transparent",
                      color: active ? colors.text : "var(--color-text-secondary)",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: active ? 500 : 400,
                      transition: "all 0.15s",
                      "&:hover": {
                        borderColor: colors.text,
                        bgcolor: colors.bg,
                      },
                    }}
                  >
                    <span>{c.icon}</span>
                    {c.label}
                  </Box>
                );
              })}
            </Box>

            {/* Title */}
            <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 0.5 }}>
              Notice Title <span style={{ color: "var(--color-text-danger)" }}>*</span>
            </Typography>
            <TextField
              placeholder="e.g. School reopening after Dashain break"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              fullWidth
              size="small"
              error={!!fieldErrors.title}
              helperText={fieldErrors.title}
              sx={{ mb: 2.5 }}
            />

            {/* Body */}
            <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 0.5 }}>
              Notice Content <span style={{ color: "var(--color-text-danger)" }}>*</span>
            </Typography>
            <TextField
              placeholder="Write your notice content here. This will be visible to all recipients..."
              value={form.body}
              onChange={(e) => set("body", e.target.value)}
              fullWidth
              multiline
              rows={6}
              size="small"
              error={!!fieldErrors.body}
              helperText={fieldErrors.body}
              sx={{ mb: 2.5 }}
            />

            {/* Target & Priority in a row */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 0.5 }}>
                  Target Audience
                </Typography>
                <FormControl size="small" fullWidth>
                  <Select
                    value={form.schoolId}
                    onChange={(e) => set("schoolId", e.target.value)}
                  >
                    <MenuItem value="all">All Schools</MenuItem>
                    {schools.map((s) => (
                      <MenuItem key={s._id} value={s._id}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 0.5 }}>
                  Priority
                </Typography>
                <FormControl size="small" fullWidth>
                  <Select
                    value={form.priority}
                    onChange={(e) => set("priority", e.target.value)}
                  >
                    {PRIORITIES.map((p) => (
                      <MenuItem key={p.value} value={p.value}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: PRI_COLORS[p.value],
                            }}
                          />
                          {p.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Divider sx={{ mb: 2.5 }} />

            {/* Actions */}
            <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={() => navigate("/superadmin/notices")}
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
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isLoading}
                startIcon={<CampaignIcon sx={{ fontSize: 18 }} />}
                sx={{ textTransform: "none" }}
              >
                {isLoading ? "Broadcasting\u2026" : "Broadcast Notice"}
              </Button>
            </Box>
          </Box>
        </Grid>

        {/* Right - Live preview */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box
            sx={{
              position: "sticky",
              top: 24,
            }}
          >
            <Typography
              sx={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--color-text-secondary)",
                letterSpacing: 0.5,
                mb: 1.5,
                textTransform: "uppercase",
              }}
            >
              Live Preview
            </Typography>

            {/* Preview card */}
            <Box
              sx={{
                bgcolor: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: "var(--border-radius-lg)",
                overflow: "hidden",
              }}
            >
              {/* Category accent bar */}
              <Box sx={{ height: 4, bgcolor: cc.text }} />

              <Box sx={{ p: 2.5 }}>
                {/* Category & Priority */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <Box
                    component="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.5,
                      px: 1,
                      py: 0.3,
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: 500,
                      bgcolor: cc.bg,
                      color: cc.text,
                      border: `0.5px solid ${cc.border}`,
                    }}
                  >
                    {catObj?.icon} {catObj?.label}
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.5,
                      fontSize: "11px",
                      fontWeight: 500,
                      color: PRI_COLORS[form.priority],
                    }}
                  >
                    <Box
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        bgcolor: PRI_COLORS[form.priority],
                      }}
                    />
                    {form.priority.charAt(0).toUpperCase() + form.priority.slice(1)}
                  </Box>
                </Box>

                {/* Title */}
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: 500,
                    mb: 1,
                    color: form.title.trim()
                      ? "var(--color-text-primary)"
                      : "var(--color-text-tertiary)",
                  }}
                >
                  {form.title.trim() || "Notice title will appear here\u2026"}
                </Typography>

                {/* Body */}
                <Typography
                  sx={{
                    fontSize: "13px",
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                    mb: 2,
                    color: form.body.trim()
                      ? "var(--color-text-secondary)"
                      : "var(--color-text-tertiary)",
                  }}
                >
                  {form.body.trim() || "Notice content will appear here\u2026"}
                </Typography>

                <Divider sx={{ mb: 1.5 }} />

                {/* Meta info */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <GroupsIcon
                      sx={{ fontSize: 15, color: "var(--color-text-tertiary)" }}
                    />
                    <Typography sx={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
                      {audienceLabel}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CampaignIcon
                      sx={{ fontSize: 15, color: "var(--color-text-tertiary)" }}
                    />
                    <Typography sx={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
                      Municipality broadcast
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CalendarTodayIcon
                      sx={{ fontSize: 14, color: "var(--color-text-tertiary)" }}
                    />
                    <Typography sx={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
                      {dayjs().format("MMM D, YYYY \u00B7 h:mm A")}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Info note */}
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: "var(--color-background-info)",
                borderRadius: "var(--border-radius-md)",
                border: "0.5px solid var(--color-border-info)",
              }}
            >
              <Typography sx={{ fontSize: "12px", color: "var(--color-text-info)", lineHeight: 1.6 }}>
                This notice will be sent to{" "}
                <strong>{audienceLabel.toLowerCase()}</strong> as a municipality
                broadcast. Recipients will see it in their notice board immediately.
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
