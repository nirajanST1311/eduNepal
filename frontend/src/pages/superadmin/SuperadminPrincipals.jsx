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
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeactivateUserMutation,
} from "@/store/api/userApi";
import { useGetSchoolsQuery } from "@/store/api/schoolApi";

const empty = { name: "", email: "", phone: "", password: "", schoolId: "" };

export default function SuperadminPrincipals() {
  const { data: principals = [] } = useGetUsersQuery({
    role: "SCHOOL_ADMIN",
  });
  const { data: schools = [] } = useGetSchoolsQuery();
  const [createUser, { isLoading: creating }] = useCreateUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();
  const [deactivateUser] = useDeactivateUserMutation();

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const filtered = principals.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p._id);
    setForm({
      name: p.name,
      email: p.email,
      phone: p.phone || "",
      schoolId: p.schoolId?._id || "",
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (editing) {
      await updateUser({ id: editing, ...form }).unwrap();
    } else {
      await createUser({ ...form, role: "SCHOOL_ADMIN" }).unwrap();
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
        <Box>
          <Typography sx={{ fontSize: "22px", fontWeight: 500, mb: 0.25 }}>
            Principals
          </Typography>
          <Typography
            sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
            Manage school principals
          </Typography>
        </Box>
        <Button size="small" onClick={openCreate}>
          Add principal
        </Button>
      </Box>
      <TextField
        size="small"
        placeholder="Search principals…"
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
              <TableCell>School</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p._id}>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.email}</TableCell>
                <TableCell>{p.phone || "—"}</TableCell>
                <TableCell>{p.schoolId?.name || "Unassigned"}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(p)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeactivate(p._id)}
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
                    No principals found.
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
        <DialogTitle>
          {editing ? "Edit principal" : "Add principal"}
        </DialogTitle>
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
          <TextField
            select
            label="School"
            value={form.schoolId}
            onChange={set("schoolId")}
          >
            <MenuItem value="">None</MenuItem>
            {schools.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>
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
