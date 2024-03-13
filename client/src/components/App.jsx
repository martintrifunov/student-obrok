import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Login from "../pages/Login";
import Map from "../pages/Map";

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/" element={<Map />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
