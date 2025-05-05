
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../lib/types';
import { fakeDb } from '../lib/fakeDb';
import { useToast } from '../hooks/use-toast';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (user: Omit<User, 'id'>) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const user = await fakeDb.auth.login(email, password);
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        toast({
          title: 'Login successful',
          description: `Welcome back, ${user.name}!`,
        });
        return true;
      }
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: 'Invalid email or password.',
      });
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: 'An error occurred during login.',
      });
      return false;
    }
  };

  const register = async (userData: Omit<User, 'id'>): Promise<boolean> => {
    try {
      const existingUser = await fakeDb.users.findByEmail(userData.email);
      if (existingUser) {
        toast({
          variant: 'destructive',
          title: 'Registration failed',
          description: 'An account with this email already exists.',
        });
        return false;
      }

      const newUser = await fakeDb.users.create(userData);
      setCurrentUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      toast({
        title: 'Registration successful',
        description: `Welcome, ${newUser.name}!`,
      });
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: 'An error occurred during registration.',
      });
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    toast({
      title: 'Logged out successfully',
    });
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
