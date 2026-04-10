import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  MenuItem,
  InputAdornment,
  Tooltip,
  Skeleton,
  Chip,
  FormControl,
  Select,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import { useSelector } from "react-redux";
import {
  useGetSubjectsQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} from "@/store/api/subjectApi";
import { useGetClassesQuery } from "@/store/api/classApi";
import { useGetUsersQuery } from "@/store/api/userApi";

const empty = { name: "", classId: "", teacherId: "" };

export default function AdminSubjects() {
  const { user } = useSelector((s) => s.auth);
  const { data: subjects = [], isLoading } = useGetSubjectsQuery({
    schoolId: user?.schoolId,
  });
  const { data: classes = [] } = useGetClassesQuery({
    schoolId: user?.schoolId,
  });
  const { data: teachers = [] } = useGetUsersQuery({
    role: "TEACHER",
    schoolId: user?.schoolId,
  });
  const [createSubject, { isLoading: creating }] = useCreateSubjectMutation();
  const [updateSubject, { isLoading: updating }] = useUpdateSubjectMutation();
  const [deleteSubject] = useDeleteSubjectMutation();

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [fieldErrors, setFieldErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    let list = subjects;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.teacherId?.name?.toLowerCase().includes(q),
      );
    }
    if (classFilter) {
      list = list.filter((s) => (s.classId?._id || s.classId) === classFilter);
    }
    return list;
  }, [subjects, search, classFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setFieldErrors({});
    setOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s._id);
    setForm({
      name: s.name,
      classId: s.classId?._id || "",
      teacherId: s.teacherId?._id || "",
    });
    setFieldErrors({});
    setOpen(true);
  };

  const handleSubmit = async () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Subject name is required";
    if (!form.classId) errs.classId = "Class is required";
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      if (editing) {
        await updateSubject({ id: editing, ...form }).unwrap();
      } else {
        await createSubject(form).unwrap();
      }
      setOpen(false);
      setForm(empty);
      setEditing(null);
    } catch {
      /* handled by RTK */
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSubject(deleteTarget._id).unwrap();
    } catch {
      /* handled by RTK */
    }
    setDeleteTarget(null);
  };

  const set = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (fieldErrors[field]) setFieldErrors((p) => ({ ...p, [field]: "" }));
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
          Subjects
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{ textTransform: "none" }}
        >
          Add Subject
        </Button>
      </Box>
      <Typography
        sx={{ fontSize: "13px", color: "var(--color-text-secondary)", mb: 3 }}
      >
        {subjects.length} subject{subjects.length !== 1 ? "s" : ""} across{" "}
        {classes.length} classes
      </Typography>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 2.5, flexWrap: "wrap" }}>
        <TextField
          placeholder="Search by subject or teacher…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ maxWidth: 320, width: "100%" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  sx={{
                    fontSize: 18,
                    color: "var(--color-text-secondary)",
                  }}
                />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">All Classes</MenuItem>
            {classes.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                Class {c.grade} {c.section}
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
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Subject</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Teacher</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {[1, 2, 3, 4].map((c) => (
                      <TableCell key={c}>
                        <Skeleton width={90} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : filtered.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell>
                      <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                        {s.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          s.classId
                            ? `${s.classId.grade} ${s.classId.section || ""}`
                            : "—"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {s.teacherId?.name ? (
                        <Typography sx={{ fontSize: "13px" }}>
                          {s.teacherId.name}
                        </Typography>
                      ) : (
                        <Typography
                          sx={{
                            fontSize: "12px",
                            color: "var(--color-text-warning)",
                            fontWeight: 500,
                          }}
                        >
                          Unassigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEdit(s)}>
                          <EditOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          sx={{ color: "var(--color-text-danger)" }}
                          onClick={() => setDeleteTarget(s)}
                        >
                          <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: "center", py: 4 }}>
                  <AutoStoriesOutlinedIcon
                    sx={{
                      fontSize: 32,
                      color: "var(--color-text-secondary)",
                      opacity: 0.3,
                      mb: 0.5,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "14px",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {search || classFilter
                      ? "No subjects match your filters"
                      : "No subjects created yet"}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Create / Edit Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 500 }}>
          {editing ? "Edit Subject" : "Add Subject"}
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
        >
          <TextField
            label="Subject Name"
            value={form.name}
            onChange={set("name")}
            error={!!fieldErrors.name}
            helperText={fieldErrors.name}
          />
          <TextField
            select
            label="Class"
            value={form.classId}
            onChange={set("classId")}
            error={!!fieldErrors.classId}
            helperText={fieldErrors.classId}
          >
            <MenuItem value="">Select class</MenuItem>
            {classes.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                Class {c.grade} {c.section}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Assign Teacher (optional)"
            value={form.teacherId}
            onChange={set("teacherId")}
          >
            <MenuItem value="">No teacher</MenuItem>
            {teachers.map((t) => (
              <MenuItem key={t._id} value={t._id}>
                {t.name}
              </MenuItem>
            ))}
          </TextField>
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
            onClick={handleSubmit}
            disabled={creating || updating}
            sx={{ textTransform: "none" }}
          >
            {creating || updating
              ? "Saving…"
              : editing
                ? "Save Changes"
                : "Create Subject"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 500, pb: 0.5 }}>
          Delete Subject
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
            Are you sure you want to delete{" "}
            <strong>{deleteTarget?.name}</strong>? All chapters and assignments
            for this subject will also be affected.
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
            variant="contained"
            color="error"
            onClick={handleDelete}
            sx={{ textTransform: "none" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
