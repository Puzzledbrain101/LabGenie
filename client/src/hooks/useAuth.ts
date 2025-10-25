import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
}

export function useAuth() {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user: user || undefined,
    isLoading,
    isAuthenticated: !!user,
  };
}