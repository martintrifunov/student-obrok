import React from "react";
import { Routes, Route } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Login from "../pages/Login";
import Map from "../pages/Map";
import Dashboard from "../pages/Dashboard";
import RequireAuth from "./RequireAuth";
import AddOrEditDealForm from "../pages/AddOrEditDealForm";
import Layout from "./Layout";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/" element={<Map />} />
        <Route path="/login" element={<Login />} />
        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/dashboard/deal/:dealId"
            element={<AddOrEditDealForm />}
          />
          <Route path="/dashboard/deal" element={<AddOrEditDealForm />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
