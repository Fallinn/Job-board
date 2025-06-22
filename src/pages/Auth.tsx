
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/auth/AuthForm';
import { Navigate } from 'react-router-dom';

export const Auth = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-500 to-cyan-400 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <AuthForm />;
};
