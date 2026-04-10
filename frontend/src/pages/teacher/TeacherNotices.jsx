import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Skeleton,
  Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import { useGetNoticesPaginatedQuery } from "@/store/api/noticeApi";
import dayjs from "dayjs";

const categories = [
  { label: "All", value: "" },
  { label: "General", value: "general" },
  { label: "Academic", value: "academic" },
  { label: "Event", value: "event" },
  { label: "Holiday", value: "holiday" },
  { label: "Exam", value: "exam" },
];

export default function TeacherNotices() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const limit = 10;

  const { data, isLoading } = useGetNoticesPaginatedQuery({
    page,
    limit,
    ...(search && { search }),
    ...(category && { category }),
  });

  const notices = data?.notices || [];
  const totalPages = data?.totalPages || 1;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 0.5 }}>
        <Typography sx={{ fontSize: "22px", fontWeight: 500 }}>
          Notices
        </Typography>
      </Box>
      <Typography
        sx={{ fontSize: "13px", color: "var(--color-text-secondary)", mb: 3 }}
      >
        School and municipality announcements
      </Typography>

      {/* Search + Category Filters */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 2.5, flexWrap: "wrap" }}>
        <TextField
          placeholder="Search notices…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          size="small"
          sx={{ maxWidth: 320, width: "100%" }}
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
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          {categories.map((c) => (
            <Chip
              key={c.value}
              label={c.label}
              size="small"
              onClick={() => {
                setCategory(c.value);
                setPage(1);
              }}
              sx={{
                fontWeight: category === c.value ? 500 : 400,
                bgcolor:
                  category === c.value
                    ? "var(--color-background-info)"
                    : "transparent",
                color:
                  category === c.value
                    ? "var(--color-text-info)"
                    : "var(--color-text-secondary)",
                border:
                  category === c.value
                    ? "none"
                    : "0.5px solid var(--color-border-tertiary)",
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Loading */}
      {isLoading &&
        Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            height={80}
            sx={{ mb: 1.5, borderRadius: "var(--border-radius-md)" }}
          />
        ))}

      {/* Notices List */}
      {!isLoading &&
        notices.map((n, i) => {
          const isNew = dayjs().diff(dayjs(n.createdAt), "day") <= 2;
          return (
            <Box
              key={n._id}
              sx={{
                bgcolor: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: "var(--border-radius-md)",
                mb: 1.5,
                p: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "var(--border-radius-md)",
                    bgcolor: "var(--color-background-warning)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    mt: 0.25,
                  }}
                >
                  <CampaignOutlinedIcon
                    sx={{ fontSize: 18, color: "var(--color-text-warning)" }}
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
                      {n.title}
                    </Typography>
                    {isNew && (
                      <Chip
                        label="New"
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: "10px",
                          bgcolor: "var(--color-background-success)",
                          color: "var(--color-text-success)",
                        }}
                      />
                    )}
                    {n.category && (
                      <Chip
                        label={n.category}
                        size="small"
                        variant="outlined"
                        sx={{ height: 18, fontSize: "10px" }}
                      />
                    )}
                  </Box>
                  {n.content && (
                    <Typography
                      sx={{
                        fontSize: "13px",
                        color: "var(--color-text-secondary)",
                        mb: 0.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {n.content}
                    </Typography>
                  )}
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {dayjs(n.createdAt).format("MMM D, YYYY")} ·{" "}
                    {n.authorId?.name || "Admin"}{" "}
                    {n.from === "municipality" && "· Municipality"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        })}

      {/* Empty State */}
      {!isLoading && notices.length === 0 && (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography
            sx={{ fontSize: "14px", color: "var(--color-text-secondary)" }}
          >
            {search || category
              ? "No notices match your filters"
              : "No notices yet"}
          </Typography>
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => setPage(p)}
            size="small"
          />
        </Box>
      )}
    </Box>
  );
}
