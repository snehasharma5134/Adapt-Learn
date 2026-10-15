import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserProfile, SystemStatus } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  systemStatus: SystemStatus | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateProfileState: (updated: Partial<UserProfile>) => void;
  refreshProfile: () => Promise<void>;
  refreshSystemStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('companion_token'));
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  useEffect(() => {
    // Check system status
    api.getSystemStatus()
      .then(setSystemStatus)
      .catch((err) => console.warn('Could not fetch system status:', err));

    // Restore user session if token exists
    if (token) {
      api.getMe()
        .then((userData) => {
          setUser(userData);
          if (userData.profile) {
            setProfile(userData.profile);
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    localStorage.setItem('companion_token', res.access_token);
    setToken(res.access_token);
    const userData = await api.getMe();
    setUser(userData);
    if (userData.profile) {
      setProfile(userData.profile);
    }
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    localStorage.setItem('companion_token', res.access_token);
    setToken(res.access_token);
    const userData = await api.getMe();
    setUser(userData);
    if (userData.profile) {
      setProfile(userData.profile);
    }
  };

  const logout = () => {
    localStorage.removeItem('companion_token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const updateProfileState = (updated: Partial<UserProfile>) => {
    if (profile) {
      setProfile({ ...profile, ...updated });
    }
  };

  const refreshProfile = async () => {
    if (token) {
      const prof = await api.getProfile();
      setProfile(prof);
    }
  };

  const refreshSystemStatus = async () => {
    try {
      const status = await api.getSystemStatus();
      setSystemStatus(status);
    } catch (err) {
      console.warn('Could not refresh system status:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        systemStatus,
        login,
        register,
        logout,
        updateProfileState,
        refreshProfile,
        refreshSystemStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
