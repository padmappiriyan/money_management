import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { logoutUser } from '../api/authApi';
import { useAuthContext } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const useLogout = () => {
  const { clearCredentials } = useAuthContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      clearCredentials();
      queryClient.clear(); // Clear all react query caches
      toast.success('Logged out successfully. Securely session terminated.');
      navigate('/login');
    }
  };

  return { handleLogout };
};

export default useLogout;
