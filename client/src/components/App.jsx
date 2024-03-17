import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Login from "../pages/Login";
import Map from "../pages/Map";
import Dashboard from "../pages/Dashboard";
import AddOrEditDealForm from "../pages/AddOrEditDealForm";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Map />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/deal/:dealId" element={<AddOrEditDealForm />} />
        <Route path="/dashboard/deal" element={<AddOrEditDealForm />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
