import { motion } from 'framer-motion';
import LoginForm from '../../components/auth/LoginForm';

const LoginPage = () => {
  return (
    <div className="flex flex-col justify-center items-center pb-20 w-full min-h-[calc(100vh-100px)] relative px-4">
      {/* Background Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#123689]/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-[440px]"
      >
        {/* Header Content */}
        <div className="space-y-2 mb-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#a8ccdf]/30 text-[#123689] mb-4 shadow-sm"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
            Institutional Access
          </h2>
          <p className="text-slate-500 text-[15px] leading-relaxed max-w-sm mx-auto font-medium">
            Enter your credentials to manage exchange rates and administrative functions.
          </p>
        </div>

        {/* Form Container */}
        <div className="relative bg-white/70 backdrop-blur-2xl p-8 sm:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] box-border border border-white/80 ring-1 ring-slate-100 overflow-hidden">
          {/* subtle interior gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#123689] to-[#1d4bb7]"></div>
          
          <LoginForm />
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
