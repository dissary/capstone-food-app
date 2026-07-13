import { useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { signup, loginWithGoogle } = useAuth();
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

  async function handleGoogleSignup() {
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h2 className="brand-font mb-4">Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input ref={emailRef} type="email" placeholder="Email" required className="form-control mb-2" />
        <input ref={passwordRef} type="password" placeholder="Password" required className="form-control mb-3" />
        <button type="submit" className="btn btn-primary w-100">Sign Up</button>
      </form>

      <div className="d-flex align-items-center gap-2 my-3">
        <hr className="flex-grow-1" />
        <span className="text-muted small">or</span>
        <hr className="flex-grow-1" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignup}
        className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
      >
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
          <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
          <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
          <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l6.19 5.238C39.902 36.777 44 30.833 44 24c0-1.341-.138-2.65-.389-3.917z"/>
        </svg>
        Continue with Google
      </button>

      <p className="text-center mt-3 mb-0 small">
        Already have an account? <a href="/login">Log in</a>
      </p>
    </div>
  );
}