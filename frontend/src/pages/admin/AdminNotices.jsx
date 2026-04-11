import { useState, useCallback, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Chip,
  Pagination,
  IconButton,
  Tooltip,
  Skeleton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/Add";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import {
  useGetNoticesPaginatedQuery,
  useCreateNoticeMutation,
  useDeleteNoticeMutation,
} from "@/store/api/noticeApi";
import dayjs from "dayjs";

const PAGE_SIZE = 20;

const PRIORITY_CFG = {
  high:   { label: "High",   color: "#c62828", bg: "#ffebee", bar: "#ef5350" },
  medium: { label: "Medium", color: "#e65100", bg: "#fff3e0", bar: "#ffa726" },
  low:    { label: "Low",    color: "#2e7d32", bg: "#e8f5e9", bar: "#66bb6a" },
};

const CATEGORIES = [
  { value: "general",       label: "General" },
  { value: "urgent",        label: "Urgent" },
  { value: "holiday",       label: "Holiday" },
  { value: "exam_schedule", label: "Exam" },
  { value: "event",         label: "Event" },
];

function formatDate(d) {
  const m = dayjs(d);
  const diff = dayjs().diff(m, "hour");
  if (diff < 1) return "Just now";
  if (diff < 24) return `${diff}h ago`;
  if (diff < 48) return "Yesterday";
  return m.format("MMM D, YYYY");
}

function isNew(d) {
  return Date.now() - new Date(d).getTime() < 24 * 3600 * 1000;
}

