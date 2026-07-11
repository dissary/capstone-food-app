import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar as BsNavbar, Nav, Container, Button } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getCurrentUserProfile } from "../services/api";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [expanded, setExpanded] = useState(false);

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
    setExpanded(false);
    navigate("/");
  }

  function handleNavigate(path) {
    setExpanded(false);
    navigate(path);
  }

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <BsNavbar
      expand="lg"
      expanded={expanded}
      onToggle={setExpanded}
      className="shadow-sm mb-4"
      style={{ backgroundColor: "var(--dinery-cream)", borderBottom: "1px solid var(--dinery-sage)" }}
    >
      <Container>
        <BsNavbar.Brand
          as={Link}
          to="/"
          className="brand-font fw-bold"
          style={{ color: "var(--dinery-forest)" }}
          onClick={() => setExpanded(false)}
        >
          Dinery
        </BsNavbar.Brand>

        <div className="d-flex align-items-center gap-2 order-lg-last">
          {cartCount > 0 && (
            <Button
              size="sm"
              onClick={() => handleNavigate("/cart")}
              style={{ backgroundColor: "var(--dinery-mango)", border: "none", color: "white", fontWeight: 700 }}
            >
              Cart ({cartCount})
            </Button>
          )}
          <BsNavbar.Toggle aria-controls="main-navbar" />
        </div>

        <BsNavbar.Collapse id="main-navbar">
          <Nav className="me-auto mt-3 mt-lg-0">
            {role === "owner" && (
              <>
                <Nav.Link onClick={() => handleNavigate("/owner")}>My Restaurant</Nav.Link>
                <Nav.Link onClick={() => handleNavigate("/owner/orders")}>Orders</Nav.Link>
              </>
            )}
            {role === "admin" && (
              <Nav.Link onClick={() => handleNavigate("/admin")}>Admin</Nav.Link>
            )}
            {currentUser && (
              <Nav.Link onClick={() => handleNavigate("/orders")}>My Orders</Nav.Link>
            )}
          </Nav>

          <Nav className="align-items-lg-center gap-lg-2 mt-3 mt-lg-0 mb-2 mb-lg-0">
            {currentUser ? (
              <>
                <span className="text-muted small mb-2 mb-lg-0">{currentUser.email}</span>
                <Button size="sm" variant="outline-danger" onClick={handleLogout}>
                  Log Out
                </Button>
              </>
            ) : (
              <div className="d-flex gap-2">
                <Button size="sm" onClick={() => handleNavigate("/login")} style={{ backgroundColor: "var(--dinery-forest)", border: "none" }}>
                  Login
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleNavigate("/signup")}>
                  Sign Up
                </Button>
              </div>
            )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
}