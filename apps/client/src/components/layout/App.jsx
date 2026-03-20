import React from "react";
import { Routes, Route } from "react-router-dom";
import NotFound from "@/components/layout/NotFound";
import Login from "@/features/auth/pages/Login";
import Dashboard from "@/features/dashboard/pages/Dashboard";
import RequireAuth from "@/features/auth/components/RequireAuth";
import AddOrEditProductForm from "@/features/products/pages/AddOrEditProductForm";
import Layout from "@/components/layout/Layout";
import DashboardLayout from "@/features/dashboard/components/DashboardLayout";
import PersistLogin from "@/features/auth/components/PersistLogin";
import AddOrEditVendorForm from "@/features/vendors/pages/AddOrEditVendorForm";
import AddOrEditMarketForm from "@/features/markets/pages/AddOrEditMarketForm";
import MapPage from "@/features/map/pages/MapPage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route element={<PersistLogin />}>
          <Route path="/" element={<MapPage />} />
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
              <Route
                path="/dashboard/market/:marketId"
                element={<AddOrEditMarketForm />}
              />
              <Route
                path="/dashboard/market"
                element={<AddOrEditMarketForm />}
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
