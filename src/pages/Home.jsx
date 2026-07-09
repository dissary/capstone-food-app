import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="container mt-5">
      <h2>Welcome to Dinery!</h2>
      <p>Enjoy your meal!</p>

      {currentUser ? (
        <>
          <p>Logged in as: {currentUser.email}</p>
          <button className="btn btn-outline-danger" onClick={handleLogout}>
            Log Out
          </button>
        </>
      ) : (
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={() => navigate("/login")}>Login</button>
          <button className="btn btn-secondary" onClick={() => navigate("/signup")}>Sign Up</button>
        </div>
      )}
    </div>
  );
}