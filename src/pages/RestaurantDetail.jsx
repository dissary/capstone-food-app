import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRestaurant, getMenuItems } from "../services/api";
import { useCart } from "../context/CartContext";

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [restaurantData, menuData] = await Promise.all([
          getRestaurant(id),
          getMenuItems(id),
        ]);
        setRestaurant(restaurantData);
        setMenuItems(menuData);
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

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="container mt-4 pb-5" style={{ paddingBottom: cartCount > 0 ? "90px" : "" }}>
      <button className="btn btn-link mb-3" onClick={() => navigate("/")}>&larr; Back</button>

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

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="mb-4">
        <span className="category-pill">{category}</span>
          <div className="row">
            {items.map((item) => (
              <div className="col-md-6 mb-3" key={item.id}>
                <div className="card">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-title mb-1">{item.name}</h6>
                      <p className="card-text text-muted mb-1" style={{ fontSize: "0.9rem" }}>
                        {item.description}
                      </p>
                      <strong>RM {parseFloat(item.price).toFixed(2)}</strong>
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