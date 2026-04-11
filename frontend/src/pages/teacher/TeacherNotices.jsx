import { useState, useCallback, useMemo, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Skeleton,
  Pagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Tabs,
  Tab,
  IconButton,
  Divider,
  Alert,
  Checkbox,
  ListItemText as MuiListItemText,
  OutlinedInput,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import {
  useGetNoticesPaginatedQuery,
  useCreateNoticeMutation,
  useUpdateNoticeMutation,
  useDeleteNoticeMutation,
} from "@/store/api/noticeApi";
import { useGetClassesQuery } from "@/store/api/classApi";
import { useSelector } from "react-redux";
import dayjs from "dayjs";

/* ─── constants ─── */
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

const PAGE_SIZE = 15;
const EMPTY_FORM = { title: "", body: "", category: "general", priority: "medium", classIds: [] };

function fmt(d) {
  const m = dayjs(d);
  const diff = dayjs().diff(m, "hour");
  if (diff < 1) return "Just now";
  if (diff < 24) return `${diff}h ago`;
  if (diff < 48) return "Yesterday";
  return m.format("MMM D, YYYY");
}
function isNew(d) { return Date.now() - new Date(d).getTime() < 24 * 3600 * 1000; }

/* ─── Filter label ─── */
function FLabel({ children }) {
  return (
    <Typography sx={{
      fontSize: "11px", fontWeight: 600, color: "var(--color-text-secondary)",
      textTransform: "uppercase", letterSpacing: "0.05em", alignSelf: "center",
      whiteSpace: "nowrap",
    }}>
      {children}
    </Typography>
  );
}

/* ─── Notice card ─── */
function NoticeCard({ n, onEdit, onDelete }) {
  const pCfg = PRIORITY_CFG[n.priority];
  const cat = CATEGORIES.find((c) => c.value === n.category);

  // Support both classIds array and legacy single classId
  const classLabels = useMemo(() => {
    const ids = n.classIds?.length ? n.classIds : (n.classId ? [n.classId] : []);
    return ids
      .filter(Boolean)
      .map((c) => (c?.grade ? `Grade ${c.grade}${c.section || ""}` : null))
      .filter(Boolean);
  }, [n.classIds, n.classId]);

  return (
    <Box sx={{
      display: "flex", bgcolor: "var(--color-background-primary)",
      border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: "var(--border-radius-md)", mb: 1.5, overflow: "hidden",
      transition: "border-color 0.15s",
      "&:hover": { borderColor: "var(--color-border-secondary)" },
    }}>
      <Box sx={{ width: 4, flexShrink: 0, bgcolor: pCfg?.bar || "var(--color-border-tertiary)" }} />
      <Box sx={{ flex: 1, p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          <Box sx={{
            width: 32, height: 32, borderRadius: "var(--border-radius-md)",
            bgcolor: "var(--color-background-warning)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <CampaignOutlinedIcon sx={{ fontSize: 16, color: "var(--color-text-warning)" }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap", mb: 0.5 }}>
              <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>{n.title}</Typography>
              {isNew(n.createdAt) && (
                <Box component="span" sx={{ px: 0.75, py: 0.1, borderRadius: "4px", fontSize: "10px", fontWeight: 600, bgcolor: "var(--color-background-success)", color: "var(--color-text-success)" }}>New</Box>
              )}
              {pCfg && (
                <Box component="span" sx={{ px: 0.75, py: 0.1, borderRadius: "4px", fontSize: "10px", fontWeight: 500, bgcolor: pCfg.bg, color: pCfg.color }}>{pCfg.label}</Box>
              )}
              {cat && cat.value !== "general" && (
                <Box component="span" sx={{ px: 0.75, py: 0.1, borderRadius: "4px", fontSize: "10px", bgcolor: "var(--color-background-secondary)", color: "var(--color-text-secondary)", border: "0.5px solid var(--color-border-tertiary)" }}>
                  {cat.label}
                </Box>
              )}
              {n.from === "municipality" && (
                <Box component="span" sx={{ px: 0.75, py: 0.1, borderRadius: "4px", fontSize: "10px", fontWeight: 500, bgcolor: "var(--color-background-info)", color: "var(--color-text-info)" }}>Municipality</Box>
              )}
              {classLabels.map((label) => (
                <Box key={label} component="span" sx={{ px: 0.75, py: 0.1, borderRadius: "4px", fontSize: "10px", bgcolor: "#e3f2fd", color: "#1565c0" }}>{label}</Box>
              ))}
            </Box>
            <Typography sx={{ fontSize: "13px", color: "var(--color-text-secondary)", mb: 0.75, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {n.body}
            </Typography>
            <Typography sx={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>
              {n.authorId?.name && `${n.authorId.name} · `}{fmt(n.createdAt)}
            </Typography>
          </Box>
          {/* Actions: only for own notices */}
          {(onEdit || onDelete) && (
            <Box sx={{ display: "flex", gap: 0.25, mt: -0.5, flexShrink: 0 }}>
              {onEdit && (
                <IconButton size="small" onClick={() => onEdit(n)} sx={{ color: "var(--color-text-secondary)" }}>
                  <EditOutlinedIcon sx={{ fontSize: 15 }} />
                </IconButton>
              )}
              {onDelete && (
                <IconButton size="small" onClick={() => onDelete(n)} sx={{ color: "var(--color-text-danger)" }}>
                  <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                </IconButton>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

/* ─── Main component ─── */
export default function TeacherNotices() {
  const { user } = useSelector((s) => s.auth);
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [classFilter, setClassFilter] = useState(""); // My Class tab only

  const [openForm, setOpenForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");

  const [createNotice, { isLoading: creating }] = useCreateNoticeMutation();
  const [updateNotice, { isLoading: updating }] = useUpdateNoticeMutation();
  const [deleteNotice] = useDeleteNoticeMutation();

  /* ─── teacher's classes ─── */
  const { data: classData } = useGetClassesQuery({ schoolId: user?.schoolId });
  const teacherClasses = useMemo(
    () => (classData || []).filter((c) => (user?.classIds || []).map(String).includes(String(c._id))),
    [classData, user?.classIds],
  );

  /* ─── debounced search ─── */
  const debounceRef = useRef(null);
  const handleSearchChange = useCallback((val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(val); setPage(1); }, 350);
  }, []);

  /* ─── query ─── */
  const scope = tab === 0 ? "global" : "class";
  const queryParams = {
    page, limit: PAGE_SIZE, scope,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(categoryFilter && { category: categoryFilter }),
    ...(priorityFilter && { priority: priorityFilter }),
    ...(tab === 1 && classFilter && { classId: classFilter }),
  };
  const { data, isLoading } = useGetNoticesPaginatedQuery(queryParams);
  const { data: schoolTotals } = useGetNoticesPaginatedQuery({ scope: "global", page: 1, limit: 1 });
  const { data: classTotals } = useGetNoticesPaginatedQuery({ scope: "class", page: 1, limit: 1 });
  const schoolCount = schoolTotals?.total ?? 0;
  const classCount = classTotals?.total ?? 0;
  const notices = useMemo(() => data?.notices || [], [data]);
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const newCount = useMemo(() => notices.filter((n) => isNew(n.createdAt)).length, [notices]);
  const hasFilters = !!(debouncedSearch || priorityFilter || categoryFilter || (tab === 1 && classFilter));

  /* ─── helpers ─── */
  const clearAll = () => {
    setSearch(""); setDebouncedSearch("");
    setPriorityFilter(""); setCategoryFilter(""); setClassFilter(""); setPage(1);
  };

  const handleTabChange = (_, v) => {
    setTab(v); setPage(1);
    setSearch(""); setDebouncedSearch("");
    setPriorityFilter(""); setCategoryFilter(""); setClassFilter("");
  };

  const openCreate = () => {
    setEditTarget(null);
    const defaultClassIds = teacherClasses.length === 1 ? [teacherClasses[0]._id] : [];
    setForm({ ...EMPTY_FORM, classIds: defaultClassIds });
    setFieldErrors({});
    setFormError("");
    setOpenForm(true);
  };

  const openEdit = (n) => {
    setEditTarget(n);
    // Recover classIds: prefer classIds array, fall back to single classId
    const existingClassIds = n.classIds?.length
      ? n.classIds.map((c) => c._id || c)
      : n.classId ? [n.classId?._id || n.classId] : [];
    setForm({
      title: n.title,
      body: n.body,
      category: n.category || "general",
      priority: n.priority || "medium",
      classIds: existingClassIds,
    });
    setFieldErrors({});
    setFormError("");
    setOpenForm(true);
  };

  const handleSave = async () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.body.trim()) errs.body = "Content is required";
    if (!form.classIds?.length) errs.classIds = "Select at least one class";
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      if (editTarget) {
        await updateNotice({
          id: editTarget._id,
          title: form.title,
          body: form.body,
          category: form.category,
          priority: form.priority,
          classIds: form.classIds,
        }).unwrap();
      } else {
        await createNotice({
          title: form.title,
          body: form.body,
          category: form.category,
          priority: form.priority,
          scope: "class",
          classIds: form.classIds,
          schoolId: user?.schoolId,
        }).unwrap();
      }
      setOpenForm(false);
    } catch (err) {
      const msg = err?.data?.message || "Failed to save notice. Please try again.";
      setFormError(msg);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteNotice(deleteTarget._id);
    setDeleteTarget(null);
  };

  const isOwn = (n) => String(n.authorId?._id || n.authorId) === String(user?._id);

  /* ─── render ─── */
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
        <Box>
          <Typography sx={{ fontSize: "22px", fontWeight: 500 }}>Notices</Typography>
          <Typography sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
            {total} notice{total !== 1 ? "s" : ""}
            {newCount > 0 && (
              <Box component="span" sx={{ ml: 1, px: 0.75, py: 0.15, borderRadius: "4px", fontSize: "11px", fontWeight: 600, bgcolor: "var(--color-background-success)", color: "var(--color-text-success)" }}>
                {newCount} new today
              </Box>
            )}
          </Typography>
        </Box>
        {tab === 1 && (
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={openCreate}
            sx={{ textTransform: "none", fontSize: "13px" }}>
            New Notice
          </Button>
        )}
      </Box>

      {/* Tabs */}
      <Tabs value={tab} onChange={handleTabChange} sx={{
        mt: 2, mb: 0,
        "& .MuiTabs-indicator": { height: 2 },
        "& .MuiTab-root": { textTransform: "none", fontSize: "13px", minWidth: 0, px: 2.5, py: 1 },
      }}>
        <Tab
          icon={<SchoolOutlinedIcon sx={{ fontSize: 16 }} />}
          iconPosition="start"
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              School
              {schoolCount > 0 && (
                <Box component="span" sx={{ px: 0.75, py: 0.1, borderRadius: "10px", fontSize: "10px", fontWeight: 600, bgcolor: tab === 0 ? "var(--color-primary)" : "var(--color-background-secondary)", color: tab === 0 ? "#fff" : "var(--color-text-secondary)", minWidth: 18, textAlign: "center" }}>
                  {schoolCount}
                </Box>
              )}
            </Box>
          }
        />
        <Tab
          icon={<GroupsOutlinedIcon sx={{ fontSize: 16 }} />}
          iconPosition="start"
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              My Class
              {classCount > 0 && (
                <Box component="span" sx={{ px: 0.75, py: 0.1, borderRadius: "10px", fontSize: "10px", fontWeight: 600, bgcolor: tab === 1 ? "var(--color-primary)" : "var(--color-background-secondary)", color: tab === 1 ? "#fff" : "var(--color-text-secondary)", minWidth: 18, textAlign: "center" }}>
                  {classCount}
                </Box>
              )}
            </Box>
          }
        />
      </Tabs>
      <Divider sx={{ mb: 2 }} />

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", alignItems: "center", mb: 2 }}>
        {/* Search */}
        <TextField placeholder="Search notices…" value={search}
          onChange={(e) => handleSearchChange(e.target.value)} size="small" sx={{ width: 195 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 15, color: "var(--color-text-secondary)" }} /></InputAdornment>,
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => handleSearchChange("")} sx={{ p: 0.25 }}>
                  <CloseIcon sx={{ fontSize: 13 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />

        {/* Class filter — My Class tab, only when teacher has multiple classes */}
        {tab === 1 && teacherClasses.length > 1 && (
          <>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            <FLabel>Class</FLabel>
            {teacherClasses.map((c) => {
              const active = classFilter === c._id;
              return (
                <Chip key={c._id} label={`${c.grade}${c.section || ""}`} size="small"
                  onClick={() => { setClassFilter(active ? "" : c._id); setPage(1); }}
                  onDelete={active ? () => { setClassFilter(""); setPage(1); } : undefined}
                  sx={{
                    fontWeight: active ? 600 : 400,
                    bgcolor: active ? "var(--color-primary)" : "transparent",
                    color: active ? "#fff" : "var(--color-text-secondary)",
                    border: `0.5px solid ${active ? "var(--color-primary)" : "var(--color-border-tertiary)"}`,
                    "& .MuiChip-deleteIcon": { color: "#fff", fontSize: 13 },
                  }}
                />
              );
            })}
          </>
        )}

        {/* Priority */}
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <FLabel>Priority</FLabel>
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
                "& .MuiChip-deleteIcon": { color: cfg.color, fontSize: 13 },
              }}
            />
          );
        })}

        {/* Category */}
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <FLabel>Category</FLabel>
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

        {/* Clear all */}
        {hasFilters && (
          <>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            <Button size="small" startIcon={<CloseIcon sx={{ fontSize: 12 }} />} onClick={clearAll}
              sx={{ textTransform: "none", fontSize: "12px", color: "var(--color-text-secondary)" }}>
              Clear all
            </Button>
          </>
        )}
      </Box>

      {/* Loading */}
      {isLoading && Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={92} sx={{ mb: 1.5, borderRadius: "var(--border-radius-md)" }} />
      ))}

      {/* Notices */}
      {!isLoading && notices.map((n) => (
        <NoticeCard
          key={n._id}
          n={n}
          onEdit={isOwn(n) ? openEdit : undefined}
          onDelete={isOwn(n) ? setDeleteTarget : undefined}
        />
      ))}

      {/* Empty state */}
      {!isLoading && notices.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <CampaignOutlinedIcon sx={{ fontSize: 44, color: "var(--color-text-secondary)", opacity: 0.25, mb: 1.5 }} />
          <Typography sx={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
            {hasFilters
              ? "No notices match your filters"
              : tab === 0
              ? "No school notices yet"
              : "No class notices yet"}
          </Typography>
          {hasFilters && (
            <Button size="small" onClick={clearAll} sx={{ mt: 1.5, textTransform: "none" }}>
              Clear filters
            </Button>
          )}
          {tab === 1 && !hasFilters && (
            <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={openCreate}
              sx={{ mt: 2, textTransform: "none" }}>
              Add first notice
            </Button>
          )}
        </Box>
      )}

      {/* Pagination */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2, minHeight: 36 }}>
        <Typography sx={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
          {total > 0
            ? `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total}`
            : ""}
        </Typography>
        {totalPages > 1 && (
          <Pagination count={totalPages} page={page} onChange={(_, v) => { setPage(v); window.scrollTo({ top: 0, behavior: "smooth" }); }} size="small" shape="rounded" />
        )}
      </Box>

      {/* ── Create / Edit dialog ── */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: "var(--border-radius-lg)" } }}>
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 500 }}>
          {editTarget ? "Edit Notice" : "New Class Notice"}
          {!editTarget && (
            <Typography component="span" sx={{ fontSize: "12px", fontWeight: 400, color: "var(--color-text-secondary)", ml: 1 }}>
              visible to selected classes only
            </Typography>
          )}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "12px !important" }}>
          {/* Class multi-select */}
          <FormControl fullWidth size="small" error={!!fieldErrors.classIds}>
            <InputLabel>Classes *</InputLabel>
            <Select
              multiple
              value={form.classIds}
              label="Classes *"
              input={<OutlinedInput label="Classes *" />}
              onChange={(e) => {
                setForm((f) => ({ ...f, classIds: e.target.value }));
                if (fieldErrors.classIds) setFieldErrors((p) => ({ ...p, classIds: "" }));
              }}
              renderValue={(selected) =>
                selected
                  .map((id) => {
                    const c = teacherClasses.find((c) => c._id === id);
                    return c ? `Grade ${c.grade}${c.section || ""}` : id;
                  })
                  .join(", ")
              }
            >
              {teacherClasses.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  <Checkbox size="small" checked={form.classIds.includes(c._id)} />
                  <MuiListItemText primary={`Grade ${c.grade} ${c.section || ""}`} />
                </MenuItem>
              ))}
            </Select>
            {fieldErrors.classIds && (
              <Typography sx={{ fontSize: "12px", color: "error.main", mt: 0.5, ml: 1.75 }}>{fieldErrors.classIds}</Typography>
            )}
          </FormControl>

          <TextField label="Title *" fullWidth value={form.title}
            onChange={(e) => { setForm((f) => ({ ...f, title: e.target.value })); if (fieldErrors.title) setFieldErrors((p) => ({ ...p, title: "" })); }}
            error={!!fieldErrors.title} helperText={fieldErrors.title} />

          <TextField label="Content *" fullWidth multiline rows={4} value={form.body}
            onChange={(e) => { setForm((f) => ({ ...f, body: e.target.value })); if (fieldErrors.body) setFieldErrors((p) => ({ ...p, body: "" })); }}
            error={!!fieldErrors.body} helperText={fieldErrors.body} />

          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select value={form.category} label="Category"
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map((c) => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select value={form.priority} label="Priority"
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Box>

        </DialogContent>
        {formError && (
          <Alert severity="error" sx={{ mx: 3, mb: 1, fontSize: "13px" }}>{formError}</Alert>
        )}
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenForm(false)} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={creating || updating}
            sx={{ textTransform: "none" }}>
            {(creating || updating) ? "Saving…" : editTarget ? "Save Changes" : "Publish Notice"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete confirm ── */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 500 }}>Delete notice?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "13px" }}>&ldquo;{deleteTarget?.title}&rdquo; will be permanently removed.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} sx={{ textTransform: "none" }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
