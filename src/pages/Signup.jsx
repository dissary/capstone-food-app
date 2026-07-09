import { useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await signup(emailRef.current.value, passwordRef.current.value);
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="container mt-5">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input ref={emailRef} type="email" placeholder="Email" required className="form-control mb-2" />
        <input ref={passwordRef} type="password" placeholder="Password" required className="form-control mb-2" />
        <button type="submit" className="btn btn-primary">Sign Up</button>
      </form>
    </div>
  );
}