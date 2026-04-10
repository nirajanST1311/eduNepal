import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  useGetSchoolQuery,
  useGetSchoolStatsQuery,
} from "@/store/api/schoolApi";
import StatCard from "@/components/common/StatCard";

export default function SchoolDetail() {
  const { schoolId } = useParams();
  const navigate = useNavigate();
  const { data: school, isLoading } = useGetSchoolQuery(schoolId);
  const { data: stats } = useGetSchoolStatsQuery(schoolId);

  if (isLoading) return <Typography>Loading…</Typography>;
  if (!school) return <Typography>School not found.</Typography>;

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/superadmin/schools")}
        sx={{ mb: 2 }}
      >
        Back
      </Button>
      <Box
        sx={{
          bgcolor: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          p: 2,
          mb: 3,
        }}
      >
        <Typography sx={{ fontSize: "22px", fontWeight: 500 }}>
          {school.name}
        </Typography>
        <Typography
          sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
        >
          {school.address}
        </Typography>
        {school.phone && (
          <Typography
            sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
            {school.phone}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
          gap: 2,
        }}
      >
        <StatCard label="Classes" value={stats?.classes ?? "—"} />
        <StatCard label="Teachers" value={stats?.teachers ?? "—"} />
        <StatCard label="Students" value={stats?.students ?? "—"} />
      </Box>
    </Box>
  );
}
