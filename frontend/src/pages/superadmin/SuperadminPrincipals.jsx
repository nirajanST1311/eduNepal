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
  Chip,
  Avatar,
  InputAdornment,
  Drawer,
  Divider,
} from "@mui/material";
import {
  Edit,
  PersonOff,
  Search,
  Close,
  Email,
  Phone,
  School,
  CalendarMonth,
  Person,
  Visibility,
} from "@mui/icons-material";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeactivateUserMutation,
} from "@/store/api/userApi";
import { useGetSchoolsQuery } from "@/store/api/schoolApi";

const empty = { name: "", email: "", phone: "", password: "", schoolId: "" };

function InfoRow({ icon, label, value }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        py: 1.5,
        borderBottom: "0.5px solid var(--color-border-tertiary)",
      }}
    >
      {icon}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{ fontSize: "11px", color: "var(--color-text-secondary)" }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontSize: "13px",
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {value || "—"}
        </Typography>
      </Box>
    </Box>
  );
}

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
  const [fieldErrors, setFieldErrors] = useState({});

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Detail drawer
  const [detailPrincipal, setDetailPrincipal] = useState(null);

  const filtered = principals.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.schoolId?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setFieldErrors({});
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
    setFieldErrors({});
    setOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errors.email = "Invalid email format";
    if (!editing && !form.password.trim())
      errors.password = "Password is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      if (editing) {
        await updateUser({ id: editing, ...form }).unwrap();
      } else {
        await createUser({ ...form, role: "SCHOOL_ADMIN" }).unwrap();
      }
      setOpen(false);
      setForm(empty);
      setEditing(null);
      setFieldErrors({});
    } catch {
      /* handled by RTK */
    }
  };

  const confirmDeactivate = async () => {
    if (!deleteTarget) return;
    try {
      await deactivateUser(deleteTarget._id).unwrap();
    } catch {
      /* handled by RTK */
    }
    setDeleteTarget(null);
  };

  const set = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const schoolMap = {};
  schools.forEach((s) => {
    schoolMap[s._id] = s;
  });

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: "22px", fontWeight: 500, mb: 0.25 }}>
            Principals
          </Typography>
          <Typography
            sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
            {principals.length} principal{principals.length !== 1 ? "s" : ""}{" "}
            registered
          </Typography>
        </Box>
        <Button size="small" onClick={openCreate}>
          Add principal
        </Button>
      </Box>

      {/* Search */}
      <TextField
        size="small"
        placeholder="Search by name, email, or school…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, width: 320 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ fontSize: 18, color: "text.secondary" }} />
            </InputAdornment>
          ),
        }}
      />

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
              <TableCell>Principal</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>School</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((p) => (
              <TableRow
                key={p._id}
                hover
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "var(--color-background-secondary)",
                  },
                }}
                onClick={() => setDetailPrincipal(p)}
              >
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: "13px",
                        fontWeight: 600,
                        bgcolor: "primary.main",
                      }}
                    >
                      {p.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                      {p.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: "13px" }}>{p.email}</Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: "13px" }}>
                    {p.phone || "—"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: "13px" }}>
                    {p.schoolId?.name || (
                      <span style={{ color: "var(--color-text-secondary)" }}>
                        Unassigned
                      </span>
                    )}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={p.active !== false ? "Active" : "Inactive"}
                    size="small"
                    sx={{
                      fontSize: "11px",
                      fontWeight: 600,
                      height: 22,
                      bgcolor:
                        p.active !== false
                          ? "var(--color-background-success)"
                          : "var(--color-background-danger)",
                      color:
                        p.active !== false
                          ? "var(--color-text-success)"
                          : "var(--color-text-danger)",
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailPrincipal(p);
                    }}
                    title="View details"
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(p);
                    }}
                    title="Edit"
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(p);
                    }}
                    title="Deactivate"
                  >
                    <PersonOff fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography
                    sx={{
                      fontSize: "13px",
                      color: "var(--color-text-secondary)",
                      py: 3,
                      textAlign: "center",
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

      {/* Create/Edit Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 0 }}>
          {editing ? "Edit principal" : "Add principal"}
        </DialogTitle>
        <Typography
          sx={{
            fontSize: "12px",
            color: "var(--color-text-secondary)",
            px: 3,
            pb: 1,
          }}
        >
          {editing
            ? "Update principal information"
            : "Create a new school principal account"}
        </Typography>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Full name"
            fullWidth
            required
            value={form.name}
            onChange={set("name")}
            error={Boolean(fieldErrors.name)}
            helperText={fieldErrors.name || ""}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            value={form.email}
            onChange={set("email")}
            error={Boolean(fieldErrors.email)}
            helperText={fieldErrors.email || ""}
          />
          <TextField
            label="Phone"
            fullWidth
            value={form.phone}
            onChange={set("phone")}
          />
          <TextField
            select
            label="Assign to school"
            fullWidth
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
              label="Temporary password"
              type="password"
              fullWidth
              required
              value={form.password}
              onChange={set("password")}
              error={Boolean(fieldErrors.password)}
              helperText={fieldErrors.password || "Principal must change on first login"}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={creating || updating}
            sx={{ borderRadius: 2 }}
          >
            {creating || updating
              ? "Saving…"
              : editing
                ? "Save changes"
                : "Create principal"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 0.5 }}>Deactivate principal?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>
            Are you sure you want to deactivate{" "}
            <strong>{deleteTarget?.name}</strong>
            {deleteTarget?.schoolId?.name && (
              <>
                {" "}
                from <strong>{deleteTarget.schoolId.name}</strong>
              </>
            )}
            ? They will no longer be able to log in. This action can be reversed
            later.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDeactivate}
            sx={{ borderRadius: 2 }}
          >
            Yes, deactivate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(detailPrincipal)}
        onClose={() => setDetailPrincipal(null)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 380 },
            p: 0,
          },
        }}
      >
        {detailPrincipal && (
          <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            {/* Drawer header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2.5,
                py: 2,
                borderBottom: "0.5px solid var(--color-border-tertiary)",
              }}
            >
              <Typography sx={{ fontSize: "15px", fontWeight: 600 }}>
                Principal details
              </Typography>
              <IconButton
                size="small"
                onClick={() => setDetailPrincipal(null)}
              >
                <Close fontSize="small" />
              </IconButton>
            </Box>

            {/* Profile section */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                pt: 3,
                pb: 2,
                px: 2.5,
              }}
            >
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  fontSize: "24px",
                  fontWeight: 600,
                  bgcolor: "primary.main",
                  mb: 1.5,
                }}
              >
                {detailPrincipal.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Typography sx={{ fontSize: "16px", fontWeight: 600, mb: 0.25 }}>
                {detailPrincipal.name}
              </Typography>
              <Chip
                label={
                  detailPrincipal.active !== false ? "Active" : "Inactive"
                }
                size="small"
                sx={{
                  fontSize: "11px",
                  fontWeight: 600,
                  height: 22,
                  mt: 0.5,
                  bgcolor:
                    detailPrincipal.active !== false
                      ? "var(--color-background-success)"
                      : "var(--color-background-danger)",
                  color:
                    detailPrincipal.active !== false
                      ? "var(--color-text-success)"
                      : "var(--color-text-danger)",
                }}
              />
            </Box>

            <Divider />

            {/* Info rows */}
            <Box sx={{ px: 2.5, py: 1, flex: 1, overflow: "auto" }}>
              <InfoRow
                icon={
                  <Email
                    sx={{
                      fontSize: 18,
                      color: "var(--color-text-secondary)",
                    }}
                  />
                }
                label="Email"
                value={detailPrincipal.email}
              />
              <InfoRow
                icon={
                  <Phone
                    sx={{
                      fontSize: 18,
                      color: "var(--color-text-secondary)",
                    }}
                  />
                }
                label="Phone"
                value={detailPrincipal.phone}
              />
              <InfoRow
                icon={
                  <School
                    sx={{
                      fontSize: 18,
                      color: "var(--color-text-secondary)",
                    }}
                  />
                }
                label="Assigned school"
                value={detailPrincipal.schoolId?.name}
              />
              <InfoRow
                icon={
                  <CalendarMonth
                    sx={{
                      fontSize: 18,
                      color: "var(--color-text-secondary)",
                    }}
                  />
                }
                label="Joined"
                value={
                  detailPrincipal.createdAt
                    ? new Date(detailPrincipal.createdAt).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long", day: "numeric" },
                      )
                    : null
                }
              />
              <InfoRow
                icon={
                  <Person
                    sx={{
                      fontSize: 18,
                      color: "var(--color-text-secondary)",
                    }}
                  />
                }
                label="Role"
                value="School Admin (Principal)"
              />
            </Box>

            {/* Drawer actions */}
            <Box
              sx={{
                px: 2.5,
                py: 2,
                borderTop: "0.5px solid var(--color-border-tertiary)",
                display: "flex",
                gap: 1,
              }}
            >
              <Button
                fullWidth
                variant="outlined"
                size="small"
                sx={{ borderRadius: 2 }}
                onClick={() => {
                  setDetailPrincipal(null);
                  openEdit(detailPrincipal);
                }}
              >
                Edit
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                size="small"
                sx={{ borderRadius: 2 }}
                onClick={() => {
                  setDetailPrincipal(null);
                  setDeleteTarget(detailPrincipal);
                }}
              >
                Deactivate
              </Button>
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}
