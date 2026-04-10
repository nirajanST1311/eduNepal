import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  Grid,
  Skeleton,
} from "@mui/material";
import { useGetSchoolsQuery } from "@/store/api/schoolApi";

const STATUS_OPTIONS = [
  { value: "all", label: "All status" },
  { value: "active", label: "Active" },
  { value: "no_principal", label: "No principal" },
];

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
  const { data: schools = [], isLoading } = useGetSchoolsQuery();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = schools.filter((s) => {
    const stat = getStatus(s);
    return (
      s.name?.toLowerCase().includes(search.toLowerCase()) &&
      (status === "all" ||
        stat.label.replace(/ /g, "_").toLowerCase() === status)
    );
  });

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
            {schools.length} schools · Lalitpur Metropolitan City
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

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search schools..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 220 }}
        />
        <Select
          size="small"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{ minWidth: 140 }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {isLoading ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Skeleton
                variant="rounded"
                height={180}
                sx={{ borderRadius: "var(--border-radius-lg)" }}
              />
            </Grid>
          ))}
        </Grid>
      ) : filtered.length === 0 ? (
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
            {search || status !== "all"
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
            {search || status !== "all"
              ? "Try adjusting your search or filters"
              : "Add your first school to get started"}
          </Typography>
          {!search && status === "all" && (
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
        <Grid container spacing={2}>
          {filtered.map((s) => {
            const stat = getStatus(s);
            const location = [s.district, s.municipality]
              .filter(Boolean)
              .join(", ");
            return (
              <Grid key={s._id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Box
                  sx={{
                    bgcolor: "var(--color-background-primary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                    borderRadius: "var(--border-radius-lg)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ p: 2, pb: 1.5 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
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
                        }}
                      >
                        {stat.label}
                      </Box>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "var(--color-text-secondary)",
                        mb: 1,
                      }}
                    >
                      {location || "—"}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2, mb: 0.5 }}>
                      <Box>
                        <Typography
                          sx={{
                            fontSize: "12px",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          Principal
                        </Typography>
                        <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                          {s.principalId?.name || "—"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            fontSize: "12px",
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
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, px: 2, pb: 1.5 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ flex: 1 }}
                      onClick={() => navigate(`/superadmin/schools/${s._id}`)}
                    >
                      View
                    </Button>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
