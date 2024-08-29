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
  styled,
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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

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
      <LoginContainer elevation={5}>
        <Grid align="center" sx={{ display: "flex", height: "25vh" }}>
          <VerifiedUserIcon className="login-logo" />
        </Grid>
        <form onSubmit={handleSubmit}>
          {error && <Error variant="p">{error}</Error>}
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
          <LoginButton type="submit" variant="contained" fullWidth>
            Sign In
          </LoginButton>
          <FormControlLabel
            control={
              <Checkbox
                checked={persist}
                onChange={togglePersist}
                inputProps={{ "aria-label": "controlled" }}
                sx={{
                  color: persist ? "black" : "default",
                  "&.Mui-checked": {
                    color: "black",
                  },
                }}
              />
            }
            label="Trust this device"
          />
        </form>
        <Grid className="maco-auth">
          <Typography variant="p" sx={{ fontSize: 10 }}>
            Secured with <strong>macoAuth</strong>
          </Typography>
          <Typography variant="p" sx={{ fontSize: 10 }}>
            using love & kittens
          </Typography>
        </Grid>
      </LoginContainer>
    </ThemeProvider>
  );
};

const LoginContainer = styled(Paper)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "center",
  padding: 20,
  height: "80vh",
  width: useMediaQuery(theme.breakpoints.down("md")) ? "85vw" : "30vw",
  margin: "10vh auto",
  "& .maco-auth": {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  "& .login-logo": {
    height: "100%",
    alignItems: "center",
    fontSize: useMediaQuery(theme.breakpoints.down("sm")) ? 125 : 130,
    marginBottom: 0,
    paddingBottom: 0,
  },

  // Surface Pro 7
  [`@media (min-width: ${
    theme.breakpoints.values.md + 1
  }px) and (max-width: 1366px)`]: {
    width: "80vw",
    "& .login-logo": {
      height: "100%",
      alignItems: "center",
      fontSize: 200,
      marginBottom: 0,
      paddingBottom: 0,
    },
    fontSize: 20,
  },

  // Galaxy Fold
  [`@media (min-width: 280px) and (max-width: 280px) and 
  (min-height: 653px) and (max-height: 653px)`]: {
    width: "85vw",
    "& .login-logo": {
      height: "100%",
      alignItems: "center",
      fontSize: 100,
      marginBottom: 0,
      paddingBottom: 0,
    },
  },

  // Nest Hub
  [`@media (min-width: 1024px) and (max-width: 1024px) and 
    (min-height: 600px) and (max-height: 600px)`]: {
    width: "45vw",
    "& .login-logo": {
      height: "100%",
      alignItems: "center",
      fontSize: 100,
      marginBottom: 0,
      paddingBottom: 0,
    },
  },

  // Nest Hub Max
  [`@media (min-width: 1280px) and (max-width: 1280px) and 
   (min-height: 800px) and (max-height: 800px)`]: {
    width: "45vw",
    "& .login-logo": {
      height: "100%",
      alignItems: "center",
      fontSize: 100,
      marginBottom: 0,
      paddingBottom: 0,
    },
  },
}));

const LoginButton = styled(Button)(({ theme }) => ({
  color: "white",
  backgroundColor: "black",
  padding: 20,
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
}));

const Error = styled(Typography)(({ theme }) => ({
  color: "crimson",
  display: "flex",
  width: "100%",
  justifyContent: "center",

  // Galaxy Fold
  [`@media (min-width: 280px) and (max-width: 280px) and 
    (min-height: 653px) and (max-height: 653px)`]: {
    fontSize: 12,
  },
}));

export default Login;
