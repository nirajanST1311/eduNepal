import { useState, useCallback, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Skeleton,
  Pagination,
  Button,
  Tabs,
  Tab,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import { useGetNoticesPaginatedQuery } from "@/store/api/noticeApi";
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

export default function StudentNotices() {
  const { user } = useSelector((s) => s.auth);
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const debounceRef = useRef(null);
  const handleSearch = useCallback((val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(val); setPage(1); }, 400);
  }, []);

  const scope = tab === 0 ? "global" : "class";
  const queryParams = {
    page, limit: PAGE_SIZE, scope,
    search: debouncedSearch || undefined,
    priority: priorityFilter || undefined,
    category: categoryFilter || undefined,
    ...(tab === 1 && user?.classId ? { classId: user.classId } : {}),
  };

  const { data, isLoading } = useGetNoticesPaginatedQuery(queryParams);

  const notices = useMemo(() => data?.notices || [], [data]);
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const newCount = useMemo(() => notices.filter((n) => isNew(n.createdAt)).length, [notices]);
  const hasFilters = !!(debouncedSearch || priorityFilter || categoryFilter);

  const clearAll = () => {
    setSearch(""); setDebouncedSearch("");
    setPriorityFilter(""); setCategoryFilter(""); setPage(1);
  };

  return (
    <Box>
      {/* Header */}
      <Typography sx={{ fontSize: "22px", fontWeight: 500, mb: 0.5 }}>Notices</Typography>
      <Typography sx={{ fontSize: "13px", color: "var(--color-text-secondary)", mb: 2.5 }}>
        {total} notice{total !== 1 ? "s" : ""}
        {newCount > 0 && (
          <Box component="span" sx={{ ml: 1, px: 0.75, py: 0.15, borderRadius: "4px", fontSize: "11px", fontWeight: 600, bgcolor: "var(--color-background-success)", color: "var(--color-text-success)" }}>
            {newCount} new today
          </Box>
        )}
      </Typography>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => { setTab(v); setPage(1); clearAll(); }}
        sx={{
          mb: 2,
          "& .MuiTabs-indicator": { height: 2 },
          "& .MuiTab-root": { textTransform: "none", fontSize: "13px", minWidth: 0, px: 2, py: 1 },
        }}
      >
        <Tab icon={<SchoolOutlinedIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="School" />
        <Tab icon={<GroupsOutlinedIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="My Class" />
      </Tabs>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center", mb: 2 }}>
        <TextField
          placeholder="Search notices…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          size="small"
          sx={{ width: 210 }}
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

      {/* Notices */}
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
              </Box>
              <Typography sx={{ fontSize: "13px", color: "var(--color-text-secondary)", mb: 0.75, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {n.body}
              </Typography>
              <Typography sx={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>
                {n.from === "municipality" ? "Municipality" : (n.authorId?.name || "School")} · {formatDate(n.createdAt)}
              </Typography>
            </Box>
          </Box>
        );
      })}

      {/* Empty */}
      {!isLoading && notices.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <CampaignOutlinedIcon sx={{ fontSize: 44, color: "var(--color-text-secondary)", opacity: 0.25, mb: 1.5 }} />
          <Typography sx={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
            {hasFilters ? "No notices match your filters" : tab === 0 ? "No school notices yet" : "No class notices yet"}
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
    </Box>
  );
}
