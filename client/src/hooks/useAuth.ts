import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Debug logs
  console.log('🔧 [useAuth] Hook state:', { 
    user, 
    isLoading, 
    error,
    isAuthenticated: !!user,
    token: localStorage.getItem('token') ? 'Present' : 'Missing',
    tokenValue: localStorage.getItem('token') ? localStorage.getItem('token')?.substring(0, 20) + '...' : 'None'
  });

  return {
    user: user || undefined,
    isLoading,
    isAuthenticated: !!user,
  };
}