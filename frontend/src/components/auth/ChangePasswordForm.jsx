import { useState } from 'react';
import { FiCheckCircle, FiCircle } from 'react-icons/fi';
import Input from '../common/Input';
import Button from '../common/Button';
import useChangePassword from '../../hooks/useChangePassword';

const ChangePasswordForm = () => {
  const { handleChangePassword, isLoading, error, success } = useChangePassword();

  const [formData, setFormData] = useState({ 
    currentPassword: '', 
    newPassword: '',
    confirmPassword: ''
  });

  const [localError, setLocalError] = useState(null);

  // Password rules validation logic
  const rules = [
    { label: 'At least 8 characters', test: (val) => val.length >= 8 },
    { label: 'Contains uppercase letter', test: (val) => /[A-Z]/.test(val) },
    { label: 'Contains lowercase letter', test: (val) => /[a-z]/.test(val) },
    { label: 'Contains a number', test: (val) => /[0-9]/.test(val) },
    { label: 'Contains special character (@$!%*?&)', test: (val) => /[@$!%*?&]/.test(val) },
  ];

  const getSatisifedCount = () => rules.filter(r => r.test(formData.newPassword)).length;
  const isAllSatisfied = getSatisifedCount() === rules.length;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!isAllSatisfied) {
      setLocalError("Please satisfy all password security rules");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setLocalError("New passwords do not match");
      return;
    }

    await handleChangePassword({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword
    });
  };

  return (
    <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit}>

      {(error || localError) && (
        <div
          role="alert"
          className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-center gap-2 animate-in fade-in duration-300"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error || localError}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="bg-emerald-50 text-emerald-600 p-3 rounded-lg text-sm border border-emerald-100 flex items-center gap-2 animate-in fade-in duration-300"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Password updated! Redirecting to dashboard...
        </div>
      )}

      <Input
        id="currentPassword"
        type="password"
        label="Current Password"
        placeholder="••••••••"
        value={formData.currentPassword}
        onChange={handleChange}
        autoComplete="current-password"
        required
        disabled={success}
      />

      <div className="flex flex-col gap-3">
        <Input
          id="newPassword"
          type="password"
          label="New Password"
          placeholder="••••••••"
          value={formData.newPassword}
          onChange={handleChange}
          autoComplete="new-password"
          required
          disabled={success}
        />

        {/* ── Password Security Rules UI ── */}
        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100/50 flex flex-col gap-2.5">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Security Standards</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            {rules.map((rule, idx) => {
              const satisfied = rule.test(formData.newPassword);
              return (
                <div 
                  key={idx} 
                  className={`flex items-center gap-2 transition-all duration-300 ${satisfied ? 'text-emerald-600' : 'text-neutral-400 opacity-60'}`}
                >
                  {satisfied ? <FiCheckCircle size={14} className="flex-shrink-0" /> : <FiCircle size={14} className="flex-shrink-0" />}
                  <span className={`text-xs font-medium ${satisfied ? 'font-bold' : ''}`}>{rule.label}</span>
                </div>
              );
            })}
          </div>
          
          {/* Progress Bar Utility */}
          <div className="mt-2 h-1 w-full bg-neutral-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${isAllSatisfied ? 'bg-emerald-500' : 'bg-brand-500'}`}
              style={{ width: `${(getSatisifedCount() / rules.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <Input
        id="confirmPassword"
        type="password"
        label="Confirm New Password"
        placeholder="••••••••"
        value={formData.confirmPassword}
        onChange={handleChange}
        autoComplete="new-password"
        required
        disabled={success}
      />

      <Button
        type="submit"
        fullWidth
        isLoading={isLoading}
        variant={isAllSatisfied ? 'primary' : 'secondary'}
        className="mt-4 h-12 text-[15px] font-semibold rounded-xl"
        disabled={success || !isAllSatisfied}
      >
        {!isAllSatisfied ? 'Complete Security Rules' : 'Update Password'}
      </Button>

    </form>
  );
};

export default ChangePasswordForm;
