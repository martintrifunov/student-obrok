import { createTheme } from "@mui/material/styles";

export const getAppTheme = (mode) => {
  const isDark = mode === "dark";

  const inputBg = isDark ? "#0B1121" : "#ffffff";
  const inputBorder = isDark
    ? "rgba(255, 255, 255, 0.23)"
    : "rgba(0, 0, 0, 0.23)";
  const inputBorderHover = isDark
    ? "rgba(255, 255, 255, 0.87)"
    : "rgba(0, 0, 0, 0.87)";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? "#38bdf8" : "#0f172a",
      },
      background: {
        default: isDark ? "#0B1121" : "#f8f9fc",
        paper: isDark ? "#151C2C" : "#ffffff",
      },
      divider: isDark ? "#2A364F" : "#e2e8f0",
      text: {
        primary: isDark ? "#f1f5f9" : "#0f172a",
        secondary: isDark ? "#94a3b8" : "#64748b",
      },
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      button: {
        textTransform: "none",
        fontWeight: 600,
        letterSpacing: "0.3px",
      },
      h4: {
        letterSpacing: "-0.5px",
      },
      h5: {
        letterSpacing: "-0.5px",
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: "none",
            padding: "8px 16px",
            "&:hover": {
              boxShadow: "none",
            },
          },
          containedPrimary: {
            ...(isDark && {
              backgroundColor: "rgba(56, 189, 248, 0.1)",
              color: "#38bdf8",
              border: "1px solid rgba(56, 189, 248, 0.2)",
              "&:hover": {
                backgroundColor: "rgba(56, 189, 248, 0.2)",
              },
            }),
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundColor: inputBg,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: inputBorder,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: inputBorderHover,
            },
          },
        },
      },

      MuiCssBaseline: {
        styleOverrides: {
          ".ql-toolbar, .ql-container": {
            borderColor: `${inputBorder} !important`,
            backgroundColor: `${inputBg} !important`,
            transition: "border-color 0.2s",
          },
          ...(isDark && {
            ".ql-snow .ql-stroke": { stroke: "#94a3b8 !important" },
            ".ql-snow .ql-fill, .ql-snow .ql-stroke.ql-fill": {
              fill: "#94a3b8 !important",
            },
            ".ql-snow .ql-picker": { color: "#94a3b8 !important" },
            ".ql-editor": { color: "#f1f5f9 !important" },
          }),
        },
      },
    },
  });
};
