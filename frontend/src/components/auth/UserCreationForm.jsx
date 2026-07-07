import { useState } from 'react';
import { FiUser, FiMail, FiLock, FiShield, FiPlusCircle, FiCheck, FiXCircle } from 'react-icons/fi';
import Input from '../common/Input';
import Button from '../common/Button';
import useUsers from '../../hooks/useUsers';

const UserCreationForm = ({ onSuccess }) => {
  const { handleCreateUser, isLoading, error, success: localSuccess, successMessage, setSuccess, setSuccessMessage } = useUsers();

  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'user' 
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        await handleCreateUser(formData);
        if (onSuccess) onSuccess();
        setFormData({ name: '', email: '', password: '', role: 'user' });
    } catch (err) {
        // Error handled in hook
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group">
      
      {/* ── Background Illustration (Faint) ── */}
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
        <FiPlusCircle size={200} />
      </div>

      <div className="relative">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-indigo-50 text-brand-600 rounded-2xl flex items-center justify-center">
            <FiPlusCircle size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Create User</h2>
            <p className="text-neutral-400 text-sm font-medium">Add a new user or supervisor to the system</p>
          </div>
        </div>

        {/* ── Status Messages ── */}
        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <FiXCircle size={18} className="flex-shrink-0" />
            <p className="text-sm font-bold tracking-tight">{error}</p>
          </div>
        )}

        {localSuccess && (
          <div className="mb-6 bg-emerald-50 text-emerald-600 p-4 rounded-xl border border-emerald-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <FiCheck size={18} className="flex-shrink-0" />
            <p className="text-sm font-bold tracking-tight">{successMessage || 'Account created successfully!'}</p>
          </div>
        )}

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="name"
              label={<>Full Name <span className="text-rose-500 text-[12px]">*</span></>}
              placeholder="e.g. John Doe"
              icon={FiUser} 
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Input
              id="email"
              type="email"
              label={<>Email Address <span className="text-rose-500 text-[12px]">*</span></>}
              placeholder="e.g. john@example.com"
              icon={FiMail}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="password"
              type="password"
              label={<>Temporary Password <span className="text-rose-500 text-[12px]">*</span></>}
              placeholder="••••••••"
              icon={FiLock}
              value={formData.password}
              onChange={handleChange}
              required
            />
            
            {/* ── Custom Role Selection UI ── */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold  px-1">
                Access Role <span className="text-rose-500 text-[12px]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3 h-12">
                {['user', 'supervisor'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, role }))}
                    className={`
                      flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all duration-200 border
                      ${formData.role === role 
                        ? 'bg-brand-50 border-brand-200 text-brand-600 shadow-sm shadow-brand-100' 
                        : 'bg-white border-neutral-100 text-neutral-400 hover:bg-neutral-50'
                      }
                    `}
                  >
                    <FiShield size={16} />
                    <span className="uppercase">{role}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-6 border-t border-neutral-50 flex justify-end items-center gap-4">
            <button 
              type="button" 
              onClick={() => { setFormData({ name: '', email: '', password: '', role: 'user' }); setSuccess(false); setSuccessMessage(''); }}
              className="text-neutral-400 text-sm font-bold hover:text-neutral-900 transition-colors"
            >
              Reset Fields
            </button>
            <Button
              type="submit"
              isLoading={isLoading}
              className="h-12 px-10 text-[15px] font-semibold bg-[#5B58EB] hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all duration-200"
            >
              Create Account
              <FiCheck size={18} />
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default UserCreationForm;