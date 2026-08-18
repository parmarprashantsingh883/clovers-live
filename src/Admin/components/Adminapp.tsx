import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { useAuth } from "@/context/AuthContext";

import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products";
import Orders from "../pages/Orders";
import Customers from "../pages/Customers";
import Categories from "../pages/Categories";
import Analytics from "../pages/Analytics";
import Settings from "../pages/Settings";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";

import "./Admin.css";

const queryClient = new QueryClient();

/** Route guard — only a signed-in admin gets past; others land on the login. */
const RequireAdmin = () => {
  const { user, booting } = useAuth() as any;
  if (booting) return null;
  if (!user || user.role !== "admin") return <Navigate to="/admin/login" replace />;
  return <Outlet />;
};

const Adminapp = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster position="top-right" richColors />

    <Routes>
      <Route path="login" element={<Login />} />

      <Route element={<RequireAdmin />}>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="categories" element={<Categories />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  </QueryClientProvider>
);

export default Adminapp;
