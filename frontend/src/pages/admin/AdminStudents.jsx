import { useState } from "react";
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
} from "@mui/material";
import { Edit, PersonOff } from "@mui/icons-material";
import { useSelector } from "react-redux";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeactivateUserMutation,
} from "@/store/api/userApi";
import { useGetClassesQuery } from "@/store/api/classApi";

const empty = {
  name: "",
  email: "",
  phone: "",
  password: "",
  rollNumber: "",
  classId: "",
  section: "",
};

export default function AdminStudents() {
  const { user } = useSelector((s) => s.auth);
  const { data: students = [], isLoading } = useGetUsersQuery({
    role: "STUDENT",
    schoolId: user?.schoolId,
  });
  const { data: classes = [] } = useGetClassesQuery({
    schoolId: user?.schoolId,
  });
  const [createUser, { isLoading: creating }] = useCreateUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();
  const [deactivateUser] = useDeactivateUserMutation();

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const filtered = students.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s._id);
    setForm({
      name: s.name,
      email: s.email,
      phone: s.phone || "",
      rollNumber: s.rollNumber || "",
      classId: s.classId?._id || "",
      section: s.section || "",
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (editing) {
      await updateUser({ id: editing, ...form }).unwrap();
    } else {
      await createUser({
        ...form,
        role: "STUDENT",
        schoolId: user?.schoolId,
      }).unwrap();
    }
    setOpen(false);
    setForm(empty);
    setEditing(null);
  };

  const handleDeactivate = async (id) => {
    await deactivateUser(id).unwrap();
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: "14px",
        }}
      >
        <Typography sx={{ fontSize: "22px", fontWeight: 500 }}>
          Students
        </Typography>
        <Button size="small" onClick={openCreate}>
          Add student
        </Button>
      </Box>
      <TextField
        size="small"
        placeholder="Search students…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: "14px", width: 260 }}
      />
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
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Roll #</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((s) => (
              <TableRow key={s._id}>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.email}</TableCell>
                <TableCell>{s.rollNumber || "—"}</TableCell>
                <TableCell>
                  {s.classId
                    ? `${s.classId.grade} ${s.classId.section || ""}`
                    : "—"}
                </TableCell>
                <TableCell>{s.phone || "—"}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(s)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeactivate(s._id)}
                  >
                    <PersonOff fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography
                    sx={{
                      fontSize: "13px",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    No students found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{editing ? "Edit student" : "Add student"}</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
        >
          <TextField label="Name" value={form.name} onChange={set("name")} />
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={set("email")}
          />
          <TextField
            label="Roll Number"
            value={form.rollNumber}
            onChange={set("rollNumber")}
          />
          <TextField
            select
            label="Class"
            value={form.classId}
            onChange={set("classId")}
          >
            <MenuItem value="">None</MenuItem>
            {classes.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.grade} {c.section}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Phone" value={form.phone} onChange={set("phone")} />
          {!editing && (
            <TextField
              label="Password"
              type="password"
              value={form.password}
              onChange={set("password")}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={creating || updating || !form.name || !form.email}
          >
            {editing ? "Save" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
