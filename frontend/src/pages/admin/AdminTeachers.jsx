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
  Chip,
} from "@mui/material";
import { Edit, PersonOff } from "@mui/icons-material";
import { useSelector } from "react-redux";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeactivateUserMutation,
} from "@/store/api/userApi";

const empty = { name: "", email: "", phone: "", password: "" };

export default function AdminTeachers() {
  const { user } = useSelector((s) => s.auth);
  const { data: teachers = [] } = useGetUsersQuery({
    role: "TEACHER",
    schoolId: user?.schoolId,
  });
  const [createUser, { isLoading: creating }] = useCreateUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();
  const [deactivateUser] = useDeactivateUserMutation();

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const filtered = teachers.filter((t) =>
    t.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (t) => {
    setEditing(t._id);
    setForm({ name: t.name, email: t.email, phone: t.phone || "" });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (editing) {
      await updateUser({ id: editing, ...form }).unwrap();
    } else {
      await createUser({
        ...form,
        role: "TEACHER",
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
          Teachers
        </Typography>
        <Button size="small" onClick={openCreate}>
          Add teacher
        </Button>
      </Box>
      <TextField
        size="small"
        placeholder="Search teachers…"
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
              <TableCell>Phone</TableCell>
              <TableCell>Subjects</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((t) => (
              <TableRow key={t._id}>
                <TableCell>{t.name}</TableCell>
                <TableCell>{t.email}</TableCell>
                <TableCell>{t.phone || "—"}</TableCell>
                <TableCell>
                  {t.subjectIds?.length > 0 ? (
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {t.subjectIds.map((s) => (
                        <Chip key={s._id} label={s.name} size="small" />
                      ))}
                    </Box>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(t)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeactivate(t._id)}
                  >
                    <PersonOff fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography
                    sx={{
                      fontSize: "13px",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    No teachers found.
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
        <DialogTitle>{editing ? "Edit teacher" : "Add teacher"}</DialogTitle>
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
