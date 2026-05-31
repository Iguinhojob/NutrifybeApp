import React, { createContext, useContext, useState } from 'react';

export type User = {
  name: string;
  email: string;
  weight: string;
  height: string;
  goal: string;
  targetWeight?: string;
  waterGoal?: string;
  setupDone?: boolean;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  register: (data: User & { password: string }) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string) => {
    if (email && password.length >= 6) {
      setUser({ name: 'Usuário', email, weight: '70', height: '170', goal: 'Perder peso', targetWeight: '65', waterGoal: '2', setupDone: true });
      return true;
    }
    return false;
  };

  const register = (data: User & { password: string }) => {
    const { password, ...userData } = data;
    setUser({ ...userData, setupDone: false });
  };

  const logout = () => setUser(null);

  const updateUser = (data: Partial<User>) => {
    if (user) setUser({ ...user, ...data });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
