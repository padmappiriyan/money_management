import { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import useAuth from '../../hooks/useAuth';

const LoginForm = () => {
  const { handleLogin, isLoading, error: authError } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleLogin(formData);
  };

  return (
    <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit}>

      {authError && (
        <div
          role="alert"
          className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-center gap-2 animate-in fade-in duration-300"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {authError}
        </div>
      )}

      <Input
        id="email"
        type="email"
        label="Email Address"
        placeholder="admin@example.com"
        value={formData.email}
        onChange={handleChange}
        autoComplete="email"
        required
      />

      <Input
        id="password"
        type="password"
        label="Password"
        placeholder="••••••••"
        value={formData.password}
        onChange={handleChange}
        autoComplete="current-password"
        required
      />

      <Button
        type="submit"
        fullWidth
        isLoading={isLoading}
        className="mt-4 h-14 text-[16px] font-bold bg-[#123689] hover:bg-[#1d4bb7] text-white rounded-2xl shadow-[0_8px_20px_rgba(18,54,137,0.25)] hover:shadow-[0_8px_25px_rgba(18,54,137,0.4)] flex items-center justify-center gap-2 group transition-all duration-300 active:scale-[0.98]"
      >
        <span>Access Dashboard</span>
        <svg
          className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </Button>

    </form>
  );
};

export default LoginForm;
