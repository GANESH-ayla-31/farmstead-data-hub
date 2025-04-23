
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from 'sonner';

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
  // Pre-registered test user
  'test@example.com': {
    email: 'test@example.com',
    password: 'password123',
    id: '123456',
    name: 'Test User'
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<DummyUser | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    // Check for stored user in localStorage
    const checkLoggedInStatus = () => {
      try {
        const storedUser = localStorage.getItem('farmtrack_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedInStatus();
  }, []);

  // Helper function to ensure a farmer record exists for the user
  const ensureFarmerExists = async (userId: string, email: string, name: string) => {
    if (!isConfigured) return null;

    try {
      // Check if farmer record already exists
      const { data: existingFarmer, error: checkError } = await supabase
        .from('farmers')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) throw checkError;

      // If farmer doesn't exist, create one
      if (!existingFarmer) {
        const { data: newFarmer, error: insertError } = await supabase
          .from('farmers')
          .insert({
            user_id: userId,
            name: name,
            email: email,
            contact_number: '000-000-0000', // Default placeholder
            address: 'No address provided' // Default placeholder
          })
          .select('id')
          .single();

        if (insertError) throw insertError;
        
        return newFarmer.id;
      }
      
      return existingFarmer.id;
    } catch (error) {
      console.error('Error ensuring farmer exists:', error);
      toast.error('Failed to create farmer profile');
      return null;
    }
  };

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

      // Ensure farmer record exists in Supabase
      await ensureFarmerExists(dummyUser.id, dummyUser.email, dummyUser.name);
      
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

      // Generate a unique ID
      const newId = Date.now().toString();

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

      // Ensure farmer record exists in Supabase
      await ensureFarmerExists(dummyUser.id, dummyUser.email, dummyUser.name);
      
      toast.success('Account created successfully!');
    } catch (error) {
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
