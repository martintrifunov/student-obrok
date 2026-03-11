import React from "react";
import { Routes, Route } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import RequireAuth from "./RequireAuth";
import AddOrEditProductForm from "../pages/AddOrEditProductForm";
import Layout from "./Layout";
import DashboardLayout from "./DashboardLayout";
import PersistLogin from "./PersistLogin";
import AddOrEditVendorForm from "../pages/AddOrEditVendorForm";
import Home from "../pages/Home";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route element={<PersistLogin />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route element={<RequireAuth />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route
                path="/dashboard/product/:productId"
                element={<AddOrEditProductForm />}
              />
              <Route
                path="/dashboard/product"
                element={<AddOrEditProductForm />}
              />
              <Route
                path="/dashboard/vendor/:vendorId"
                element={<AddOrEditVendorForm />}
              />
              <Route
                path="/dashboard/vendor"
                element={<AddOrEditVendorForm />}
              />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
