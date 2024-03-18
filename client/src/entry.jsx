import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App.jsx";
import "./assets/index.css";
import "@fontsource/roboto/400.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/*" element={<App />}></Route>
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);
