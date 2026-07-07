import React from 'react';
import ChangePasswordForm from '../../components/auth/ChangePasswordForm';
import LogoMain from '../../assets/Logo/logo.png';
import { FiShield, FiLock } from 'react-icons/fi';

const ChangePasswordPage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] font-sans text-slate-900 p-4 sm:p-8">
      
      {/* Premium Centered Card */}
      <div className="w-full max-w-[900px] bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative">
        
        {/* Subtle top accent gradient */}
        <div className="h-2 w-full bg-gradient-to-r from-brand-400 via-indigo-500 to-brand-600"></div>
        
        <div className="p-8 sm:p-10 md:p-12 flex flex-col md:flex-row gap-10 lg:gap-14 items-center">
          
          {/* ── Left Side: Identity & Context ── */}
          <div className="w-full md:w-[45%] flex flex-col justify-center">
            
            {/* Logo & Header */}
            <div className="flex flex-col items-start text-left mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-brand-50 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-sm border border-brand-100/50">
                <FiLock className="w-9 h-9 text-brand-600 stroke-[2.5]" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-3 leading-[1.1]">
                Secure Your <br className="hidden md:block"/> Account
              </h2>
              <p className="text-slate-500 text-[15px] font-medium leading-relaxed max-w-sm">
                Please finalize your setup by securing your password to ensure enterprise-grade protection.
              </p>
            </div>

            {/* Info Banner */}
            <div className="bg-brand-50/50 p-4 rounded-xl border border-brand-100 flex items-start gap-4 shadow-sm">
              <div className="bg-white p-2 rounded-lg shadow-sm border border-brand-50 shrink-0">
                 <FiShield className="text-brand-500 text-lg" />
              </div>
              <p className="text-brand-700 text-[12px] font-semibold leading-relaxed mt-0.5">
                The administrator configured a temporary password. For complete data protection, please finalize your vault setup.
              </p>
            </div>
            
          </div>

          {/* ── Right Side: Form Injection ── */}
          <div className="w-full md:w-[55%] relative">
               <ChangePasswordForm />
          </div>
          
        </div>
      </div>

      {/* Footer minimal */}
      <div className="mt-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
        &copy; {new Date().getFullYear()} MTTMS Financial Corp.
      </div>
    </div>
  );
};

export default ChangePasswordPage;
