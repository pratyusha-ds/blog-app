"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AuthContextType = {
  isAuthenticated: boolean;
  token: string | null;
  username: string | null;
  displayName: string | null;
  userId: string | null;
  login: (
    token: string,
    userId: string,
    username: string,
    displayName: string
  ) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  token: null,
  username: null,
  displayName: null,
  userId: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUsername = localStorage.getItem("authUsername");
    const storedDisplayName = localStorage.getItem("authDisplayName");
    const storedUserId = localStorage.getItem("authUserId");

    if (storedToken && storedUsername && storedDisplayName && storedUserId) {
      setToken(storedToken);
      setUsername(storedUsername);
      setDisplayName(storedDisplayName);
      setUserId(storedUserId);
    }
  }, []);

  const login = (
    newToken: string,
    newUserId: string,
    newUsername: string,
    newDisplayName: string
  ) => {
    localStorage.setItem("authToken", newToken);
    localStorage.setItem("authUsername", newUsername);
    localStorage.setItem("authDisplayName", newDisplayName);
    localStorage.setItem("authUserId", newUserId);

    setToken(newToken);
    setUsername(newUsername);
    setDisplayName(newDisplayName);
    setUserId(newUserId);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUsername");
    localStorage.removeItem("authDisplayName");
    localStorage.removeItem("authUserId");

    setToken(null);
    setUsername(null);
    setDisplayName(null);
    setUserId(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        token,
        username,
        displayName,
        userId,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
