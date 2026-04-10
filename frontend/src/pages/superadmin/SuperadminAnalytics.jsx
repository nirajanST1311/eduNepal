import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Skeleton,
  IconButton,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";
import { useGetSuperadminAnalyticsQuery } from "@/store/api/dashboardApi";

const pctColor = (v) => {
  if (v >= 80) return "var(--color-text-success)";
  if (v >= 60) return "var(--color-text-warning)";
  return "var(--color-text-danger)";
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function SuperadminAnalytics() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchTimer, setSearchTimer] = useState(null);

  const { data, isLoading, isFetching } = useGetSuperadminAnalyticsQuery({
    page,
    limit,
    search: debouncedSearch,
    sortBy,
    sortOrder,
  });

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (searchTimer) clearTimeout(searchTimer);
    setSearchTimer(
      setTimeout(() => {
        setDebouncedSearch(val);
        setPage(1);
      }, 400),
    );
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? (
      <ArrowUpward sx={{ fontSize: 14, ml: 0.5 }} />
    ) : (
      <ArrowDownward sx={{ fontSize: 14, ml: 0.5 }} />
    );
  };

  const summary = data?.summary;
  const schools = data?.schools || [];
  const pagination = data?.pagination || { page: 1, total: 0, totalPages: 1 };
  const topPerforming = data?.topPerforming || [];
  const needingIntervention = data?.needingIntervention || [];
  const globalCounts = data?.globalCounts || {};

  const statCards = [
    {
      label: "Avg content\ncoverage",
      value: summary ? `${summary.avgContentCoverage}%` : "—",
    },
    {
      label: "Avg\nattendance",
      value: summary ? `${summary.avgAttendance}%` : "—",
    },
    {
      label: "Assignment\nsubmission",
      value: summary ? `${summary.assignmentSubmission}%` : "—",
    },
    {
      label: "At-risk\nstudents",
      value: summary ? String(summary.atRiskStudents) : "—",
    },
  ];

  return (
    <Box>
      <Typography sx={{ fontSize: "22px", fontWeight: 500 }}>
        Analytics
      </Typography>
      <Typography
        sx={{ fontSize: "13px", color: "var(--color-text-secondary)", mb: 3 }}
      >
        Municipality-wide · {globalCounts.totalSchools || 0} schools ·{" "}
        {globalCounts.totalStudents || 0} students ·{" "}
        {globalCounts.totalTeachers || 0} teachers
      </Typography>

      {/* Stat cards */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        {statCards.map((s) => (
          <Box
            key={s.label}
            sx={{
              bgcolor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: "var(--border-radius-lg)",
              py: 1.5,
              px: 2,
              flex: 1,
              minWidth: 0,
            }}
          >
            <Typography
              sx={{
                fontSize: "12px",
                color: "var(--color-text-secondary)",
                whiteSpace: "pre-line",
                lineHeight: 1.4,
              }}
            >
              {s.label}
            </Typography>
            {isLoading ? (
              <Skeleton width={60} height={28} />
            ) : (
              <Typography sx={{ fontSize: "22px", fontWeight: 500, mt: 0.5 }}>
                {s.value}
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      {/* School-by-school comparison */}
      <Box
        sx={{
          bgcolor: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          p: 3,
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
            School-by-school comparison
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            <TextField
              size="small"
              placeholder="Search schools…"
              value={search}
              onChange={handleSearchChange}
              sx={{
                width: 220,
                "& .MuiInputBase-root": { fontSize: "13px", height: 34 },
              }}
            />
            <Select
              size="small"
              value={limit}
              onChange={(e) => {
                setLimit(e.target.value);
                setPage(1);
              }}
              sx={{ fontSize: "13px", height: 34, minWidth: 70 }}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <MenuItem key={n} value={n} sx={{ fontSize: "13px" }}>
                  {n}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Box>

        {/* Header */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "2.5fr 0.8fr 1fr 1fr 1fr",
            py: 1,
            borderBottom: "0.5px solid var(--color-border-tertiary)",
          }}
        >
          {[
            { label: "School", field: "name", align: "left" },
            { label: "Students", field: "students", align: "center" },
            { label: "Attendance", field: "attendance", align: "center" },
            { label: "Content", field: "content", align: "center" },
            { label: "Submissions", field: "submission", align: "center" },
          ].map((col) => (
            <Typography
              key={col.field}
              onClick={() => handleSort(col.field)}
              sx={{
                fontSize: "12px",
                color: "var(--color-text-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent:
                  col.align === "center" ? "center" : "flex-start",
                userSelect: "none",
                "&:hover": { color: "var(--color-text-primary)" },
              }}
            >
              {col.label}
              <SortIcon field={col.field} />
            </Typography>
          ))}
        </Box>

        {/* Rows */}
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Box
              key={i}
              sx={{
                display: "grid",
                gridTemplateColumns: "2.5fr 0.8fr 1fr 1fr 1fr",
                py: 1.5,
                borderBottom: "0.5px solid var(--color-border-tertiary)",
              }}
            >
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton
                  key={j}
                  width={j === 0 ? "70%" : "40%"}
                  height={18}
                  sx={{ mx: j === 0 ? 0 : "auto" }}
                />
              ))}
            </Box>
          ))
        ) : schools.length === 0 ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography
              sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
            >
              {debouncedSearch
                ? "No schools matching your search"
                : "No school data available"}
            </Typography>
          </Box>
        ) : (
          schools.map((row) => (
            <Box
              key={row._id}
              sx={{
                display: "grid",
                gridTemplateColumns: "2.5fr 0.8fr 1fr 1fr 1fr",
                py: 1.5,
                borderBottom: "0.5px solid var(--color-border-tertiary)",
                alignItems: "center",
                opacity: isFetching ? 0.6 : 1,
                transition: "opacity 0.2s",
              }}
            >
              <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                {row.name}
              </Typography>
              <Typography sx={{ fontSize: "13px" }} textAlign="center">
                {row.students}
              </Typography>
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: pctColor(row.attendance),
                }}
                textAlign="center"
              >
                {row.attendance}%
              </Typography>
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: pctColor(row.content),
                }}
                textAlign="center"
              >
                {row.content}%
              </Typography>
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: pctColor(row.submission),
                }}
                textAlign="center"
              >
                {row.submission}%
              </Typography>
            </Box>
          ))
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              pt: 2,
            }}
          >
            <Typography
              sx={{ fontSize: "12px", color: "var(--color-text-secondary)" }}
            >
              Showing {(pagination.page - 1) * limit + 1}–
              {Math.min(pagination.page * limit, pagination.total)} of{" "}
              {pagination.total} schools
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <IconButton
                size="small"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft fontSize="small" />
              </IconButton>
              {Array.from(
                { length: Math.min(pagination.totalPages, 5) },
                (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <Box
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      sx={{
                        width: 28,
                        height: 28,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "var(--border-radius-sm)",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontWeight: page === pageNum ? 600 : 400,
                        bgcolor:
                          page === pageNum
                            ? "var(--color-background-tertiary)"
                            : "transparent",
                        color:
                          page === pageNum
                            ? "var(--color-text-primary)"
                            : "var(--color-text-secondary)",
                        "&:hover": {
                          bgcolor: "var(--color-background-tertiary)",
                        },
                      }}
                    >
                      {pageNum}
                    </Box>
                  );
                },
              )}
              <IconButton
                size="small"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        )}
      </Box>

      {/* Bottom two cards */}
      <Box sx={{ display: "flex", gap: 2 }}>
        {/* Top performing */}
        <Box
          sx={{
            bgcolor: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
            p: 3,
            flex: 1,
          }}
        >
          <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 2 }}>
            Top performing schools
          </Typography>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Box key={i} sx={{ py: 1.5 }}>
                <Skeleton width="60%" height={18} />
                <Skeleton width="40%" height={14} sx={{ mt: 0.5 }} />
              </Box>
            ))
          ) : topPerforming.length === 0 ? (
            <Typography
              sx={{ fontSize: "12px", color: "var(--color-text-secondary)" }}
            >
              No data yet
            </Typography>
          ) : (
            topPerforming.map((s, i) => (
              <Box
                key={s._id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  py: 1.5,
                  borderBottom:
                    i < topPerforming.length - 1
                      ? "0.5px solid var(--color-border-tertiary)"
                      : "none",
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                    {s.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {s.attendance}% attendance · {s.content}% content
                  </Typography>
                </Box>
                <Box
                  component="span"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: 500,
                    bgcolor:
                      i === 0
                        ? "var(--color-background-warning)"
                        : i === 1
                          ? "var(--color-background-tertiary)"
                          : "var(--color-background-warning)",
                    color:
                      i === 0
                        ? "var(--color-text-warning)"
                        : i === 1
                          ? "var(--color-text-primary)"
                          : "var(--color-text-warning)",
                  }}
                >
                  {`No.${i + 1}`}
                </Box>
              </Box>
            ))
          )}
        </Box>

        {/* Schools needing intervention */}
        <Box
          sx={{
            bgcolor: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
            p: 3,
            flex: 1,
          }}
        >
          <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 2 }}>
            Schools needing intervention
          </Typography>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Box key={i} sx={{ py: 1.5 }}>
                <Skeleton width="60%" height={18} />
                <Skeleton width="40%" height={14} sx={{ mt: 0.5 }} />
              </Box>
            ))
          ) : needingIntervention.length === 0 ? (
            <Typography
              sx={{ fontSize: "12px", color: "var(--color-text-secondary)" }}
            >
              No data yet
            </Typography>
          ) : (
            needingIntervention.map((s, i) => {
              const issue =
                s.attendance < 60
                  ? `${s.attendance}% attendance (30-day avg)`
                  : s.content < 40
                    ? `Only ${s.content}% content uploaded`
                    : `${s.content}% content · ${s.attendance}% attendance`;
              return (
                <Box
                  key={s._id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    py: 1.5,
                    borderBottom:
                      i < needingIntervention.length - 1
                        ? "0.5px solid var(--color-border-tertiary)"
                        : "none",
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                      {s.name}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {issue}
                    </Typography>
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: 500,
                      border: "0.5px solid var(--color-border-tertiary)",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    Contact
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      </Box>
    </Box>
  );
}
