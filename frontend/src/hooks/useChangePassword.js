import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../api/authApi';
import { useAuthContext } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const useChangePassword = () => {
    const navigate = useNavigate();
    const { setCredentials, userInfo } = useAuthContext();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChangePassword = async (payload) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await changePassword(payload);
            setSuccess(true);
            
            if (userInfo) {
                const updatedUser = { ...userInfo, isPasswordResetRequired: false };
                setCredentials(updatedUser);
            }
            toast.success('Identity vault updated! Your new password is now active.');
            
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (err) {
            const msg = err.message || 'Failed to update password. Please try again.';
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return { handleChangePassword, isLoading, error, success };
};

export default useChangePassword;
