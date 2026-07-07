import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(({ label, id, error, icon: Icon, type = 'text', className = '', ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const isPassword = type === 'password';
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const currentType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full flex flex-col gap-1.5 focus-within:text-brand-600 text-neutral-600 transition-colors">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-neutral-800">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-brand-600 transition-colors pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        <input
          id={id}
          ref={ref}
          type={currentType}
          className={`
            w-full py-3 rounded-lg border bg-white
            text-neutral-900 placeholder:text-neutral-400
            transition-all duration-200 outline-none
            focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500
            ${Icon ? 'pl-11 pr-11' : isPassword ? 'pl-4 pr-11' : 'px-4'}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-neutral-200 shadow-sm'}
            ${className}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

