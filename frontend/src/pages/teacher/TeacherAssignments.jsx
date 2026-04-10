import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Chip,
  Skeleton,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import GradingOutlinedIcon from "@mui/icons-material/GradingOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { useNavigate } from "react-router-dom";
import { useGetAssignmentsQuery } from "@/store/api/assignmentApi";
import dayjs from "dayjs";

export default function TeacherAssignments() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const { data: assignments = [], isLoading } = useGetAssignmentsQuery({});
  const navigate = useNavigate();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuTarget, setMenuTarget] = useState(null);

  const filtered = useMemo(() => {
    let list = assignments;
    if (tab === 1)
      list = list.filter(
        (a) => a.submissionCount > a.gradedCount && a.status === "published",
      );
    else if (tab === 2) list = list.filter((a) => a.status === "draft");
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.title?.toLowerCase().includes(q) ||
          a.subjectId?.name?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [assignments, tab, search]);

  const pendingCount = assignments.filter(
    (a) => a.submissionCount > a.gradedCount && a.status === "published",
  ).length;
  const draftCount = assignments.filter((a) => a.status === "draft").length;

  const openMenu = (e, a) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuTarget(a);
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuTarget(null);
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
          Assignments
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/teacher/assignments/create")}
          sx={{ textTransform: "none" }}
        >
          New Assignment
        </Button>
      </Box>
      <Typography
        sx={{ fontSize: "13px", color: "var(--color-text-secondary)", mb: 3 }}
      >
        {assignments.length} assignment{assignments.length !== 1 ? "s" : ""}{" "}
        total
      </Typography>

      {/* Tabs + Search */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="All" />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                Pending review
                {pendingCount > 0 && (
                  <Chip
                    label={pendingCount}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: "11px",
                      bgcolor: "var(--color-background-warning)",
                      color: "var(--color-text-warning)",
                    }}
                  />
                )}
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                Drafts
                {draftCount > 0 && (
                  <Chip
                    label={draftCount}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: "11px",
                      bgcolor: "var(--color-background-secondary)",
                      color: "var(--color-text-secondary)",
                    }}
                  />
                )}
              </Box>
            }
          />
        </Tabs>
        <TextField
          placeholder="Search assignments…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ maxWidth: 280, width: "100%" }}
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
      </Box>

      {/* Showing count */}
      {(search || tab > 0) && (
        <Typography
          sx={{
            fontSize: "12px",
            color: "var(--color-text-secondary)",
            mb: 1.5,
          }}
        >
          Showing {filtered.length} of {assignments.length}
        </Typography>
      )}

      {/* List */}
      {isLoading &&
        Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            height={72}
            sx={{ mb: 1, borderRadius: "var(--border-radius-md)" }}
          />
        ))}

      {!isLoading &&
        filtered.map((a) => {
          const due = dayjs(a.dueDate);
          const isOverdue =
            a.status === "published" && due.isBefore(dayjs(), "day");
          const isToday = due.isSame(dayjs(), "day");
          const ungradedCount = (a.submissionCount || 0) - (a.gradedCount || 0);
          return (
            <Box
              key={a._id}
              sx={{
                bgcolor: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: "var(--border-radius-md)",
                mb: 1,
                py: 1.5,
                px: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
                cursor: "pointer",
                "&:hover": { bgcolor: "var(--color-background-secondary)" },
              }}
              onClick={() =>
                a.submissionCount > 0
                  ? navigate(`/teacher/assignments/${a._id}/grade`)
                  : null
              }
            >
              {/* Left: status dot + info */}
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  flexShrink: 0,
                  bgcolor:
                    a.status === "draft"
                      ? "var(--color-text-secondary)"
                      : ungradedCount > 0
                        ? "var(--color-text-warning)"
                        : "var(--color-text-success)",
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: "13px", fontWeight: 500 }} noWrap>
                  {a.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {a.classId?.grade
                    ? `Class ${a.classId.grade}${a.classId.section || ""}`
                    : ""}{" "}
                  · {a.subjectId?.name || ""}{" "}
                  {a.dueDate ? `· Due ${due.format("MMM D")}` : ""}
                </Typography>
              </Box>

              {/* Middle: submission stats */}
              <Box sx={{ textAlign: "center", minWidth: 80 }}>
                <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                  {a.gradedCount || 0}/{a.submissionCount || 0}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "11px",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  graded
                </Typography>
              </Box>

              {/* Right: status + actions */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {a.status === "draft" && (
                  <Chip
                    label="Draft"
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: "11px",
                      bgcolor: "var(--color-background-secondary)",
                      color: "var(--color-text-secondary)",
                    }}
                  />
                )}
                {isOverdue && (
                  <Chip
                    label="Overdue"
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: "11px",
                      bgcolor: "var(--color-background-danger)",
                      color: "var(--color-text-danger)",
                    }}
                  />
                )}
                {isToday && a.status === "published" && (
                  <Chip
                    label="Due today"
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: "11px",
                      bgcolor: "var(--color-background-warning)",
                      color: "var(--color-text-warning)",
                    }}
                  />
                )}
                {ungradedCount > 0 && a.status === "published" && (
                  <Tooltip title="Grade submissions">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/teacher/assignments/${a._id}/grade`);
                      }}
                    >
                      <GradingOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                )}
                <IconButton size="small" onClick={(e) => openMenu(e, a)}>
                  <MoreVertIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </Box>
          );
        })}

      {!isLoading && filtered.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 6,
          }}
        >
          <Typography
            sx={{ fontSize: "14px", color: "var(--color-text-secondary)" }}
          >
            {search || tab > 0
              ? "No assignments match your filters"
              : "No assignments yet"}
          </Typography>
          {!search && tab === 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => navigate("/teacher/assignments/create")}
              sx={{ mt: 1.5, textTransform: "none" }}
            >
              Create your first assignment
            </Button>
          )}
        </Box>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={!!menuAnchor}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {menuTarget?.submissionCount > 0 && (
          <MenuItem
            onClick={() => {
              navigate(`/teacher/assignments/${menuTarget._id}/grade`);
              closeMenu();
            }}
            sx={{ fontSize: "13px" }}
          >
            <GradingOutlinedIcon sx={{ fontSize: 16, mr: 1.5 }} />
            Grade
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            // Future: edit assignment
            closeMenu();
          }}
          sx={{ fontSize: "13px" }}
        >
          <EditOutlinedIcon sx={{ fontSize: 16, mr: 1.5 }} />
          Edit
        </MenuItem>
      </Menu>
    </Box>
  );
}