export default function AdminNotices() {
  const { user } = useSelector((s) => s.auth);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({
    title: "", body: "", category: "general", priority: "medium", scope: "global",
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const [createNotice, { isLoading: creating }] = useCreateNoticeMutation();
  const [deleteNotice, { isLoading: deleting }] = useDeleteNoticeMutation();

  const debounceRef = useRef(null);
  const handleSearch = useCallback((val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(val); setPage(1); }, 400);
  }, []);

  const { data, isLoading } = useGetNoticesPaginatedQuery({
    page, limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    priority: priorityFilter || undefined,
    category: categoryFilter || undefined,
  });

  const notices = useMemo(() => data?.notices || [], [data]);
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const newCount = useMemo(() => notices.filter((n) => isNew(n.createdAt)).length, [notices]);
  const hasFilters = !!(debouncedSearch || priorityFilter || categoryFilter);

  const clearAll = () => {
    setSearch(""); setDebouncedSearch("");
    setPriorityFilter(""); setCategoryFilter(""); setPage(1);
  };

  const handleCreate = async () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.body.trim()) errs.body = "Content is required";
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      await createNotice({ ...form, schoolId: user?.schoolId }).unwrap();
      setOpen(false);
      setForm({ title: "", body: "", category: "general", priority: "medium", scope: "global" });
      setFieldErrors({});
    } catch { /* handled by RTK */ }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await deleteNotice(deleteTarget._id).unwrap(); } catch { /* handled */ }
    setDeleteTarget(null);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
        <Typography sx={{ fontSize: "22px", fontWeight: 500 }}>Notices</Typography>
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setOpen(true)} sx={{ textTransform: "none", fontSize: "13px" }}>
          New Notice
        </Button>
      </Box>

      <Typography sx={{ fontSize: "13px", color: "var(--color-text-secondary)", mb: 2.5 }}>
        {total} notice{total !== 1 ? "s" : ""}
        {newCount > 0 && (
          <Box component="span" sx={{ ml: 1, px: 0.75, py: 0.15, borderRadius: "4px", fontSize: "11px", fontWeight: 600, bgcolor: "var(--color-background-success)", color: "var(--color-text-success)" }}>
            {newCount} new today
          </Box>
        )}
      </Typography>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center", mb: 2.5 }}>
        <TextField
          placeholder="Search notices…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          size="small"
          sx={{ width: 220 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: "var(--color-text-secondary)" }} /></InputAdornment>,
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => handleSearch("")} sx={{ p: 0.25 }}>
                  <CloseIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />

        {Object.entries(PRIORITY_CFG).map(([key, cfg]) => {
          const active = priorityFilter === key;
          return (
            <Chip key={key} label={cfg.label} size="small"
              onClick={() => { setPriorityFilter(active ? "" : key); setPage(1); }}
              onDelete={active ? () => { setPriorityFilter(""); setPage(1); } : undefined}
              sx={{
                fontWeight: active ? 600 : 400,
                bgcolor: active ? cfg.bg : "transparent",
                color: active ? cfg.color : "var(--color-text-secondary)",
                border: `0.5px solid ${active ? cfg.bar : "var(--color-border-tertiary)"}`,
                "& .MuiChip-deleteIcon": { color: cfg.color, fontSize: 14 },
              }}
            />
          );
        })}

        {CATEGORIES.map((c) => {
          const active = categoryFilter === c.value;
          return (
            <Chip key={c.value} label={c.label} size="small"
              onClick={() => { setCategoryFilter(active ? "" : c.value); setPage(1); }}
              onDelete={active ? () => { setCategoryFilter(""); setPage(1); } : undefined}
              sx={{
                fontWeight: active ? 500 : 400,
                bgcolor: active ? "var(--color-background-info)" : "transparent",
                color: active ? "var(--color-text-info)" : "var(--color-text-secondary)",
                border: `0.5px solid ${active ? "var(--color-border-info)" : "var(--color-border-tertiary)"}`,
              }}
            />
          );
        })}

        {hasFilters && (
          <Button size="small" startIcon={<CloseIcon sx={{ fontSize: 12 }} />} onClick={clearAll}
            sx={{ textTransform: "none", fontSize: "12px", color: "var(--color-text-secondary)" }}>
            Clear all
          </Button>
        )}
      </Box>

      {/* Loading */}
      {isLoading && Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={92} sx={{ mb: 1.5, borderRadius: "var(--border-radius-md)" }} />
      ))}

      {/* Notice list */}
      {!isLoading && notices.map((n) => {
        const pCfg = PRIORITY_CFG[n.priority];
        const catLabel = CATEGORIES.find((c) => c.value === n.category)?.label;
        return (
          <Box key={n._id} sx={{
            display: "flex",
            bgcolor: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-md)",
            mb: 1.5, overflow: "hidden",
            transition: "border-color 0.15s",
            "&:hover": { borderColor: "var(--color-border-secondary)" },
          }}>
            <Box sx={{ width: 4, flexShrink: 0, bgcolor: pCfg?.bar || "var(--color-border-tertiary)" }} />
            <Box sx={{ flex: 1, p: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap", mb: 0.5 }}>
                    <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>{n.title}</Typography>
                    {isNew(n.createdAt) && (
                      <Box component="span" sx={{ px: 0.75, py: 0.1, borderRadius: "4px", fontSize: "10px", fontWeight: 600, bgcolor: "var(--color-background-success)", color: "var(--color-text-success)" }}>New</Box>
                    )}
                    {pCfg && (
                      <Box component="span" sx={{ px: 0.75, py: 0.1, borderRadius: "4px", fontSize: "10px", fontWeight: 500, bgcolor: pCfg.bg, color: pCfg.color }}>{pCfg.label}</Box>
                    )}
                    {catLabel && catLabel !== "General" && (
                      <Box component="span" sx={{ px: 0.75, py: 0.1, borderRadius: "4px", fontSize: "10px", bgcolor: "var(--color-background-secondary)", color: "var(--color-text-secondary)", border: "0.5px solid var(--color-border-tertiary)" }}>{catLabel}</Box>
                    )}
                    {n.from === "municipality" && (
                      <Box component="span" sx={{ px: 0.75, py: 0.1, borderRadius: "4px", fontSize: "10px", fontWeight: 500, bgcolor: "var(--color-background-info)", color: "var(--color-text-info)" }}>Municipality</Box>
                    )}
                    {n.scope === "class" && (
                      <Box component="span" sx={{ px: 0.75, py: 0.1, borderRadius: "4px", fontSize: "10px", bgcolor: "#e3f2fd", color: "#1565c0" }}>Class</Box>
                    )}
                  </Box>
                  <Typography sx={{ fontSize: "13px", color: "var(--color-text-secondary)", mb: 0.75, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {n.body}
                  </Typography>
                  <Typography sx={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>
                    {n.authorId?.name || "Admin"} · {formatDate(n.createdAt)}
                  </Typography>
                </Box>
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => setDeleteTarget(n)} sx={{ color: "var(--color-text-danger)", ml: 1, mt: -0.25 }}>
                    <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        );
      })}

      {/* Empty */}
      {!isLoading && notices.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <CampaignOutlinedIcon sx={{ fontSize: 44, color: "var(--color-text-secondary)", opacity: 0.25, mb: 1.5 }} />
          <Typography sx={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
            {hasFilters ? "No notices match your filters" : "No notices yet"}
          </Typography>
          {hasFilters && <Button size="small" onClick={clearAll} sx={{ mt: 1.5, textTransform: "none" }}>Clear filters</Button>}
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
          <Typography sx={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
          </Typography>
          <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} size="small" shape="rounded" />
        </Box>
      )}

      {/* Create dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: "var(--border-radius-lg)" } }}>
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 500 }}>New Notice</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "12px !important" }}>
          <FormControl fullWidth size="small">
            <InputLabel>Scope</InputLabel>
            <Select value={form.scope} label="Scope" onChange={(e) => setForm({ ...form, scope: e.target.value })}>
              <MenuItem value="global">School-wide</MenuItem>
              <MenuItem value="class">Class-specific</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Title *" fullWidth value={form.title}
            onChange={(e) => { setForm({ ...form, title: e.target.value }); if (fieldErrors.title) setFieldErrors((p) => ({ ...p, title: "" })); }}
            error={!!fieldErrors.title} helperText={fieldErrors.title} />
          <TextField label="Content *" fullWidth multiline rows={3} value={form.body}
            onChange={(e) => { setForm({ ...form, body: e.target.value }); if (fieldErrors.body) setFieldErrors((p) => ({ ...p, body: "" })); }}
            error={!!fieldErrors.body} helperText={fieldErrors.body} />
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select value={form.category} label="Category" onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select value={form.priority} label="Priority" onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={creating} sx={{ textTransform: "none" }}>
            {creating ? "Publishing…" : "Publish Notice"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: "var(--border-radius-lg)" } }}>
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 500 }}>Delete Notice</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
            Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting} sx={{ textTransform: "none" }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
