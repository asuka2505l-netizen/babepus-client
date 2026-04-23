import { createContext, useCallback, useEffect, useState } from "react";
import { authService } from "../services/authService";
import { setUnauthorizedHandler } from "../services/api/client";
import { tokenStorage } from "../utils/storage";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => tokenStorage.get());
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentToken = tokenStorage.get();

    if (!currentToken) {
      setIsBootstrapping(false);
      return null;
    }

    try {
      const currentUser = await authService.me();
      setUser(currentUser);
      setToken(currentToken);
      return currentUser;
    } catch {
      logout();
      return null;
    } finally {
      setIsBootstrapping(false);
    }
  }, [logout]);

  const login = async (payload) => {
    const data = await authService.login(payload);
    tokenStorage.set(data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const data = await authService.register(payload);
    tokenStorage.set(data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  useEffect(() => {
    setUnauthorizedHandler(logout);
    refreshUser();
  }, [logout, refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        isBootstrapping,
        login,
        logout,
        refreshUser,
        register,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
