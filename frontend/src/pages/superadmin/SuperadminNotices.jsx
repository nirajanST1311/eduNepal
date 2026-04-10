import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  Divider,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CampaignIcon from "@mui/icons-material/Campaign";
import FilterListIcon from "@mui/icons-material/FilterList";
import {
  useGetNoticesPaginatedQuery,
  useDeleteNoticeMutation,
} from "@/store/api/noticeApi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "general", label: "General" },
  { value: "urgent", label: "Urgent" },
  { value: "holiday", label: "Holiday" },
  { value: "exam_schedule", label: "Exam Schedule" },
  { value: "event", label: "Event" },
];

const CATEGORY_COLORS = {
  general: {
    bg: "var(--color-background-info)",
    text: "var(--color-text-info)",
    border: "var(--color-border-info)",
  },
  urgent: {
    bg: "var(--color-background-danger)",
    text: "var(--color-text-danger)",
    border: "var(--color-border-danger)",
  },
  holiday: {
    bg: "var(--color-background-success)",
    text: "var(--color-text-success)",
    border: "var(--color-border-success)",
  },
  exam_schedule: {
    bg: "var(--color-background-warning)",
    text: "var(--color-text-warning)",
    border: "var(--color-border-warning)",
  },
  event: {
    bg: "var(--color-background-info)",
    text: "var(--color-text-info)",
    border: "var(--color-border-info)",
  },
};

const PRIORITY_COLORS = {
  low: {
    bg: "var(--color-background-success)",
    text: "var(--color-text-success)",
  },
  medium: {
    bg: "var(--color-background-warning)",
    text: "var(--color-text-warning)",
  },
  high: {
    bg: "var(--color-background-danger)",
    text: "var(--color-text-danger)",
  },
};

const PAGE_SIZE = 20;

