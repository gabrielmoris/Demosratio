"use client";
import { createContext, useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";

const defaultAuthContext = {
  currentUser: null,
  loading: true,
  updateCurrentUser: () => Promise.resolve(),
};

const AuthContext = createContext(defaultAuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3002/api/users/currentuser", { withCredentials: true });
      setCurrentUser(response.data.currentUser);
    } catch (error) {
      console.error("Error fetching current user:", error);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const value = {
    currentUser,
    loading,
    updateCurrentUser: fetchCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
