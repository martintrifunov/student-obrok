import React, { useState } from "react";
import {
  Grid,
  Paper,
  useMediaQuery,
  ThemeProvider,
  createTheme,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { API_ROOT } from "../../../server/conifg";
import axios from "axios";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const theme = createTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [_, setCookies] = useCookies(["access_token"]);
  const navigate = useNavigate();

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
    marginTop: isMediumScreen ? "50px" : "75px",
    fontSize: 100,
  };

  const buttonStyle = {
    color: "white",
    backgroundColor: "black",
    padding: 20
  };

  const errorStyle = {
    color: "crimson",
  };
  
  const iconDiv = {
    display: "flex",
    height: "25vh",
    
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${API_ROOT}/login`, {
        username,
        password,
      });
      setCookies("access_token", response.data.token);
      window.localStorage.setItem("userId", response.data.userId);
      navigate("/dashboard");
    } catch (error) {
      setError(error.response.data.message);
    }
  };

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
              fullWidth
              required
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
              required
            />
            <Button
              type="submit"
              variant="contained"
              style={buttonStyle}
              fullWidth
            >
              Sign In
            </Button>
          </form>
        </Paper>
      </Grid>
    </ThemeProvider>
  );
};

export default Login;
