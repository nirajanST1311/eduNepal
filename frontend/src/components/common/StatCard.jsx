import { Card, CardContent, Typography } from "@mui/material";

export default function StatCard({ label, value, color }) {
  return (
    <Card>
      <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
        <Typography
          variant="caption"
          sx={{
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, color: color || "text.primary", mt: 0.25 }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}
