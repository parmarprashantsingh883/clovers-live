import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "./AdminLayout";

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

const Adminapp = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster position="top-right" richColors />

   <Routes>
  <Route path="/" element={<AdminLayout />}>
    <Route index element={<Dashboard />} />
    <Route path="products" element={<Products />} />
    <Route path="orders" element={<Orders />} />
    <Route path="customers" element={<Customers />} />
    <Route path="categories" element={<Categories />} />
    <Route path="analytics" element={<Analytics />} />
    <Route path="settings" element={<Settings />} />
        <Route path="login" element={<Login />} />
  </Route>

  <Route path="*" element={<NotFound />} />
</Routes>
  </QueryClientProvider>
);

export default Adminapp;
