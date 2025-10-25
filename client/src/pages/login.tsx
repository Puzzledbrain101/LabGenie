import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlaskConical } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function Login() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔐 [CLIENT] Login button clicked!');
    console.log('🔐 [CLIENT] Login data:', loginData);
    
    setIsLoading(true);

    try {
      console.log('🔐 [CLIENT] Making login API request...');
      const response = await apiRequest('POST', '/api/auth/login', loginData);
      console.log('🔐 [CLIENT] Login API response:', response);
      
      const { user, token } = response;
      
      // Store the token
      localStorage.setItem('token', token);
      console.log('🔐 [CLIENT] Token stored in localStorage');
      
      toast({
        title: 'Login successful',
        description: `Welcome back, ${user.firstName}!`,
      });
      
      console.log('🔐 [CLIENT] Redirecting to editor...');
      // Redirect to the editor - NO RELOAD NEEDED
      window.location.href = '/';
    } catch (error: any) {
      console.log('🔐 [CLIENT] Login API error:', error);
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid email or password',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔐 [CLIENT] Register button clicked!');
    console.log('🔐 [CLIENT] Register data:', registerData);
    
    setIsLoading(true);

    try {
      console.log('🔐 [CLIENT] Making register API request...');
      const response = await apiRequest('POST', '/api/auth/register', registerData);
      console.log('🔐 [CLIENT] Register API response:', response);
      
      const { user, token } = response;
      
      // Store the token
      localStorage.setItem('token', token);
      console.log('🔐 [CLIENT] Token stored in localStorage');
      
      toast({
        title: 'Registration successful',
        description: `Welcome to AutoLab, ${user.firstName}!`,
      });
      
      console.log('🔐 [CLIENT] Redirecting to editor...');
      // Redirect to the editor - NO RELOAD NEEDED
      window.location.href = '/';
    } catch (error: any) {
      console.log('🔐 [CLIENT] Register API error:', error);
      toast({
        title: 'Registration failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FlaskConical className="h-10 w-10 text-primary" />
            <div className="text-left">
              <h1 className="text-2xl font-bold text-foreground">
                {t('app.title')}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t('app.tagline')}
              </p>
            </div>
          </div>
        </div>

        {/* Login/Register Card */}
        <Card className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            {/* Register Form */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-firstName">First Name</Label>
                    <Input
                      id="register-firstName"
                      type="text"
                      placeholder="First name"
                      value={registerData.firstName}
                      onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-lastName">Last Name</Label>
                    <Input
                      id="register-lastName"
                      type="text"
                      placeholder="Last name"
                      value={registerData.lastName}
                      onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="Enter your email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                    <Input
                    id="register-password"
                    type="password"
                    placeholder="Create a password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}