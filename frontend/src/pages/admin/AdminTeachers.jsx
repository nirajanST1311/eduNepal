import { useRef, useState } from "react";
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
  InputAdornment,
  Drawer,
  Tooltip,
  Skeleton,
  Avatar,
  Alert,
  LinearProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import CloseIcon from "@mui/icons-material/Close";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import { useSelector } from "react-redux";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeactivateUserMutation,
  useBulkUploadTeachersMutation,
} from "@/store/api/userApi";

const empty = { name: "", email: "", phone: "", password: "" };

export default function AdminTeachers() {
  const { user } = useSelector((s) => s.auth);
  const { data: teachers = [], isLoading } = useGetUsersQuery({
    role: "TEACHER",
    schoolId: user?.schoolId,
  });
  const [createUser, { isLoading: creating }] = useCreateUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();
  const [deactivateUser] = useDeactivateUserMutation();
  const [bulkUploadTeachers, { isLoading: uploading }] =
    useBulkUploadTeachersMutation();

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [fieldErrors, setFieldErrors] = useState({});
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [detail, setDetail] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const fileInputRef = useRef(null);

  const filtered = teachers.filter(
    (t) =>
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setFieldErrors({});
    setOpen(true);
  };

  const openEdit = (t) => {
    setEditing(t._id);
    setForm({ name: t.name, email: t.email, phone: t.phone || "" });
    setFieldErrors({});
    setOpen(true);
  };

  const handleSubmit = async () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    if (!editing && !form.password.trim())
      errs.password = "Password is required";
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;

    try {
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
    } catch {
      /* handled by RTK */
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    try {
      await deactivateUser(deactivateTarget._id).unwrap();
    } catch {
      /* handled by RTK */
    }
    setDeactivateTarget(null);
  };

  const set = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (fieldErrors[field]) setFieldErrors((p) => ({ ...p, [field]: "" }));
  };

  const handleUploadOpen = () => {
    setUploadFile(null);
    setUploadResult(null);
    setUploadOpen(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) setUploadFile(file);
  };

  const handleBulkUpload = async () => {
    if (!uploadFile) return;
    const fd = new FormData();
    fd.append("file", uploadFile);
    try {
      const res = await bulkUploadTeachers(fd).unwrap();
      setUploadResult(res);
      setUploadFile(null);
    } catch (err) {
      setUploadResult({
        errors: [
          {
            row: 0,
            error: err?.data?.message || "Upload failed. Please try again.",
          },
        ],
        created: [],
      });
    }
  };

  const downloadSample = () => {
    const base = import.meta.env.VITE_API_URL || "/api";
    const token = localStorage.getItem("token");
    window.open(`${base}/bulk-upload/sample/teachers?token=${token}`, "_blank");
  };

  const initials = (name) =>
    name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

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
          Teachers
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<UploadFileOutlinedIcon />}
            onClick={handleUploadOpen}
            sx={{ textTransform: "none" }}
          >
            Upload Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
            sx={{ textTransform: "none" }}
          >
            Add Teacher
          </Button>
        </Box>
      </Box>
      <Typography
        sx={{ fontSize: "13px", color: "var(--color-text-secondary)", mb: 3 }}
      >
        {teachers.length} teacher{teachers.length !== 1 ? "s" : ""} in your
        school
      </Typography>

      {/* Search */}
      <TextField
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        sx={{ mb: 2.5, maxWidth: 360, width: "100%" }}
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
              <TableCell>Teacher</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Subjects</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {[1, 2, 3, 4, 5].map((c) => (
                      <TableCell key={c}>
                        <Skeleton width={c === 4 ? 120 : 80} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : filtered.map((t) => (
                  <TableRow
                    key={t._id}
                    sx={{
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: "var(--color-background-secondary)",
                      },
                    }}
                    onClick={() => setDetail(t)}
                  >
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <Avatar
                          sx={{
                            width: 30,
                            height: 30,
                            fontSize: "11px",
                            fontWeight: 500,
                            bgcolor: "var(--color-background-info)",
                            color: "var(--color-text-info)",
                          }}
                        >
                          {initials(t.name)}
                        </Avatar>
                        <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                          {t.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{t.email}</TableCell>
                    <TableCell>{t.phone || "—"}</TableCell>
                    <TableCell>
                      {t.subjectIds?.length > 0 ? (
                        <Box
                          sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}
                        >
                          {t.subjectIds.slice(0, 3).map((s) => (
                            <Chip key={s._id} label={s.name} size="small" />
                          ))}
                          {t.subjectIds.length > 3 && (
                            <Chip
                              label={`+${t.subjectIds.length - 3}`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      ) : (
                        <Typography
                          sx={{
                            fontSize: "12px",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          No subjects
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell
                      align="right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEdit(t)}>
                          <EditOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Deactivate">
                        <IconButton
                          size="small"
                          sx={{ color: "var(--color-text-danger)" }}
                          onClick={() => setDeactivateTarget(t)}
                        >
                          <PersonOffOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: "center", py: 4 }}>
                  <PeopleEmpty search={search} />
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
          {editing ? "Edit Teacher" : "Add Teacher"}
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
        >
          <TextField
            label="Full Name"
            value={form.name}
            onChange={set("name")}
            error={!!fieldErrors.name}
            helperText={fieldErrors.name}
          />
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={set("email")}
            error={!!fieldErrors.email}
            helperText={fieldErrors.email}
            disabled={!!editing}
          />
          <TextField label="Phone" value={form.phone} onChange={set("phone")} />
          {!editing && (
            <TextField
              label="Password"
              type="password"
              value={form.password}
              onChange={set("password")}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
            />
          )}
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
                : "Create Teacher"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deactivate Confirmation */}
      <Dialog
        open={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 500, pb: 0.5 }}>
          Deactivate Teacher
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
            Are you sure you want to deactivate{" "}
            <strong>{deactivateTarget?.name}</strong>? They will no longer be
            able to log in.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeactivateTarget(null)}
            sx={{ textTransform: "none", color: "text.primary" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeactivate}
            sx={{ textTransform: "none" }}
          >
            Deactivate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Drawer */}
      <Drawer anchor="right" open={!!detail} onClose={() => setDetail(null)}>
        {detail && (
          <Box sx={{ width: 360, p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography sx={{ fontSize: "16px", fontWeight: 500 }}>
                Teacher Detail
              </Typography>
              <IconButton size="small" onClick={() => setDetail(null)}>
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  fontSize: "16px",
                  fontWeight: 500,
                  bgcolor: "var(--color-background-info)",
                  color: "var(--color-text-info)",
                }}
              >
                {initials(detail.name)}
              </Avatar>
              <Box>
                <Typography sx={{ fontSize: "15px", fontWeight: 500 }}>
                  {detail.name}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Teacher
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <EmailOutlinedIcon
                  sx={{ fontSize: 16, color: "var(--color-text-secondary)" }}
                />
                <Typography sx={{ fontSize: "13px" }}>
                  {detail.email}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <PhoneOutlinedIcon
                  sx={{ fontSize: 16, color: "var(--color-text-secondary)" }}
                />
                <Typography sx={{ fontSize: "13px" }}>
                  {detail.phone || "Not provided"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "start", gap: 1.5 }}>
                <MenuBookOutlinedIcon
                  sx={{
                    fontSize: 16,
                    color: "var(--color-text-secondary)",
                    mt: 0.25,
                  }}
                />
                <Box>
                  <Typography
                    sx={{ fontSize: "13px", fontWeight: 500, mb: 0.5 }}
                  >
                    Subjects
                  </Typography>
                  {detail.subjectIds?.length > 0 ? (
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {detail.subjectIds.map((s) => (
                        <Chip key={s._id} label={s.name} size="small" />
                      ))}
                    </Box>
                  ) : (
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      No subjects assigned
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>

            <Box sx={{ mt: 3, display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={() => {
                  setDetail(null);
                  openEdit(detail);
                }}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                fullWidth
                onClick={() => {
                  setDetail(null);
                  setDeactivateTarget(detail);
                }}
              >
                Deactivate
              </Button>
            </Box>
          </Box>
        )}
      </Drawer>

      {/* Bulk Upload Dialog */}
      <Dialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontSize: "16px",
            fontWeight: 500,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Upload Teachers via Excel
          <IconButton size="small" onClick={() => setUploadOpen(false)}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {uploading && <LinearProgress sx={{ mb: 2 }} />}

          {!uploadResult && (
            <>
              <Typography
                sx={{
                  fontSize: "13px",
                  color: "var(--color-text-secondary)",
                  mb: 2,
                }}
              >
                Upload an Excel file (.xlsx) with teacher details. Each row will
                create a teacher account with a default password of{" "}
                <strong>password123</strong>.
              </Typography>

              <Button
                variant="text"
                size="small"
                startIcon={<DownloadOutlinedIcon />}
                onClick={downloadSample}
                sx={{ textTransform: "none", mb: 2 }}
              >
                Download Sample Excel
              </Button>

              <Box
                sx={{
                  border: "2px dashed var(--color-border-tertiary)",
                  borderRadius: "var(--border-radius-lg)",
                  p: 3,
                  textAlign: "center",
                  cursor: "pointer",
                  "&:hover": { bgcolor: "var(--color-background-secondary)" },
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                />
                <UploadFileOutlinedIcon
                  sx={{
                    fontSize: 36,
                    color: "var(--color-text-secondary)",
                    mb: 1,
                  }}
                />
                <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                  {uploadFile
                    ? uploadFile.name
                    : "Click to select an Excel file"}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "var(--color-text-secondary)",
                    mt: 0.5,
                  }}
                >
                  Supported formats: .xlsx, .xls
                </Typography>
              </Box>
            </>
          )}

          {uploadResult && (
            <Box>
              {uploadResult.created?.length > 0 && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Successfully created {uploadResult.created.length} teacher
                  account{uploadResult.created.length !== 1 ? "s" : ""}.
                </Alert>
              )}
              {uploadResult.errors?.length > 0 && (
                <Box>
                  <Alert severity="warning" sx={{ mb: 1.5 }}>
                    {uploadResult.errors.length} row
                    {uploadResult.errors.length !== 1 ? "s" : ""} had errors:
                  </Alert>
                  <Box
                    sx={{
                      maxHeight: 200,
                      overflow: "auto",
                      bgcolor: "var(--color-background-secondary)",
                      borderRadius: "var(--border-radius-md)",
                      p: 1.5,
                    }}
                  >
                    {uploadResult.errors.map((err, i) => (
                      <Typography key={i} sx={{ fontSize: "12px", mb: 0.5 }}>
                        {err.row > 0 ? `Row ${err.row}: ` : ""}
                        {err.error}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setUploadOpen(false)}
            sx={{ textTransform: "none", color: "text.primary" }}
          >
            {uploadResult ? "Close" : "Cancel"}
          </Button>
          {!uploadResult && (
            <Button
              variant="contained"
              onClick={handleBulkUpload}
              disabled={!uploadFile || uploading}
              sx={{ textTransform: "none" }}
            >
              {uploading ? "Uploading…" : "Upload & Create"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function PeopleEmpty({ search }) {
  return (
    <Box sx={{ py: 2 }}>
      <Typography
        sx={{ fontSize: "14px", color: "var(--color-text-secondary)" }}
      >
        {search ? "No teachers match your search" : "No teachers added yet"}
      </Typography>
    </Box>
  );
}
