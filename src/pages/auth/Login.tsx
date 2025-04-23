
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Sprout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, isConfigured } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signIn(email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-farm-green-light to-farm-green p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <Sprout className="h-10 w-10 text-farm-green" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to FarmTrack</CardTitle>
          <CardDescription>
            Enter your credentials to access your farm management system
          </CardDescription>
          <div className="bg-amber-100 text-amber-800 p-3 rounded-md text-sm mt-4">
            <strong>Test Login:</strong> Use email: test@example.com and password: password123
          </div>
          {!isConfigured && (
            <div className="bg-red-100 text-red-800 p-3 rounded-md text-sm mt-2">
              <strong>Warning:</strong> Supabase is not properly configured. Some features may not work correctly.
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Link to="/auth/forgot-password" className="text-sm text-farm-green hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-farm-green hover:bg-farm-green-dark" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/auth/register" className="text-farm-green hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
