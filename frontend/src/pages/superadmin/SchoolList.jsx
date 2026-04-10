import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  Skeleton,
  IconButton,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useGetSchoolsPaginatedQuery } from "@/store/api/schoolApi";

const STATUS_OPTIONS = [
  { value: "all", label: "All status" },
  { value: "active", label: "Active" },
  { value: "no_principal", label: "No principal" },
];

const PAGE_SIZE_OPTIONS = [12, 24, 48];

function getStatus(school) {
  if (!school.principalId)
    return {
      label: "No principal",
      color: "var(--color-text-warning)",
      bgcolor: "var(--color-background-warning)",
    };
  return {
    label: "Active",
    color: "var(--color-text-success)",
    bgcolor: "var(--color-background-success)",
  };
}

export default function SchoolList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [searchTimer, setSearchTimer] = useState(null);

  const { data, isLoading, isFetching } = useGetSchoolsPaginatedQuery({
    page,
    limit,
    search: debouncedSearch,
    status,
  });

  const schools = data?.schools || [];
  const pagination = data?.pagination || { page: 1, total: 0, totalPages: 1 };

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

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: "22px", fontWeight: 500 }}>
            Schools
          </Typography>
          <Typography
            sx={{
              fontSize: "13px",
              color: "var(--color-text-secondary)",
              mt: 0.5,
            }}
          >
            {pagination.total} school{pagination.total !== 1 ? "s" : ""} ·
            Lalitpur Metropolitan City
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          onClick={() => navigate("/superadmin/schools/add")}
        >
          + Add school
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, mb: 2, alignItems: "center" }}>
        <TextField
          size="small"
          placeholder="Search schools..."
          value={search}
          onChange={handleSearchChange}
          sx={{
            width: 240,
            "& .MuiInputBase-root": { fontSize: "13px", height: 36 },
          }}
        />
        <Select
          size="small"
          value={status}
          onChange={handleStatusChange}
          sx={{ minWidth: 140, fontSize: "13px", height: 36 }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <MenuItem
              key={opt.value}
              value={opt.value}
              sx={{ fontSize: "13px" }}
            >
              {opt.label}
            </MenuItem>
          ))}
        </Select>
        <Box sx={{ flex: 1 }} />
        <Select
          size="small"
          value={limit}
          onChange={(e) => {
            setLimit(e.target.value);
            setPage(1);
          }}
          sx={{ fontSize: "13px", height: 36, minWidth: 70 }}
        >
          {PAGE_SIZE_OPTIONS.map((n) => (
            <MenuItem key={n} value={n} sx={{ fontSize: "13px" }}>
              {n}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {isLoading ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 2,
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={170}
              sx={{ borderRadius: "var(--border-radius-lg)" }}
            />
          ))}
        </Box>
      ) : schools.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            bgcolor: "var(--color-background-primary)",
            borderRadius: "var(--border-radius-lg)",
            border: "0.5px solid var(--color-border-tertiary)",
          }}
        >
          <Typography
            sx={{
              fontSize: "15px",
              fontWeight: 500,
              mb: 0.5,
            }}
          >
            {debouncedSearch || status !== "all"
              ? "No schools match your filters"
              : "No schools registered yet"}
          </Typography>
          <Typography
            sx={{
              fontSize: "13px",
              color: "var(--color-text-secondary)",
              mb: 2,
            }}
          >
            {debouncedSearch || status !== "all"
              ? "Try adjusting your search or filters"
              : "Add your first school to get started"}
          </Typography>
          {!debouncedSearch && status === "all" && (
            <Button
              variant="contained"
              size="small"
              onClick={() => navigate("/superadmin/schools/add")}
            >
              + Add school
            </Button>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 2,
            opacity: isFetching ? 0.6 : 1,
            transition: "opacity 0.2s",
          }}
        >
          {schools.map((s) => {
            const stat = getStatus(s);
            const location = [
              s.district,
              s.municipality,
              s.ward ? `Ward ${s.ward}` : null,
            ]
              .filter(Boolean)
              .join(", ");
            return (
              <Box
                key={s._id}
                onClick={() => navigate(`/superadmin/schools/${s._id}`)}
                sx={{
                  bgcolor: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                  borderRadius: "var(--border-radius-lg)",
                  p: 2,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  transition: "border-color 0.15s",
                  "&:hover": {
                    borderColor: "var(--color-border-secondary)",
                  },
                }}
              >
                {/* Header: name + status */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 500,
                      lineHeight: 1.35,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {s.name}
                  </Typography>
                  <Box
                    component="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: 500,
                      bgcolor: stat.bgcolor,
                      color: stat.color,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {stat.label}
                  </Box>
                </Box>

                {/* Location */}
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.3,
                  }}
                >
                  {location || s.address || "—"}
                </Typography>

                {/* Stats row */}
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "11px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      Students
                    </Typography>
                    <Typography sx={{ fontSize: "15px", fontWeight: 500 }}>
                      {s.studentCount ?? "—"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "11px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      Teachers
                    </Typography>
                    <Typography sx={{ fontSize: "15px", fontWeight: 500 }}>
                      {s.teacherCount ?? "—"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "11px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      Level
                    </Typography>
                    <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                      {s.schoolLevel ? s.schoolLevel.split(" ")[0] : "—"}
                    </Typography>
                  </Box>
                </Box>

                {/* Principal */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    pt: 1,
                    borderTop: "0.5px solid var(--color-border-tertiary)",
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "11px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      Principal
                    </Typography>
                    <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                      {s.principalId?.name || "Not assigned"}
                    </Typography>
                  </Box>
                  {s.phone && (
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {s.phone}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 3,
          }}
        >
          <Typography
            sx={{ fontSize: "12px", color: "var(--color-text-secondary)" }}
          >
            Showing {(pagination.page - 1) * limit + 1}–
            {Math.min(pagination.page * limit, pagination.total)} of{" "}
            {pagination.total}
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
  );
}
