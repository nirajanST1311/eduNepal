import { Component } from "react";
import { Box, Typography, Button } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: this.props.fullPage ? "100vh" : 300,
            py: 6,
            px: 3,
            textAlign: "center",
          }}
        >
          <ErrorOutlineIcon
            sx={{ fontSize: 48, color: "error.main", opacity: 0.7, mb: 2 }}
          />
          <Typography variant="h3" sx={{ mb: 1 }}>
            Something went wrong
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 420 }}>
            {this.state.error?.message || "An unexpected error occurred. Please try again."}
          </Typography>
          <Button variant="outlined" onClick={this.handleReset}>
            Try again
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
