
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, verifyDatabaseConnection } from '@/lib/supabase';
import { toast } from 'sonner';
import { v4 as uuidv4 } from '@/lib/uuid-helper';

// Dummy user interface
interface DummyUser {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: DummyUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  isConfigured: boolean;
}

// Store registered users locally during session
const localUsers: Record<string, {email: string; password: string; id: string; name: string}> = {
  // Pre-registered test user with UUID format
  'test@example.com': {
    email: 'test@example.com',
    password: 'password123',
    id: '123e4567-e89b-12d3-a456-426614174000', // UUID format
    name: 'Test User'
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<DummyUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    // Test database connectivity on mount
    const testConnection = async () => {
      if (isConfigured) {
        const connected = await verifyDatabaseConnection();
        setDbConnected(connected);
        console.log('Database connection test result:', connected);
      }
    };
    
    testConnection();
    
    // Check for stored user in localStorage
    const checkLoggedInStatus = async () => {
      try {
        const storedUser = localStorage.getItem('farmtrack_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedInStatus();
  }, [isConfigured]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Check if user exists in our local record
      const userRecord = localUsers[email.toLowerCase()];
      
      if (!userRecord || userRecord.password !== password) {
        throw new Error('Invalid email or password');
      }

      // Create a dummy user object
      const dummyUser = {
        id: userRecord.id,
        email: userRecord.email,
        name: userRecord.name
      };

      // Store in localStorage for persistence
      localStorage.setItem('farmtrack_user', JSON.stringify(dummyUser));
      setUser(dummyUser);
      
      toast.success('Signed in successfully!');
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Invalid email or password. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string = 'New Farmer') => {
    setLoading(true);
    try {
      // Check if email already exists
      if (localUsers[email.toLowerCase()]) {
        throw new Error('Email already in use');
      }

      // Generate a UUID for the new user
      const newId = uuidv4();
      console.log('Generated UUID for new user:', newId);

      // Register the new user
      localUsers[email.toLowerCase()] = {
        email: email.toLowerCase(),
        password,
        id: newId,
        name
      };

      // Create a dummy user object
      const dummyUser = {
        id: newId,
        email: email.toLowerCase(),
        name
      };

      // Store in localStorage for persistence
      localStorage.setItem('farmtrack_user', JSON.stringify(dummyUser));
      setUser(dummyUser);
      
      toast.success('Account created successfully!');
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error('Failed to create account. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('farmtrack_user');
      setUser(null);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, isConfigured }}>
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
