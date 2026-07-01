import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Login() {
  const [nim, setNim] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(nim, password);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-md">
      <Card className="w-full max-w-[400px]">
        <div className="mb-xl text-center">
          <h1 className="text-primary mb-xs">Welcome Back</h1>
          <p className="text-secondary text-body-sm">Sign in to NexusEdu Dashboard</p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-md">
          <Input 
            label="NIM / Email" 
            id="nim"
            value={nim}
            onChange={(e) => setNim(e.target.value)}
            placeholder="1301190001"
            required
            autoComplete="username"
          />
          <Input 
            label="Password" 
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
          
          <Button type="submit" className="mt-sm" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