export default function SuperadminNotices() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailNotice, setDetailNotice] = useState(null);

  const [deleteNotice, { isLoading: deleting }] = useDeleteNoticeMutation();

  // Debounce search
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

  const { data, isLoading, isFetching } = useGetNoticesPaginatedQuery({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    category: categoryFilter || undefined,
  });

  const notices = data?.notices || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

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

  const getCategoryChip = (category) => {
    const c = CATEGORY_COLORS[category] || CATEGORY_COLORS.general;
    const label =
      CATEGORIES.find((cat) => cat.value === category)?.label || category;
    return (
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          px: 1,
          py: 0.25,
          borderRadius: "4px",
          fontSize: "11px",
          fontWeight: 500,
          bgcolor: c.bg,
          color: c.text,
          border: `0.5px solid ${c.border}`,
        }}
      >
        {label}
      </Box>
    );
  };

  const getPriorityDot = (priority) => {
    const c = PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium;
    return (
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          fontSize: "12px",
          color: c.text,
          fontWeight: 500,
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: c.text,
          }}
        />
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Box>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 0.5,
        }}
      >
        <Typography sx={{ fontSize: "22px", fontWeight: 500 }}>
          Notices
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/superadmin/notices/create")}
          sx={{
            textTransform: "none",
          }}
        >
          Create Notice
        </Button>
      </Box>
      <Typography
        sx={{ fontSize: "13px", color: "var(--color-text-secondary)", mb: 3 }}
      >
        {total} notice{total !== 1 ? "s" : ""} · Broadcast to all or specific
        schools
      </Typography>

      {/* Search & Filters */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 2.5, flexWrap: "wrap" }}>
        <TextField
          placeholder="Search by title or content…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 280, flex: 1, maxWidth: 400 }}
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
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            displayEmpty
            startAdornment={
              <FilterListIcon
                sx={{
                  fontSize: 16,
                  color: "var(--color-text-secondary)",
                  mr: 0.5,
                }}
              />
            }
          >
            {CATEGORIES.map((c) => (
              <MenuItem key={c.value} value={c.value}>
                {c.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <Box
        sx={{
          bgcolor: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: "12px",
                    color: "var(--color-text-secondary)",
                    width: "35%",
                  }}
                >
                  TITLE
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: "12px",
                    color: "var(--color-text-secondary)",
                    width: "15%",
                  }}
                >
                  CATEGORY
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: "12px",
                    color: "var(--color-text-secondary)",
                    width: "12%",
                  }}
                >
                  PRIORITY
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: "12px",
                    color: "var(--color-text-secondary)",
                    width: "15%",
                  }}
                >
                  AUDIENCE
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: "12px",
                    color: "var(--color-text-secondary)",
                    width: "13%",
                  }}
                >
                  DATE
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: "12px",
                    color: "var(--color-text-secondary)",
                    width: "10%",
                    textAlign: "right",
                  }}
                >
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <Box
                          sx={{
                            height: 16,
                            borderRadius: 1,
                            bgcolor: "var(--color-background-secondary)",
                            animation: "pulse 1.5s infinite",
                            "@keyframes pulse": {
                              "0%, 100%": { opacity: 0.4 },
                              "50%": { opacity: 1 },
                            },
                          }}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : notices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: "center", py: 6 }}>
                    <CampaignIcon
                      sx={{
                        fontSize: 40,
                        color: "var(--color-text-secondary)",
                        opacity: 0.4,
                        mb: 1,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: "14px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {debouncedSearch || categoryFilter
                        ? "No notices match your filters"
                        : "No notices sent yet"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                notices.map((n) => (
                  <TableRow
                    key={n._id}
                    hover
                    sx={{
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: "var(--color-background-secondary)",
                      },
                    }}
                    onClick={() => setDetailNotice(n)}
                  >
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 500,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {n.title}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "12px",
                              color: "var(--color-text-secondary)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: 320,
                            }}
                          >
                            {n.body}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{getCategoryChip(n.category)}</TableCell>
                    <TableCell>
                      {getPriorityDot(n.priority || "medium")}
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "13px" }}>
                        {n.from === "municipality" && (
                          <Box
                            component="span"
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              px: 0.75,
                              py: 0.15,
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: 500,
                              bgcolor: "var(--color-background-info)",
                              color: "var(--color-text-info)",
                              border: "0.5px solid var(--color-border-info)",
                              mr: 0.5,
                            }}
                          >
                            Municipality
                          </Box>
                        )}
                        {n.targetAudience ||
                          (n.schoolId?.name ? n.schoolId.name : "All schools")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontSize: "12px",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        {formatDate(n.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: "right" }}>
                      <Tooltip title="View details">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailNotice(n);
                          }}
                        >
                          <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(n);
                          }}
                          sx={{ color: "var(--color-text-danger)" }}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2,
              py: 1.5,
              borderTop: "1px solid var(--color-border-tertiary)",
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
      </Box>

      {/* Delete Confirmation Dialog */}
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
            <strong>{deleteTarget?.title}</strong>? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            sx={{
              textTransform: "none",
              color: "text.primary",
            }}
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

      {/* Detail Drawer */}
      <Drawer
        anchor="right"
        open={!!detailNotice}
        onClose={() => setDetailNotice(null)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 420 },
            bgcolor: "var(--color-background-primary)",
          },
        }}
      >
        {detailNotice && (
          <Box
            sx={{
              p: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              {getCategoryChip(detailNotice.category)}
              {getPriorityDot(detailNotice.priority || "medium")}
            </Box>

            <Typography sx={{ fontSize: "18px", fontWeight: 500, mb: 1 }}>
              {detailNotice.title}
            </Typography>

            <Typography
              sx={{
                fontSize: "13px",
                color: "var(--color-text-secondary)",
                mb: 3,
                whiteSpace: "pre-wrap",
                lineHeight: 1.6,
              }}
            >
              {detailNotice.body}
            </Typography>

            <Divider sx={{ mb: 2 }} />

            {/* Meta */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <InfoRow
                label="Date"
                value={dayjs(detailNotice.createdAt).format(
                  "MMM D, YYYY · h:mm A",
                )}
              />
              <InfoRow
                label="Source"
                value={
                  detailNotice.from === "municipality"
                    ? "Municipality"
                    : "School"
                }
              />
              <InfoRow
                label="Audience"
                value={
                  detailNotice.targetAudience ||
                  (detailNotice.schoolId?.name
                    ? detailNotice.schoolId.name
                    : "All schools")
                }
              />
              {detailNotice.authorId && (
                <InfoRow
                  label="Author"
                  value={`${detailNotice.authorId.name || "Unknown"} (${detailNotice.authorId.role || ""})`}
                />
              )}
            </Box>

            {/* Bottom Action */}
            <Box sx={{ mt: "auto", pt: 3, display: "flex", gap: 1.5 }}>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                onClick={() => {
                  setDeleteTarget(detailNotice);
                  setDetailNotice(null);
                }}
                sx={{ textTransform: "none" }}
              >
                Delete
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setDetailNotice(null)}
                sx={{
                  textTransform: "none",
                  color: "text.primary",
                  borderColor: "divider",
                }}
              >
                Close
              </Button>
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}

function InfoRow({ label, value }) {
  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      <Typography
        sx={{
          fontSize: "12px",
          color: "var(--color-text-secondary)",
          minWidth: 80,
          fontWeight: 500,
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontSize: "13px" }}>{value}</Typography>
    </Box>
  );
}
