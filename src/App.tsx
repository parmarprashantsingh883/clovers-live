import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import DealsPage from "./pages/DealsPage";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import ForgotPassword from "./auth/ForgotPassword";
import ResetPassword from "./auth/ResetPassword";
import SearchPage from "./pages/SearchPage";
import FoodPage from "./pages/FoodPage";
import BeveragesPage from "./pages/BeveragesPage";
import MunchiesPage from "./pages/MunchiesPage";
import HouseholdPage from "./pages/HouseholdPage";
import PersonalCarePage from "./pages/PersonalCarePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetails from "./pages/OrderDetails";
import OrderSuccess from "./pages/OrderSuccess";
import CartPage from "./pages/CartPage";
import ProfilePage from "./pages/ProfilePage";
import WishlistPage from "./pages/WishlistPage";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import Adminapp from "./Admin/components/Adminapp";
import NotFound from "./pages/NotFound";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ToastContainer position="top-right" autoClose={3000} />
      <Toaster />
      <Sonner />

      <Routes>
        {/* Admin */}
        <Route path="/admin/*" element={<Adminapp />} />

        {/* Public */}
        <Route path="/" element={<Index />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="/food" element={<FoodPage />} />
        <Route path="/beverages" element={<BeveragesPage />} />
          <Route path="/munchies" element={<MunchiesPage />} />
        <Route path="/household" element={<HouseholdPage />} />
        <Route path="/personal-care" element={<PersonalCarePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Shop */}
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />

        {/* Orders */}
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetails />} />

        {/* Others */}
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/product/:id" element={<ProductDetails />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
