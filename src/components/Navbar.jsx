import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getCurrentUserProfile } from "../services/api";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  useEffect(() => {
    async function fetchRole() {
      if (currentUser) {
        try {
          const profile = await getCurrentUserProfile(currentUser);
          setRole(profile.role);
        } catch (err) {
          console.error(err);
        }
      } else {
        setRole(null);
      }
    }
    fetchRole();
  }, [currentUser]);

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm mb-4">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">Dinery</Link>

        <div className="d-flex align-items-center gap-3 ms-auto">
          {role === "owner" && <Link to="/owner" className="nav-link">My Restaurant</Link>}
          {role === "admin" && <Link to="/admin" className="nav-link">Admin</Link>}

          {currentUser && (
            <Link to="/orders" className="nav-link">My Orders</Link>
          )}

          {cartCount > 0 && (
            <Link to="/cart" className="btn btn-success btn-sm">
              Cart ({cartCount})
            </Link>
          )}

          {currentUser ? (
            <>
              <span className="text-muted small">{currentUser.email}</span>
              <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary btn-sm">Login</Link>
              <Link to="/signup" className="btn btn-secondary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}