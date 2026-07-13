import { createContext, useContext } from "react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const mockValue = {
    currentUser: null,
    signup: async () => {},
    login: async () => {},
    loginWithGoogle: async () => {},
    logout: async () => {},
  };
  return <AuthContext.Provider value={mockValue}>{children}</AuthContext.Provider>;
}