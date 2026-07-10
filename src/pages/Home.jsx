import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRestaurants } from "../services/api";

export default function Home() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRestaurants().then(setRestaurants).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container pb-5">
      <div className="mb-4">
        <h2 className="brand-font mb-1">What are you craving today?</h2>
        <p className="text-muted">Order from restaurants near you</p>
      </div>

      {loading && <p className="text-muted">Loading restaurants...</p>}

      <div className="row g-3">
        {restaurants.map((restaurant) => (
          <div className="col-6 col-md-4 col-lg-3" key={restaurant.id}>
            <div
              className="card restaurant-card h-100"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/restaurants/${restaurant.id}`)}
            >
              <img
                src={restaurant.image_url || "https://placehold.co/400x250/E8F0EC/1B4B43?text=Dinery"}
                className="card-img-top"
                alt={restaurant.name}
                style={{ height: "160px", objectFit: "cover" }}
              />
              <div className="card-body">
                <h6 className="card-title mb-1 fw-bold">{restaurant.name}</h6>
                <p className="card-text text-muted small mb-0" style={{
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
                }}>
                  {restaurant.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && restaurants.length === 0 && (
        <div className="empty-state">
          <h5>No restaurants yet</h5>
          <p>Check back soon — new places are added regularly.</p>
        </div>
      )}
    </div>
  );
}