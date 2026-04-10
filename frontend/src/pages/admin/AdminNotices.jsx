import { useState } from "react";
import {
  Box,
  Typography,
  Card,
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
          mb: 2,
        }}
      >
        <Typography variant="h5">Notices</Typography>
        <Button variant="contained" size="small" onClick={() => setOpen(true)}>
          New notice
        </Button>
      </Box>
      {notices.map((n) => (
        <Card key={n._id} sx={{ mb: 1.5 }}>
          <CardContent sx={{ py: 1.5 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body1" fontWeight={500}>
                {n.title}
              </Typography>
              <Button
                size="small"
                color="error"
                onClick={() => deleteNotice(n._id)}
              >
                Delete
              </Button>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {n.body}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(n.createdAt).toLocaleDateString()}
            </Typography>
          </CardContent>
        </Card>
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
