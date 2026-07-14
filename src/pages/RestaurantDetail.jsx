import { useEffect, useState, useRef } from "react";
import { Dropdown } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { getRestaurant, getMenuItems, getCategoryOrder } from "../services/api";
import { useCart } from "../context/CartContext";

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryOrder, setCategoryOrder] = useState([]);
  const [search, setSearch] = useState("");
  const [showStickyBar, setShowStickyBar] = useState(false);
  const headerRef = useRef(null);
  const categoryRefs = useRef({});
  const [searchOpen, setSearchOpen] = useState(false);

  const [activeCategory, setActiveCategory] = useState(null);

useEffect(() => {
  function trackActiveCategory() {
    const entries = Object.entries(categoryRefs.current);
    for (const [category, el] of entries) {
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top <= 120 && rect.bottom > 120) {
        setActiveCategory(category);
        break;
      }
    }
  }
  window.addEventListener("scroll", trackActiveCategory);
  return () => window.removeEventListener("scroll", trackActiveCategory);
}, []);

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

  // Show sticky bar once the user scrolls past the restaurant header
  useEffect(() => {
    function handleScroll() {
      if (!headerRef.current) return;
      const headerBottom = headerRef.current.getBoundingClientRect().bottom;
      setShowStickyBar(headerBottom < 0);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToCategory(category) {
    categoryRefs.current[category]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (loading) return <div className="container mt-5">Loading...</div>;
  if (!restaurant) return <div className="container mt-5">Restaurant not found.</div>;

  // Filter by search first, then group by category
  const filteredItems = search
    ? menuItems.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    : menuItems;

  const grouped = filteredItems.reduce((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const orderMap = {};
  categoryOrder.forEach((row) => { orderMap[row.category] = row.sort_order; });

  const sortedEntries = Object.entries(grouped).sort(([a], [b]) => {
    const aOrder = orderMap[a] ?? 9999;
    const bOrder = orderMap[b] ?? 9999;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.localeCompare(b);
  });

  const allCategoryNames = sortedEntries.map(([category]) => category);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="container mt-4 pb-5" style={{ paddingBottom: cartCount > 0 ? "90px" : "" }}>
      <button
        onClick={() => navigate("/")}
        className="d-inline-flex align-items-center gap-2 mb-3"
        style={{ background: "none", border: "none", color: "var(--dinery-forest)", fontWeight: 600, fontSize: "0.95rem", padding: "8px 4px", cursor: "pointer" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Restaurants
      </button>

      <div ref={headerRef} className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h2>{restaurant.name}</h2>
          <p className="text-muted">{restaurant.description}</p>
          <p className="text-muted"><small>{restaurant.address}</small></p>
        </div>
      </div>

      <input
        className="form-control mb-4"
        placeholder="Search this menu..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Sticky category + search bar, appears on scroll */}
{showStickyBar && (
  <div
    className="position-fixed top-0 start-0 end-0 shadow-sm"
    style={{ backgroundColor: "var(--dinery-cream)", borderBottom: "1px solid var(--dinery-sage)", zIndex: 999, padding: "12px 0" }}
  >
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <h6 className="mb-0 fw-bold" style={{ fontSize: "1.25rem" }}>{restaurant.name}</h6>
      </div>

      <div className="d-flex align-items-center gap-2">
        <Dropdown className="flex-grow-1">
          <Dropdown.Toggle className="dinery-category-toggle">
            {activeCategory || "All Categories"}
          </Dropdown.Toggle>
          <Dropdown.Menu style={{ width: "100%" }}>
            {allCategoryNames.map((category) => (
              <Dropdown.Item key={category} onClick={() => scrollToCategory(category)}>
                {category}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>

        <button onClick={() => setSearchOpen(!searchOpen)} className="dinery-search-btn">
          <i className="bi bi-search"></i>
        </button>
      </div>

      {searchOpen && (
        <input
          autoFocus
          className="form-control form-control-sm mt-2"
          placeholder="Search menu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}
    </div>
  </div>
)}
      {cartCount > 0 && (
        <div className="sticky-cart-bar">
          <span>{cartCount} item{cartCount > 1 ? "s" : ""} in cart</span>
          <button className="btn" onClick={() => navigate("/cart")}>View Cart →</button>
        </div>
      )}

      {sortedEntries.length === 0 && <p className="text-muted">No menu items match your search.</p>}

      {sortedEntries.map(([category, items]) => (
        <div
          key={category}
          ref={(el) => (categoryRefs.current[category] = el)}
          className="mb-4"
          style={{ scrollMarginTop: "80px" }}
        >
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
                        <p className="card-text text-muted mb-1" style={{ fontSize: "0.9rem" }}>{item.description}</p>
                        <strong>RM {parseFloat(item.price).toFixed(2)}</strong>
                      </div>
                    </div>
                    <button className="btn btn-outline-primary btn-sm" onClick={() => addToCart(item, restaurant.id)}>
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