"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const DEFAULT_USER: User = {
  id: '',
  username: '',
  displayName: '',
  email: '',
  avatarUrl: '',
  coverUrl: '',
  bio: '',
  title: '',
  location: '',
  website: '',
  joinedDate: '',
  isVerified: false,
  role: 'member',
  status: 'offline',
  stats: {
    postsCount: 0,
    followersCount: 0,
    followingCount: 0,
    friendsCount: 0,
  },
  pinnedCommunities: [],
};

interface AuthContextType {
  currentUser: User;
  isAuthenticated: boolean;
  isLoading: boolean;
  switchPersona: (userId: string) => void;
  updateProfile: (updates: Partial<User>) => void;
  login: (email: string, pass: string) => Promise<boolean>;
  loginWithGoogle: (credential: string) => Promise<void>;
  signup: (details: { displayName: string; username: string; email: string; password?: string }) => Promise<boolean>;
  logout: () => void;
  availableUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  const availableUsers = [currentUser];

  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem("nexus_auth_session");
      const savedUserJson = localStorage.getItem("nexus_user_profile");
      if (savedAuth === "true") {
        setIsAuthenticated(true);
        if (savedUserJson) {
          try {
            const parsed = JSON.parse(savedUserJson);
            if (parsed && parsed.id) {
              setCurrentUser(parsed);
            }
          } catch {}
        }
      }
    } catch {
      // ignore localStorage errors in SSR or restricted environments
    }
    setMounted(true);
  }, []);

  const switchPersona = (userId: string) => {
    // No-op in zero-demo mode
  };

  const updateProfile = (updates: Partial<User>) => {
    setCurrentUser((prev) => {
      const updated = {
        ...prev,
        ...updates,
        stats: {
          ...prev.stats,
          ...(updates.stats || {}),
        },
      };
      try {
        localStorage.setItem("nexus_user_profile", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const loginWithGoogle = useCallback(async (credential: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Google login failed");
      }
      const { access_token } = await res.json();
      // Fetch the full user profile using the token
      const profileRes = await fetch(`${API_URL}/api/v1/users/me`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const profile = profileRes.ok ? await profileRes.json() : null;
      const loggedInUser: User = profile
        ? {
            id: String(profile.user_id ?? profile.id),
            username: profile.username ?? "",
            displayName: profile.full_name ?? profile.username ?? "",
            email: profile.email ?? "",
            avatarUrl: profile.profile_image_url ?? "",
            coverUrl: profile.cover_image_url ?? "",
            bio: profile.bio ?? "",
            title: profile.title ?? "",
            location: profile.location ?? "",
            website: profile.website ?? "",
            joinedDate: profile.created_at ?? "",
            isVerified: profile.is_verified ?? false,
            role: profile.role ?? "member",
            status: "online",
            stats: {
              postsCount: profile.posts_count ?? 0,
              followersCount: profile.followers_count ?? 0,
              followingCount: profile.following_count ?? 0,
              friendsCount: profile.friends_count ?? 0,
            },
          }
        : { ...DEFAULT_USER, email: "" };
      setCurrentUser(loggedInUser);
      try {
        localStorage.setItem("nexus_access_token", access_token);
        localStorage.setItem("nexus_auth_session", "true");
        localStorage.setItem("nexus_user_profile", JSON.stringify(loggedInUser));
      } catch {}
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // 1. Attempt backend login via OAuth2 Password Request
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", pass);

      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      if (res.ok) {
        const { access_token } = await res.json();
        const profileRes = await fetch(`${API_URL}/api/v1/users/me`, {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        const profile = profileRes.ok ? await profileRes.json() : null;
        const loggedInUser: User = profile
          ? {
              id: String(profile.user_id ?? profile.id),
              username: profile.username ?? email.split("@")[0].toLowerCase(),
              displayName: profile.full_name ?? email.split("@")[0],
              email: profile.email ?? email,
              avatarUrl: profile.profile_image_url ?? "",
              coverUrl: profile.cover_image_url ?? "",
              bio: profile.bio ?? "",
              title: profile.title ?? "",
              location: profile.location ?? "",
              website: profile.website ?? "",
              joinedDate: profile.created_at ?? new Date().toISOString(),
              isVerified: profile.is_verified ?? false,
              role: profile.role ?? "member",
              status: "online",
              stats: {
                postsCount: profile.posts_count ?? 0,
                followersCount: profile.followers_count ?? 0,
                followingCount: profile.following_count ?? 0,
                friendsCount: profile.friends_count ?? 0,
              },
            }
          : { ...DEFAULT_USER, email, displayName: email.split("@")[0] };

        setCurrentUser(loggedInUser);
        try {
          localStorage.setItem("nexus_access_token", access_token);
          localStorage.setItem("nexus_auth_session", "true");
          localStorage.setItem("nexus_user_profile", JSON.stringify(loggedInUser));
          localStorage.setItem("nexus_user_id", loggedInUser.id);
        } catch {}
        setIsAuthenticated(true);
        return true;
      } else {
        const err = await res.json().catch(() => ({ detail: "Invalid email or password" }));
        throw new Error(err.detail || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login Error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const signup = useCallback(async ({
    displayName,
    username,
    email,
    password = "password123",
  }: {
    displayName: string;
    username: string;
    email: string;
    password?: string;
  }): Promise<boolean> => {
    setIsLoading(true);
    try {
      // 1. Attempt backend registration
      const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, "");
      const res = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: displayName,
          username: cleanUsername,
          email,
          password,
        }),
      });

      if (res.ok) {
        // Automatically log in after registration
        return await login(email, password);
      } else {
        const err = await res.json().catch(() => ({ detail: "Registration failed" }));
        throw new Error(err.detail || "Registration failed");
      }
    } catch (err) {
      console.error("Signup Error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  const logout = () => {
    try {
      localStorage.removeItem("nexus_auth_session");
      localStorage.removeItem("nexus_access_token");
      localStorage.removeItem("nexus_user_id");
      localStorage.removeItem("nexus_user_profile");
    } catch {}
    setCurrentUser(DEFAULT_USER);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isLoading,
        switchPersona,
        updateProfile,
        login,
        loginWithGoogle,
        signup,
        logout,
        availableUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
