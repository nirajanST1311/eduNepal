import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Skeleton, Chip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  useGetSchoolQuery,
  useGetSchoolStatsQuery,
} from "@/store/api/schoolApi";
import { useBreadcrumbOverride } from "@/components/layout/AppBreadcrumb";

const pctColor = (v) => {
  if (v >= 80) return "var(--color-text-success)";
  if (v >= 60) return "var(--color-text-warning)";
  return "var(--color-text-danger)";
};

function InfoRow({ label, value }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        py: 1,
        borderBottom: "0.5px solid var(--color-border-tertiary)",
      }}
    >
      <Typography
        sx={{ fontSize: "12px", color: "var(--color-text-secondary)" }}
      >
        {label}
      </Typography>
      <Typography
        sx={{ fontSize: "13px", fontWeight: 500, textAlign: "right" }}
      >
        {value || "—"}
      </Typography>
    </Box>
  );
}

function StatBox({ label, value, sub, color }) {
  return (
    <Box
      sx={{
        bgcolor: "var(--color-background-secondary)",
        borderRadius: "var(--border-radius-md)",
        p: 1.5,
        flex: 1,
        minWidth: 0,
      }}
    >
      <Typography
        sx={{
          fontSize: "11px",
          color: "var(--color-text-secondary)",
          mb: 0.25,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: "22px",
          fontWeight: 500,
          color: color || "var(--color-text-primary)",
          lineHeight: 1.2,
        }}
      >
        {value}
      </Typography>
      {sub && (
        <Typography
          sx={{
            fontSize: "11px",
            color: "var(--color-text-secondary)",
            mt: 0.25,
          }}
        >
          {sub}
        </Typography>
      )}
    </Box>
  );
}

