import { useState, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CampaignIcon from "@mui/icons-material/Campaign";
import { useGetNoticesPaginatedQuery } from "@/store/api/noticeApi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const PAGE_SIZE = 20;

export default function StudentNotices() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

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

  const isNew = (d) =>
    Date.now() - new Date(d).getTime() < 2 * 24 * 3600 * 1000;

  const formatDate = (dateStr) => {
    const d = dayjs(dateStr);
    const now = dayjs();
    if (now.diff(d, "hour") < 24) return d.fromNow();
    if (now.diff(d, "day") < 7) return d.format("ddd, h:mm A");
    return d.format("MMM D, YYYY");
  };

  const renderNotice = (n) => (
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
          {isNew(n.createdAt) && (
            <Box
              component="span"
              sx={{
                px: 0.75,
                py: 0.15,
                borderRadius: "4px",
                fontSize: "10px",
                fontWeight: 500,
                bgcolor: "var(--color-background-success)",
                color: "var(--color-text-success)",
              }}
            >
              New
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
                bgcolor: "var(--color-background-danger)",
                color: "var(--color-text-danger)",
              }}
            >
              Important
            </Box>
          )}
        </Box>
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
        {n.from === "municipality" ? "Municipality" : "School"} ·{" "}
        {formatDate(n.createdAt)}
      </Typography>
    </Box>
  );

  return (
    <Box>
      <Typography sx={{ fontSize: "22px", fontWeight: 500, mb: 0.5 }}>
        Notices
      </Typography>
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

      {/* Loading */}
      {isLoading &&
        Array.from({ length: 3 }).map((_, i) => (
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
        ))}

      {/* Notices */}
      {!isLoading && notices.map(renderNotice)}

      {/* Empty State */}
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
    </Box>
  );
}
