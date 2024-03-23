import React, { useEffect, useState } from "react";
import {
  Grid,
  Paper,
  useMediaQuery,
  ThemeProvider,
  createTheme,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import axios from "../api/axios";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Login = () => {
  const { setAuth, persist, setPersist } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathName || "/dashboard";
  const theme = createTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const paperStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
    height: isMediumScreen ? "70vh" : "70vh",
    width: isMediumScreen ? "85vw" : "30vw",
    margin: "15vh auto",
  };

  const iconStyle = {
    // marginTop: isMediumScreen ? "50px" : "75px",
    height: "100%",
    alignItems: "center",
    fontSize: isSmallScreen ? 75 : 100,
    marginBottom: 0,
    paddingBottom: 0
  };

  const buttonStyle = {
    color: "white",
    backgroundColor: "black",
    padding: 20,
  };

  const errorStyle = {
    color: "crimson",
    display: "flex",
    width: "100%",
    justifyContent: "center",
  };

  const iconDiv = {
    display: "flex",
    height: "25vh",
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        "/login",
        JSON.stringify({
          username,
          password,
        }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      const accessToken = response?.data?.accessToken;

      setAuth({ username, accessToken });
      setUsername("");
      setPassword("");

      navigate(from, { replace: true });
    } catch (err) {
      if (!err?.response) {
        setError("No Server Response");
      } else if (err.response?.status === 400) {
        setError("Missing Username or Password");
      } else if (err.response?.status === 401) {
        setError("Unauthorized");
      } else {
        setError("Login Failed");
      }
    }
  };

  const togglePersist = () => {
    setPersist((prev) => !prev);
  };

  useEffect(() => {
    localStorage.setItem("persist", persist);
  }, [persist]);

  return (
    <ThemeProvider theme={theme}>
      <Grid>
        <Paper elevation={5} style={paperStyle}>
          <Grid align="center" style={iconDiv}>
            <VerifiedUserIcon style={iconStyle} />
          </Grid>
          <form onSubmit={handleSubmit}>
            {error && (
              <Typography variant="p" style={errorStyle}>
                {error}
              </Typography>
            )}
            <TextField
              label="Username"
              placeholder="Enter username..."
              sx={{
                marginTop: "25px",
                marginBottom: "25px",
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "black",
                  },
                },
                "& label.Mui-focused": {
                  color: "black",
                },
              }}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              fullWidth
            />
            <TextField
              label="Password"
              placeholder="Enter password..."
              type="password"
              sx={{
                marginBottom: "25px",
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "black",
                  },
                },
                "& label.Mui-focused": {
                  color: "black",
                },
              }}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              fullWidth
              autoComplete="current-password"
            />
            <Button
              type="submit"
              variant="contained"
              style={buttonStyle}
              fullWidth
            >
              Sign In
            </Button>
            <FormControlLabel
              control={
                <Checkbox
                  checked={persist}
                  onChange={togglePersist}
                  inputProps={{ "aria-label": "controlled" }}
                  sx={{
                    color: persist ? 'black' : 'default',
                    '&.Mui-checked': {
                      color: 'black',
                    },
                  }}
                />
              }
              label="Trust this device"
            />
          </form>
        </Paper>
      </Grid>
    </ThemeProvider>
  );
};

export default Login;
