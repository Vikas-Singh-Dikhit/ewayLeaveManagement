import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, ROLE_LABELS } from '@/types/leave';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarDays, Users, UserCheck, Building, ShieldCheck, Briefcase } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const demoAccounts: { role: UserRole; email: string; icon: React.ElementType }[] = [
  { role: 'employee', email: 'john@company.com', icon: Briefcase },
  { role: 'team_lead', email: 'sarah@company.com', icon: Users },
  { role: 'manager', email: 'michael@company.com', icon: UserCheck },
  { role: 'director', email: 'emily@company.com', icon: Building },
  { role: 'hr_admin', email: 'admin@company.com', icon: ShieldCheck },
];

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await login(email, password);
    
    if (success) {
      toast({ title: 'Welcome back!', description: 'You have been logged in successfully.' });
      navigate('/dashboard');
    } else {
      toast({ title: 'Login failed', description: 'Invalid email or password.', variant: 'destructive' });
    }
    
    setIsLoading(false);
  };

  const handleQuickLogin = async (email: string) => {
    setIsLoading(true);
    const success = await login(email, 'demo');
    if (success) {
      toast({ title: 'Welcome!', description: 'Logged in with demo account.' });
      navigate('/dashboard');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/20 p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-primary mb-4">
            <CalendarDays className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">LeaveMS</h1>
          <p className="text-muted-foreground mt-1">Leave Management System</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Login */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Demo Accounts</CardTitle>
            <CardDescription className="text-xs">Click to login as any role</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {demoAccounts.map(({ role, email, icon: Icon }) => (
              <Button
                key={role}
                variant="outline"
                size="sm"
                className="justify-start gap-2"
                onClick={() => handleQuickLogin(email)}
                disabled={isLoading}
              >
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-xs">{ROLE_LABELS[role]}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
