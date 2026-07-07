import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Tooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const isTop = position === 'top';

  return (
    <div 
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: isTop ? 5 : -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: isTop ? 5 : -5 }}
            className={`absolute left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 border border-slate-700/50 text-white text-[10px] rounded-lg shadow-2xl z-[100] w-max max-w-[200px] whitespace-pre-wrap break-words leading-relaxed text-center font-medium tracking-wide ${
              isTop ? "bottom-full mb-2" : "top-full mt-2"
            }`}
          >
            {content}
            <div className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent ${
              isTop ? "top-full border-t-slate-900" : "bottom-full border-b-slate-900"
            }`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
