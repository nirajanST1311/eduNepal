import { useState, useCallback } from "react";
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
  Pagination,
  IconButton,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/Add";
import CampaignIcon from "@mui/icons-material/Campaign";
import {
  useGetNoticesPaginatedQuery,
  useCreateNoticeMutation,
  useDeleteNoticeMutation,
} from "@/store/api/noticeApi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const PAGE_SIZE = 20;

const PRIORITY_CHIP = {
  high: {
    bg: "var(--color-background-danger)",
    color: "var(--color-text-danger)",
    label: "High",
  },
  medium: {
    bg: "var(--color-background-warning)",
    color: "var(--color-text-warning)",
    label: "Medium",
  },
  normal: {
    bg: "var(--color-background-info)",
    color: "var(--color-text-info)",
    label: "Normal",
  },
};

export default function AdminNotices() {
  const { user } = useSelector((s) => s.auth);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ title: "", body: "", priority: "normal" });
  const [fieldErrors, setFieldErrors] = useState({});

  const [createNotice, { isLoading: creating }] = useCreateNoticeMutation();
  const [deleteNotice, { isLoading: deleting }] = useDeleteNoticeMutation();

  const debounceRef = useState(null);
  const handleSearch = useCallback(
    (val) => {
      setSearch(val);
      clearTimeout(debounceRef[0]);
      debounceRef[0] = setTimeout(() => {
        setDebouncedSearch(val);
        setPage(1);
      }, 400);
    },
    [debounceRef],
  );

  const { data, isLoading } = useGetNoticesPaginatedQuery({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  const notices = data?.notices || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const handleCreate = async () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.body.trim()) errs.body = "Content is required";
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      await createNotice({ ...form, schoolId: user?.schoolId }).unwrap();
      setOpen(false);
      setForm({ title: "", body: "", priority: "normal" });
      setFieldErrors({});
    } catch {
      /* handled by RTK */
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteNotice(deleteTarget._id).unwrap();
    } catch {
      /* handled by RTK */
    }
    setDeleteTarget(null);
  };

  const formatDate = (dateStr) => {
    const d = dayjs(dateStr);
    const now = dayjs();
    if (now.diff(d, "hour") < 24) return d.fromNow();
    if (now.diff(d, "day") < 7) return d.format("ddd, h:mm A");
    return d.format("MMM D, YYYY");
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 0.5,
        }}
      >
        <Typography sx={{ fontSize: "22px", fontWeight: 500 }}>
          Notices
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          sx={{
            textTransform: "none",
          }}
        >
          New Notice
        </Button>
      </Box>
      <Typography
        sx={{ fontSize: "13px", color: "var(--color-text-secondary)", mb: 3 }}
      >
        {total} notice{total !== 1 ? "s" : ""}
      </Typography>

      {/* Search */}
      <TextField
        placeholder="Search notices…"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        size="small"
        sx={{ mb: 2.5, maxWidth: 360, width: "100%" }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon
                sx={{ fontSize: 18, color: "var(--color-text-secondary)" }}
              />
            </InputAdornment>
          ),
        }}
      />

      {/* Notice List */}
      {isLoading
        ? Array.from({ length: 3 }).map((_, i) => (
            <Box
              key={i}
              sx={{
                bgcolor: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: "var(--border-radius-lg)",
                p: 2,
                mb: "14px",
                height: 72,
                animation: "pulse 1.5s infinite",
                "@keyframes pulse": {
                  "0%, 100%": { opacity: 0.4 },
                  "50%": { opacity: 1 },
                },
              }}
            />
          ))
        : notices.map((n) => {
            const p = PRIORITY_CHIP[n.priority] || PRIORITY_CHIP.normal;
            return (
              <Box
                key={n._id}
                sx={{
                  bgcolor: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                  borderRadius: "var(--border-radius-lg)",
                  p: 2,
                  mb: "14px",
                  "&:hover": { borderColor: "var(--color-border-secondary)" },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 0.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
                      {n.title}
                    </Typography>
                    {n.from === "municipality" && (
                      <Box
                        component="span"
                        sx={{
                          px: 0.75,
                          py: 0.15,
                          borderRadius: "4px",
                          fontSize: "10px",
                          fontWeight: 500,
                          bgcolor: "var(--color-background-info)",
                          color: "var(--color-text-info)",
                          border: "0.5px solid var(--color-border-info)",
                        }}
                      >
                        Municipality
                      </Box>
                    )}
                    {n.priority === "high" && (
                      <Box
                        component="span"
                        sx={{
                          px: 0.75,
                          py: 0.15,
                          borderRadius: "4px",
                          fontSize: "10px",
                          fontWeight: 500,
                          bgcolor: p.bg,
                          color: p.color,
                        }}
                      >
                        {p.label}
                      </Box>
                    )}
                  </Box>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => setDeleteTarget(n)}
                      sx={{ color: "var(--color-text-danger)" }}
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
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
                  {formatDate(n.createdAt)}
                </Typography>
              </Box>
            );
          })}

      {!isLoading && notices.length === 0 && (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CampaignIcon
            sx={{
              fontSize: 40,
              color: "var(--color-text-secondary)",
              opacity: 0.4,
              mb: 1,
            }}
          />
          <Typography
            sx={{ fontSize: "14px", color: "var(--color-text-secondary)" }}
          >
            {debouncedSearch
              ? "No notices match your search"
              : "No notices yet"}
          </Typography>
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: 2,
          }}
        >
          <Typography
            sx={{ fontSize: "12px", color: "var(--color-text-secondary)" }}
          >
            Showing {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, total)} of {total}
          </Typography>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, v) => setPage(v)}
            size="small"
            shape="rounded"
          />
        </Box>
      )}

      {/* Create Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "var(--border-radius-lg)",
            border: "0.5px solid var(--color-border-tertiary)",
          },
        }}
      >
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 500 }}>
          New Notice
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
        >
          <TextField
            label="Title"
            value={form.title}
            onChange={(e) => {
              setForm({ ...form, title: e.target.value });
              if (fieldErrors.title)
                setFieldErrors((p) => ({ ...p, title: "" }));
            }}
            error={!!fieldErrors.title}
            helperText={fieldErrors.title}
            fullWidth
          />
          <TextField
            label="Content"
            multiline
            rows={3}
            value={form.body}
            onChange={(e) => {
              setForm({ ...form, body: e.target.value });
              if (fieldErrors.body) setFieldErrors((p) => ({ ...p, body: "" }));
            }}
            error={!!fieldErrors.body}
            helperText={fieldErrors.body}
            fullWidth
          />
          <FormControl fullWidth>
            <Select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              size="small"
            >
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setOpen(false)}
            sx={{ textTransform: "none", color: "text.primary" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={creating}
            sx={{
              textTransform: "none",
            }}
          >
            {creating ? "Publishing…" : "Publish"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "var(--border-radius-lg)",
            border: "0.5px solid var(--color-border-tertiary)",
          },
        }}
      >
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 500, pb: 0.5 }}>
          Delete Notice
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
            Are you sure you want to delete{" "}
            <strong>{deleteTarget?.title}</strong>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            sx={{ textTransform: "none", color: "text.primary" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleting}
            variant="contained"
            color="error"
            sx={{ textTransform: "none" }}
          >
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
