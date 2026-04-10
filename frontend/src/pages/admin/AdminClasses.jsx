import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Skeleton,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import { useSelector } from "react-redux";
import {
  useGetClassesQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
} from "@/store/api/classApi";
import { useGetSubjectsQuery } from "@/store/api/subjectApi";
import { useGetUsersQuery } from "@/store/api/userApi";

const card = {
  bgcolor: "var(--color-background-primary)",
  border: "0.5px solid var(--color-border-tertiary)",
  borderRadius: "var(--border-radius-lg)",
  p: 2.5,
  "&:hover": { borderColor: "var(--color-border-secondary)" },
};

export default function AdminClasses() {
  const { user } = useSelector((s) => s.auth);
  const { data: classes = [], isLoading } = useGetClassesQuery({
    schoolId: user?.schoolId,
  });
  const { data: subjects = [] } = useGetSubjectsQuery({
    schoolId: user?.schoolId,
  });
  const { data: students = [] } = useGetUsersQuery({
    role: "STUDENT",
    schoolId: user?.schoolId,
  });
  const [createClass, { isLoading: creating }] = useCreateClassMutation();
  const [updateClass, { isLoading: updating }] = useUpdateClassMutation();
  const [deleteClass] = useDeleteClassMutation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    grade: "",
    section: "A",
    academicYear: new Date().getFullYear().toString(),
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const countStudents = (classId) =>
    students.filter((s) => s.classId?._id === classId).length;
  const getSubjects = (classId) =>
    subjects.filter((s) => s.classId?._id === classId || s.classId === classId);

  const openCreate = () => {
    setEditing(null);
    setForm({
      grade: "",
      section: "A",
      academicYear: new Date().getFullYear().toString(),
    });
    setFieldErrors({});
    setOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c._id);
    setForm({
      grade: c.grade?.toString() || "",
      section: c.section || "A",
      academicYear: c.academicYear || "",
    });
    setFieldErrors({});
    setOpen(true);
  };

  const handleSubmit = async () => {
    const errs = {};
    if (!form.grade) errs.grade = "Grade is required";
    if (!form.academicYear) errs.academicYear = "Academic year is required";
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      if (editing) {
        await updateClass({
          id: editing,
          ...form,
          grade: Number(form.grade),
        }).unwrap();
      } else {
        await createClass({
          ...form,
          grade: Number(form.grade),
          schoolId: user?.schoolId,
        }).unwrap();
      }
      setOpen(false);
      setEditing(null);
    } catch {
      /* handled by RTK */
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteClass(deleteTarget._id).unwrap();
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
          Classes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{ textTransform: "none" }}
        >
          Add Class
        </Button>
      </Box>
      <Typography
        sx={{ fontSize: "13px", color: "var(--color-text-secondary)", mb: 3 }}
      >
        {classes.length} class{classes.length !== 1 ? "es" : ""} ·{" "}
        {students.length} total students
      </Typography>

      {/* Cards Grid */}
      {isLoading ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "14px",
          }}
        >
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={160}
              sx={{ borderRadius: "var(--border-radius-lg)" }}
            />
          ))}
        </Box>
      ) : classes.length === 0 ? (
        <Box
          sx={{
            ...card,
            textAlign: "center",
            py: 6,
            cursor: "default",
            "&:hover": { borderColor: "var(--color-border-tertiary)" },
          }}
        >
          <Typography
            sx={{
              fontSize: "14px",
              color: "var(--color-text-secondary)",
              mb: 1,
            }}
          >
            No classes created yet
          </Typography>
          <Button size="small" variant="outlined" onClick={openCreate}>
            Create your first class
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "14px",
          }}
        >
          {classes.map((c) => {
            const studentCount = countStudents(c._id);
            const classSubjects = getSubjects(c._id);
            return (
              <Box key={c._id} sx={card}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "18px",
                        fontWeight: 500,
                        lineHeight: 1.2,
                      }}
                    >
                      Class {c.grade}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      Section {c.section} · {c.academicYear}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(c)}>
                        <EditOutlinedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        sx={{ color: "var(--color-text-danger)" }}
                        onClick={() => setDeleteTarget(c)}
                      >
                        <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 3, mb: 2 }}>
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                  >
                    <PeopleOutlinedIcon
                      sx={{
                        fontSize: 15,
                        color: "var(--color-text-secondary)",
                      }}
                    />
                    <Typography sx={{ fontSize: "13px" }}>
                      {studentCount} student{studentCount !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                  >
                    <MenuBookOutlinedIcon
                      sx={{
                        fontSize: 15,
                        color: "var(--color-text-secondary)",
                      }}
                    />
                    <Typography sx={{ fontSize: "13px" }}>
                      {classSubjects.length} subject
                      {classSubjects.length !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                </Box>

                {classSubjects.length > 0 && (
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    {classSubjects.slice(0, 4).map((s) => (
                      <Chip key={s._id} label={s.name} size="small" />
                    ))}
                    {classSubjects.length > 4 && (
                      <Chip
                        label={`+${classSubjects.length - 4}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      )}

      {/* Create / Edit Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 500 }}>
          {editing ? "Edit Class" : "Add Class"}
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
        >
          <TextField
            label="Grade"
            type="number"
            value={form.grade}
            onChange={set("grade")}
            error={!!fieldErrors.grade}
            helperText={fieldErrors.grade}
          />
          <TextField
            label="Section"
            value={form.section}
            onChange={set("section")}
          />
          <TextField
            label="Academic Year"
            value={form.academicYear}
            onChange={set("academicYear")}
            error={!!fieldErrors.academicYear}
            helperText={fieldErrors.academicYear}
          />
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
                : "Create Class"}
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
          Delete Class
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
            Are you sure you want to delete{" "}
            <strong>
              Class {deleteTarget?.grade} {deleteTarget?.section}
            </strong>
            ? This will not remove the students but they will be unassigned.
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
