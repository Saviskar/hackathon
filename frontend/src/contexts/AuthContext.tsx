import React, { createContext, useContext, useState, useEffect } from 'react';
import {supabase } from '@/lib/supabaseClient';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token on mount
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
  setIsLoading(true);

  try {
    // Supabase login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Login failed');
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id) // assuming the user ID in user_profiles matches Supabase Auth ID
      .single();

    if (profileError || !profile) {
      throw new Error(profileError?.message || 'User profile not found');
    }

    const user: User = {
      id: authData.user.id,
      email: authData.user.email ?? '',
      full_name: profile.name,
      role: profile.role, // e.g., 'admin' or 'lecturer'
      department: profile.department,
    };

    localStorage.setItem('auth_token', authData.session?.access_token || '');
    localStorage.setItem('auth_user', JSON.stringify(user));
    setUser(user);

  // eslint-disable-next-line no-useless-catch
  } catch (error) {
    throw error;
  } finally {
    setIsLoading(false);
  }
};

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};