import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import OwnerDashboard from "./pages/OwnerDashboard";
import RestaurantDetail from "./pages/RestaurantDetail";
import AdminDashboard from "./pages/AdminDashboard";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderHistory from "./pages/OrderHistory";
import OwnerOrders from "./pages/OwnerOrders";
import Navbar from "./components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/restaurants/:id" element={<RestaurantDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/owner" element={<OwnerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/owner/orders" element={<OwnerOrders />} />
        </Routes>
      </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

