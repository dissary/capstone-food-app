import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRestaurant, getMenuItems } from "../services/api";
import { useCart } from "../context/CartContext";
import { getCategoryOrder } from "../services/api";

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [categoryOrder, setCategoryOrder] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [restaurantData, menuData, orderData] = await Promise.all([
          getRestaurant(id),
          getMenuItems(id),
          getCategoryOrder(id),
        ]);
        setRestaurant(restaurantData);
        setMenuItems(menuData);
        setCategoryOrder(orderData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) return <div className="container mt-5">Loading...</div>;
  if (!restaurant) return <div className="container mt-5">Restaurant not found.</div>;

// Group menu items by category
  const grouped = menuItems.reduce((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  // Sort categories using the owner's saved order
  const orderMap = {};
  categoryOrder.forEach((row) => { orderMap[row.category] = row.sort_order; });

  const sortedEntries = Object.entries(grouped).sort(([a], [b]) => {
    const aOrder = orderMap[a] ?? 9999;
    const bOrder = orderMap[b] ?? 9999;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.localeCompare(b);
  });

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="container mt-4 pb-5" style={{ paddingBottom: cartCount > 0 ? "90px" : "" }}>
    <button
      onClick={() => navigate("/")}
      className="d-inline-flex align-items-center gap-2 mb-3"
      style={{
        background: "none",
        border: "none",
        color: "var(--dinery-forest)",
        fontWeight: 600,
        fontSize: "0.95rem",
        padding: "8px 4px",
        cursor: "pointer",
        transition: "opacity 0.15s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      Back to Restaurants
    </button>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h2>{restaurant.name}</h2>
          <p className="text-muted">{restaurant.description}</p>
          <p className="text-muted"><small>{restaurant.address}</small></p>
        </div>
        {cartCount > 0 && (
          <div className="sticky-cart-bar">
            <span>{cartCount} item{cartCount > 1 ? "s" : ""} in cart</span>
            <button className="btn" onClick={() => navigate("/cart")}>
              View Cart →
            </button>
          </div>
        )}
      </div>

      {Object.keys(grouped).length === 0 && <p>No menu items available yet.</p>}

      {sortedEntries.map(([category, items]) => (
        <div key={category} className="mb-4">
        <span className="category-pill">{category}</span>
          <div className="row">
            {items.map((item) => (
              <div className="col-md-6 mb-3" key={item.id}>
                <div className="card">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={item.image_url || "https://placehold.co/80x80/E8F0EC/1B4B43?text=🍽"}
                        alt={item.name}
                        style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "var(--radius-sm)" }}
                      />
                      <div>
                        <h6 className="card-title mb-1">{item.name}</h6>
                        <p className="card-text text-muted mb-1" style={{ fontSize: "0.9rem" }}>
                          {item.description}
                        </p>
                        <strong>RM {parseFloat(item.price).toFixed(2)}</strong>
                      </div>
                    </div>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => addToCart(item, restaurant.id)}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}