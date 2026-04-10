import { Box, Typography, Card, CardContent, Chip } from "@mui/material";
import { useGetNoticesQuery } from "@/store/api/noticeApi";

export default function StudentNotices() {
  const { data: notices = [], isLoading } = useGetNoticesQuery({});

  if (isLoading) return <Typography>Loading…</Typography>;

  const isNew = (d) =>
    Date.now() - new Date(d).getTime() < 2 * 24 * 3600 * 1000;
  const newNotices = notices.filter((n) => isNew(n.createdAt));
  const older = notices.filter((n) => !isNew(n.createdAt));

  const renderList = (list) =>
    list.map((n) => (
      <Card key={n._id} sx={{ mb: 1.5 }}>
        <CardContent sx={{ py: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 0.5,
            }}
          >
            <Typography variant="body1" fontWeight={500}>
              {n.title}
            </Typography>
            {n.priority === "high" && (
              <Chip label="Important" size="small" color="error" />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {n.body}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {n.from === "municipality" ? "Municipality" : "School"} ·{" "}
            {new Date(n.createdAt).toLocaleDateString()}
          </Typography>
        </CardContent>
      </Card>
    ));

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Notices
      </Typography>
      {newNotices.length > 0 && (
        <>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            New
          </Typography>
          {renderList(newNotices)}
        </>
      )}
      {older.length > 0 && (
        <>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ mt: 2, mb: 1 }}
          >
            Earlier
          </Typography>
          {renderList(older)}
        </>
      )}
      {notices.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No notices.
        </Typography>
      )}
    </Box>
  );
}
