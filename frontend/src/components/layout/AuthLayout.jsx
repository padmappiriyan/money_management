import LoginBg from '../../assets/login/Login.png';
import { ShieldCheck } from 'lucide-react';
import LogoMain from '../../assets/Logo/logo.png';

const AuthLayout = ({ children, title = '', subtitle = '' }) => {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans text-slate-900">

      {/* ── Left Section: Identity Showcase ── */}
      <div className="hidden lg:flex lg:w-[50%] xl:w-[55%] relative overflow-hidden h-screen sticky top-0">
        {/* Background Image with optimized fit */}
        <div className="absolute inset-0 z-0">
          <img
            src={LoginBg}
            alt="Institutional Assets"
            className="w-full h-full object-cover select-none"
          />
          {/* Subtle vignette for content readability */}
          <div className="absolute inset-0 " />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 w-full flex flex-col justify-between p-12 xl:p-16">
          {/* Top Branding */}
          <div className="flex items-center gap-3 text-white">
            <div className="w-32 h-32  rounded-xl flex items-center justify-center border border-white/30 shadow-xl overflow-hidden">
              <img src={LogoMain} alt="MTTMS" className="w-32 h-32 object-contain" />
            </div>

          </div>

          {/* Core Value Proposition */}
          <div className="max-w-xl">
            <h1 className="text-5xl xl:text-6xl font-bold text-white mb-6 leading-[1.15] tracking-tight">
              Institutional Grade <br />
              <span className="text-white/90">Digital Assets.</span>
            </h1>
            <p className="text-lg text-white/70 leading-relaxed font-medium">
              The architectural vault for enterprise financial operations. Secure, transparent, and built for the future of global capital.
            </p>
          </div>


        </div>
      </div>

      {/* ── Right Section: Secure Entry ── */}
      <div className="w-full lg:w-[50%] xl:w-[45%] min-h-screen flex flex-col bg-white overflow-y-auto">

        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-950">
            <img src={LogoMain} alt="MTTMS" className="w-10 h-10 object-contain" />
            <span className="font-bold text-lg">MTTMS</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex flex-col justify-center items-center px-8 sm:px-16 lg:px-24 py-16">
          <div className="w-full max-w-[440px]">
            {/* Form Logo */}
            <div className="mb-8">
              <img src={LogoMain} alt="MTTMS Logo" className="w-24 h-24 object-contain" />
            </div>

            {/* Dynamic Content */}
            <div className="space-y-1 mb-10">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                {title || 'Access Your Ledger'}
              </h2>
              <p className="text-slate-500 text-[15px] leading-relaxed">
                {subtitle || 'Enter your institutional credentials to securely manage assets.'}
              </p>
            </div>

            {/* Children Component (Form) */}
            <div className="relative">
              {children}
            </div>


          </div>
        </div>

        {/* Global Footer (Right) */}
        <div className="px-8 sm:px-16 lg:px-24 py-8 border-t border-slate-50 mt-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[11px] text-slate-400 font-medium">
              &copy; {new Date().getFullYear()} MTTMS Financial Corp.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-[11px] text-slate-500 hover:text-slate-900 font-bold transition-colors uppercase tracking-widest">Privacy Policy</a>
              <a href="#" className="text-[11px] text-slate-500 hover:text-slate-900 font-bold transition-colors uppercase tracking-widest">Security Center</a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;
