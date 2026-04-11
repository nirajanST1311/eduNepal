import { createContext, useContext, useEffect } from "react";
import { Typography, Breadcrumbs } from "@mui/material";
import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

// Context for dynamic breadcrumb label overrides (set at layout level)
export const BreadcrumbContext = createContext({
  overrides: {},
  setOverrides: () => {},
});

/** Hook for child pages to set a breadcrumb label for a dynamic segment (e.g. an ObjectId) */
export function useBreadcrumbOverride(id, label) {
  const { setOverrides } = useContext(BreadcrumbContext);
  useEffect(() => {
    if (id && label) {
      setOverrides((prev) => ({ ...prev, [id]: label }));
      return () =>
        setOverrides((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
    }
  }, [id, label, setOverrides]);
}

const isObjectId = (s) => /^[a-f\d]{24}$/i.test(s);

export default function AppBreadcrumb() {
  const { pathname } = useLocation();
  const { overrides } = useContext(BreadcrumbContext);
  const { t } = useTranslation();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const getLabel = (seg) => {
    if (overrides[seg]) return overrides[seg];
    const key = `breadcrumb.${seg}`;
    const translated = t(key);
    if (translated !== key) return translated;
    if (isObjectId(seg)) return "…";
    return seg.charAt(0).toUpperCase() + seg.slice(1);
  };

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon sx={{ fontSize: 14 }} />}
      sx={{ "& .MuiBreadcrumbs-li": { lineHeight: 1 } }}
    >
      {segments.map((seg, i) => {
        const path = "/" + segments.slice(0, i + 1).join("/");
        const label = getLabel(seg);
        const isLast = i === segments.length - 1;

        if (isLast) {
          return (
            <Typography
              key={path}
              variant="caption"
              color="text.primary"
              fontWeight={500}
            >
              {label}
            </Typography>
          );
        }
        return (
          <Typography
            key={path}
            component={Link}
            to={path}
            variant="caption"
            sx={{
              color: "text.secondary",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {label}
          </Typography>
        );
      })}
    </Breadcrumbs>
  );
}
