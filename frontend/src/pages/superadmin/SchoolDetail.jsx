import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Card, CardContent, Button } from "@mui/material";
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
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">{school.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {school.address}
          </Typography>
          {school.phone && (
            <Typography variant="body2" color="text.secondary">
              {school.phone}
            </Typography>
          )}
        </CardContent>
      </Card>

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
