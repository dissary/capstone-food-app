import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRestaurants } from "../services/api";

export default function Home() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const data = await getRestaurants();
        setRestaurants(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurants();
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="container mt-5">


      {loading && <p>Loading restaurants...</p>}
      {error && <p className="text-danger">{error}</p>}

      <div className="row">
        {restaurants.map((restaurant) => (
          <div className="col-md-4 mb-4" key={restaurant.id}>
            <div
              className="card h-100"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/restaurants/${restaurant.id}`)}
            >
              <img
                src={restaurant.image_url || "https://placehold.co/400x250?text=No+Image"}
                className="card-img-top"
                alt={restaurant.name}
                style={{ height: "180px", objectFit: "cover" }}
              />
              <div className="card-body">
                <h5 className="card-title">{restaurant.name}</h5>
                <p className="card-text text-muted">{restaurant.description}</p>
                <p className="card-text"><small className="text-muted">{restaurant.address}</small></p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && restaurants.length === 0 && <p>No restaurants available yet.</p>}
    </div>
  );
}