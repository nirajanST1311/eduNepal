import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Chip,
  MenuItem,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from "@mui/material";
import {
  useGetSchoolsQuery,
  useCreateSchoolMutation,
} from "@/store/api/schoolApi";

const STATUS_OPTIONS = [
  { value: "all", label: "All status" },
  { value: "active", label: "Active" },
  { value: "monitor", label: "Monitor" },
  { value: "at_risk", label: "At risk" },
  { value: "no_principal", label: "No principal" },
];
const TYPE_OPTIONS = [{ value: "all", label: "All types" }];

// Demo status logic for UI only
function getStatus(school) {
  if (school.name?.toLowerCase().includes("kopundol"))
    return { label: "At risk", color: "#dc2626" };
  if (
    school.name?.toLowerCase().includes("thaiba") ||
    school.name?.toLowerCase().includes("sainbu")
  )
    return { label: "Monitor", color: "#fbbf24" };
  if (school.name?.toLowerCase().includes("imadol"))
    return { label: "No principal", color: "#fbbf24" };
  return { label: "Active", color: "#22c55e" };
}

export default function SchoolList() {
  const navigate = useNavigate();
  const { data: schools = [] } = useGetSchoolsQuery();
  const [createSchool, { isLoading }] = useCreateSchoolMutation();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", phone: "" });

  // Filter logic (demo)
  const filtered = schools.filter((s) => {
    const stat = getStatus(s);
    return (
      s.name?.toLowerCase().includes(search.toLowerCase()) &&
      (status === "all" ||
        stat.label.replace(/ /g, "_").toLowerCase() === status)
    );
  });

  const handleCreate = async () => {
    await createSchool(form).unwrap();
    setOpen(false);
    setForm({ name: "", address: "", phone: "" });
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
          <Typography variant="h5" fontWeight={600}>
            Schools
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {schools.length} schools · Lalitpur Metropolitan City
          </Typography>
        </Box>
        <Button variant="contained" size="small" onClick={() => setOpen(true)}>
          + Add school
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search schools."
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
        <Select
          size="small"
          value={type}
          onChange={(e) => setType(e.target.value)}
          sx={{ minWidth: 120 }}
        >
          {TYPE_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Grid container spacing={2}>
        {filtered.map((s) => {
          const stat = getStatus(s);
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={s._id}>
              <Card
                variant="outlined"
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderColor: stat.color,
                }}
              >
                <CardContent sx={{ pb: 1.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      sx={{ fontSize: "1rem" }}
                    >
                      {s.name}
                    </Typography>
                    <Chip
                      label={stat.label}
                      size="small"
                      sx={{
                        bgcolor: stat.color + "22",
                        color: stat.color,
                        fontWeight: 600,
                        fontSize: "0.7rem",
                        height: 22,
                      }}
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 0.5, display: "block" }}
                  >
                    {s.address || "—"}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Teachers
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        —
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Students
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        —
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Attendance
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          color:
                            stat.label === "At risk"
                              ? "#dc2626"
                              : stat.label === "Monitor"
                                ? "#d97706"
                                : "#16a34a",
                        }}
                      >
                        —
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Content
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          color:
                            stat.label === "At risk"
                              ? "#dc2626"
                              : stat.label === "Monitor"
                                ? "#d97706"
                                : "#16a34a",
                        }}
                      >
                        —
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <Box sx={{ display: "flex", gap: 1, px: 2, pb: 1.5 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{ flex: 1 }}
                    onClick={() => navigate(`/superadmin/schools/${s._id}`)}
                  >
                    View
                  </Button>
                  {stat.label === "No principal" ? (
                    <Button
                      size="small"
                      variant="contained"
                      color="warning"
                      sx={{ flex: 1 }}
                    >
                      Assign principal
                    </Button>
                  ) : (
                    <Button size="small" variant="outlined" sx={{ flex: 1 }}>
                      Report
                    </Button>
                  )}
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add school</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
        >
          <TextField
            label="School name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <TextField
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={isLoading || !form.name}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