export default function SchoolDetail() {
  const { schoolId } = useParams();
  const navigate = useNavigate();
  const { data: school, isLoading } = useGetSchoolQuery(schoolId);
  const { data: stats, isLoading: statsLoading } =
    useGetSchoolStatsQuery(schoolId);

  // Set breadcrumb label: show school name instead of raw ID
  useBreadcrumbOverride(schoolId, school?.name);

  if (isLoading) {
    return (
      <Box>
        <Skeleton width={120} height={32} sx={{ mb: 2 }} />
        <Skeleton
          variant="rounded"
          height={120}
          sx={{ borderRadius: "var(--border-radius-lg)", mb: 3 }}
        />
        <Box sx={{ display: "flex", gap: 2 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={80}
              sx={{ flex: 1, borderRadius: "var(--border-radius-md)" }}
            />
          ))}
        </Box>
      </Box>
    );
  }

  if (!school) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography sx={{ fontSize: "15px", fontWeight: 500, mb: 1 }}>
          School not found
        </Typography>
        <Button size="small" onClick={() => navigate("/superadmin/schools")}>
          Back to Schools
        </Button>
      </Box>
    );
  }

  const location = [
    school.ward ? `Ward ${school.ward}` : null,
    school.tole,
    school.municipality,
    school.district,
    school.province,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Box>
      {/* School header card */}
      <Box
        sx={{
          bgcolor: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          p: 2.5,
          mb: 2.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Box>
            <Typography sx={{ fontSize: "20px", fontWeight: 500 }}>
              {school.name}
            </Typography>
            {school.nameNp && (
              <Typography
                sx={{
                  fontSize: "14px",
                  color: "var(--color-text-secondary)",
                  mt: 0.25,
                }}
              >
                {school.nameNp}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Box
              component="span"
              sx={{
                padding: "2px 10px",
                borderRadius: "4px",
                fontSize: "11px",
                fontWeight: 500,
                bgcolor:
                  school.active !== false
                    ? "var(--color-background-success)"
                    : "var(--color-background-tertiary)",
                color:
                  school.active !== false
                    ? "var(--color-text-success)"
                    : "var(--color-text-secondary)",
              }}
            >
              {school.active !== false ? "Active" : "Inactive"}
            </Box>
          </Box>
        </Box>
        <Typography
          sx={{
            fontSize: "13px",
            color: "var(--color-text-secondary)",
            mb: 0.5,
          }}
        >
          {location || school.address || "No address"}
        </Typography>
        <Box sx={{ display: "flex", gap: 3, mt: 1 }}>
          {school.phone && (
            <Typography
              sx={{ fontSize: "12px", color: "var(--color-text-secondary)" }}
            >
              Phone:{" "}
              <span
                style={{
                  color: "var(--color-text-primary)",
                  fontWeight: 500,
                }}
              >
                {school.phone}
              </span>
            </Typography>
          )}
          {school.email && (
            <Typography
              sx={{ fontSize: "12px", color: "var(--color-text-secondary)" }}
            >
              Email:{" "}
              <span
                style={{
                  color: "var(--color-text-primary)",
                  fontWeight: 500,
                }}
              >
                {school.email}
              </span>
            </Typography>
          )}
          {school.regNo && (
            <Typography
              sx={{ fontSize: "12px", color: "var(--color-text-secondary)" }}
            >
              Reg:{" "}
              <span
                style={{
                  color: "var(--color-text-primary)",
                  fontWeight: 500,
                }}
              >
                {school.regNo}
              </span>
            </Typography>
          )}
        </Box>
      </Box>

      {/* Key stats row */}
      <Box sx={{ display: "flex", gap: 2, mb: 2.5 }}>
        {statsLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={76}
              sx={{ flex: 1, borderRadius: "var(--border-radius-md)" }}
            />
          ))
        ) : (
          <>
            <StatBox label="Students" value={stats?.students ?? 0} />
            <StatBox label="Teachers" value={stats?.teachers ?? 0} />
            <StatBox label="Classes" value={stats?.classes ?? 0} />
            <StatBox
              label="Attendance (30d)"
              value={`${stats?.attendance?.percentage ?? 0}%`}
              color={pctColor(stats?.attendance?.percentage ?? 0)}
            />
            <StatBox
              label="Content coverage"
              value={`${stats?.content?.percentage ?? 0}%`}
              sub={`${stats?.content?.published ?? 0}/${stats?.content?.total ?? 0} chapters`}
              color={pctColor(stats?.content?.percentage ?? 0)}
            />
          </>
        )}
      </Box>

      {/* Two-column layout */}
      <Box sx={{ display: "flex", gap: 2.5 }}>
        {/* Left column */}
        <Box
          sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          {/* School info */}
          <Box
            sx={{
              bgcolor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: "var(--border-radius-lg)",
              p: 2.5,
            }}
          >
            <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 1.5 }}>
              School information
            </Typography>
            <InfoRow label="Level" value={school.schoolLevel} />
            <InfoRow label="Management" value={school.managementType} />
            <InfoRow label="Established" value={school.established} />
            <InfoRow label="EMIS code" value={school.emis} />
            <InfoRow label="Affiliation" value={school.affiliationBoard} />
            <InfoRow label="Academic year" value={school.academicYear} />
            {school.principalId && (
              <>
                <InfoRow label="Principal" value={school.principalId.name} />
                <InfoRow
                  label="Principal email"
                  value={school.principalId.email}
                />
              </>
            )}
          </Box>

          {/* Classes breakdown */}
          {stats?.classSummary?.length > 0 && (
            <Box
              sx={{
                bgcolor: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: "var(--border-radius-lg)",
                p: 2.5,
              }}
            >
              <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 1.5 }}>
                Classes
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1.5fr 1fr 1fr",
                  py: 0.75,
                  borderBottom: "0.5px solid var(--color-border-tertiary)",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "11px",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Class
                </Typography>
                <Typography
                  sx={{
                    fontSize: "11px",
                    color: "var(--color-text-secondary)",
                  }}
                  textAlign="center"
                >
                  Students
                </Typography>
                <Typography
                  sx={{
                    fontSize: "11px",
                    color: "var(--color-text-secondary)",
                  }}
                  textAlign="right"
                >
                  Year
                </Typography>
              </Box>
              {stats.classSummary
                .sort(
                  (a, b) =>
                    b.grade - a.grade || a.section.localeCompare(b.section),
                )
                .map((cls) => (
                  <Box
                    key={cls._id}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1.5fr 1fr 1fr",
                      py: 1,
                      borderBottom: "0.5px solid var(--color-border-tertiary)",
                      alignItems: "center",
                    }}
                  >
                    <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                      Grade {cls.grade} — {cls.section}
                    </Typography>
                    <Typography sx={{ fontSize: "13px" }} textAlign="center">
                      {cls.students}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "var(--color-text-secondary)",
                      }}
                      textAlign="right"
                    >
                      {cls.academicYear || "—"}
                    </Typography>
                  </Box>
                ))}
            </Box>
          )}
        </Box>

        {/* Right column */}
        <Box
          sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          {/* Assignments & submissions */}
          <Box
            sx={{
              bgcolor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: "var(--border-radius-lg)",
              p: 2.5,
            }}
          >
            <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 1.5 }}>
              Assignments & submissions
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
              <StatBox label="Published" value={stats?.assignments ?? 0} />
              <StatBox
                label="Submissions"
                value={stats?.submissions?.total ?? 0}
              />
              <StatBox label="Graded" value={stats?.submissions?.graded ?? 0} />
              <StatBox
                label="Pending review"
                value={stats?.submissions?.pending ?? 0}
                color={
                  stats?.submissions?.pending > 0
                    ? "var(--color-text-warning)"
                    : undefined
                }
              />
            </Box>
          </Box>

          {/* Subjects */}
          {stats?.subjectNames?.length > 0 && (
            <Box
              sx={{
                bgcolor: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: "var(--border-radius-lg)",
                p: 2.5,
              }}
            >
              <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 1.5 }}>
                Subjects ({stats.subjects})
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                {stats.subjectNames.map((name) => (
                  <Chip
                    key={name}
                    label={name}
                    size="small"
                    sx={{
                      fontSize: "12px",
                      height: 26,
                      bgcolor: "var(--color-background-tertiary)",
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Teachers */}
          {stats?.recentTeachers?.length > 0 && (
            <Box
              sx={{
                bgcolor: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: "var(--border-radius-lg)",
                p: 2.5,
              }}
            >
              <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 1.5 }}>
                Teachers
              </Typography>
              {stats.recentTeachers.map((t, i) => (
                <Box
                  key={t._id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    py: 1,
                    borderBottom:
                      i < stats.recentTeachers.length - 1
                        ? "0.5px solid var(--color-border-tertiary)"
                        : "none",
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                      {t.name}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "11px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {t.email}
                    </Typography>
                  </Box>
                  {t.phone && (
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {t.phone}
                    </Typography>
                  )}
                </Box>
              ))}
              {stats.teachers > stats.recentTeachers.length && (
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "var(--color-text-secondary)",
                    mt: 1,
                  }}
                >
                  +{stats.teachers - stats.recentTeachers.length} more
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
