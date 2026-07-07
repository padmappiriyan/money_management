import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/authApi';
import { useAuthContext } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const useAuth = () => {
  const { setCredentials } = useAuthContext();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (credentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const userInfo = await loginUser(credentials);
      setCredentials(userInfo);

      if (userInfo.isPasswordResetRequired) {
        navigate('/auth/change-password');
      } else {
        navigate('/dashboard');
      }
      toast.success(`Access granted! Welcome back, ${userInfo.name}.`);
    } catch (err) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading, error };
};

export default useAuth;
