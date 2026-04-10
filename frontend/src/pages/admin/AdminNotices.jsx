import { useState } from "react";
import {
  Box,
  Typography,
  CardContent,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useSelector } from "react-redux";
import {
  useGetNoticesQuery,
  useCreateNoticeMutation,
  useDeleteNoticeMutation,
} from "@/store/api/noticeApi";

export default function AdminNotices() {
  const { user } = useSelector((s) => s.auth);
  const { data: notices = [] } = useGetNoticesQuery({});
  const [createNotice, { isLoading }] = useCreateNoticeMutation();
  const [deleteNotice] = useDeleteNoticeMutation();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", priority: "normal" });

  const handleCreate = async () => {
    await createNotice({ ...form, schoolId: user?.schoolId }).unwrap();
    setOpen(false);
    setForm({ title: "", body: "", priority: "normal" });
  };

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
          Notices
        </Typography>
        <Button size="small" onClick={() => setOpen(true)}>
          New notice
        </Button>
      </Box>
      {notices.map((n) => (
        <Box
          key={n._id}
          sx={{
            bgcolor: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
            p: 2,
            mb: "14px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
              {n.title}
            </Typography>
            <Button
              size="small"
              onClick={() => deleteNotice(n._id)}
              sx={{ color: "var(--color-text-danger)", fontSize: "13px" }}
            >
              Delete
            </Button>
          </Box>
          <Typography
            sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
            {n.body}
          </Typography>
          <Typography
            sx={{ fontSize: "12px", color: "var(--color-text-secondary)" }}
          >
            {new Date(n.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
      ))}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>New notice</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
        >
          <TextField
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <TextField
            label="Body"
            multiline
            rows={3}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />
          <FormControl>
            <InputLabel>Priority</InputLabel>
            <Select
              value={form.priority}
              label="Priority"
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={isLoading || !form.title}
          >
            Publish
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
