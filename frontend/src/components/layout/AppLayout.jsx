import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppLayout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 0,
          pb: 3,
          px: 3,
          bgcolor: "#faf8f4",
          minHeight: "100vh",
          overflow: "auto",
        }}
      >
        <Header />
        <Outlet />
      </Box>
    </Box>
  );
}
