"use client";
import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import axios from "axios";
import { UserPayload } from "../types/user";

interface IDefaultAuthContext {
  currentUser: UserPayload | null | undefined;
  loading: boolean;
  updateCurrentUser: () => Promise<void>;
}

const defaultAuthContext: IDefaultAuthContext = {
  currentUser: null,
  loading: true,
  updateCurrentUser: () => Promise.resolve(),
};

const AuthContext = createContext(defaultAuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/users/current-user", {
        withCredentials: true,
      });
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
