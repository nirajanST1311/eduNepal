import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { useGetNoticesQuery } from "@/store/api/noticeApi";

export default function StudentNotices() {
  const { data: notices = [], isLoading } = useGetNoticesQuery({});
  const [now] = useState(() => Date.now());

  if (isLoading)
    return <Typography sx={{ fontSize: "13px" }}>Loading…</Typography>;

  const isNew = (d) => now - new Date(d).getTime() < 2 * 24 * 3600 * 1000;
  const newNotices = notices.filter((n) => isNew(n.createdAt));
  const older = notices.filter((n) => !isNew(n.createdAt));

  const renderList = (list) =>
    list.map((n) => (
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
            mb: 0.5,
          }}
        >
          <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
            {n.title}
          </Typography>
          {n.priority === "high" && (
            <Box
              component="span"
              sx={{
                padding: "2px 8px",
                borderRadius: "4px",
                fontSize: "11px",
                fontWeight: 500,
                bgcolor: "var(--color-background-danger)",
                color: "var(--color-text-danger)",
              }}
            >
              Important
            </Box>
          )}
        </Box>
        <Typography
          sx={{
            fontSize: "13px",
            color: "var(--color-text-secondary)",
            mb: 0.5,
          }}
        >
          {n.body}
        </Typography>
        <Typography
          sx={{ fontSize: "12px", color: "var(--color-text-secondary)" }}
        >
          {n.from === "municipality" ? "Municipality" : "School"} ·{" "}
          {new Date(n.createdAt).toLocaleDateString()}
        </Typography>
      </Box>
    ));

  return (
    <Box>
      <Typography sx={{ fontSize: "22px", fontWeight: 500, mb: "14px" }}>
        Notices
      </Typography>
      {newNotices.length > 0 && (
        <>
          <Typography
            sx={{
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--color-text-secondary)",
              mb: 1,
            }}
          >
            New
          </Typography>
          {renderList(newNotices)}
        </>
      )}
      {older.length > 0 && (
        <>
          <Typography
            sx={{
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--color-text-secondary)",
              mt: 2,
              mb: 1,
            }}
          >
            Earlier
          </Typography>
          {renderList(older)}
        </>
      )}
      {notices.length === 0 && (
        <Typography
          sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
        >
          No notices.
        </Typography>
      )}
    </Box>
  );
}
