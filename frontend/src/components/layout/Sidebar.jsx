import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLogOut, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import LogoMain from '../../assets/login/bontech.png';
import { SIDEBAR_CONFIG } from '../../constants/sidebarConfig';
import useLogout from '../../hooks/useLogout';

const Sidebar = () => {
  const { userInfo } = useAuthContext();
  const { handleLogout } = useLogout();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const role = userInfo?.role?.toLowerCase() || 'user';
  const menuItems = SIDEBAR_CONFIG[role] || SIDEBAR_CONFIG.user;

  // Toggle function
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <motion.aside
      animate={{ width: isCollapsed ? '88px' : '280px' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="h-screen bg-white border-r border-neutral-100 flex flex-col relative z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
    >
      {/* ── Logo Section ── */}
      <div className="h-20 flex items-center px-6 mb-4 mt-2 overflow-hidden">
        <div className="relative flex-shrink-0 w-32 h-32 flex items-center justify-center">
          <img src={LogoMain} alt="BONTECH" className="w-32 h-32 object-contain" />
        </div>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="ml-4 font-display font-bold text-xl text-neutral-900 tracking-tight"
          >

          </motion.span>
        )}
      </div>

      {/* ── Toggle Button ── */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-24 w-6 h-6 bg-brand-600 text-white rounded-full flex items-center justify-center hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200 z-[60]"
      >
        {isCollapsed ? <FiChevronRight size={14} /> : <FiChevronLeft size={14} />}
      </button>

      {/* ── Navigation Menu ── */}
      <nav className="flex-1 px-4 space-y-1.5 py-4 overflow-y-auto no-scrollbar focus:outline-none">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'} // Ensures exact match for Dashboard
            className={({ isActive }) => `
              group flex items-center h-12 px-4 rounded-xl transition-all duration-200 relative
              ${isActive
                ? 'bg-brand-50 text-brand-600'
                : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={20}
                  className={`flex-shrink-0 transition-transform duration-200 ${!isCollapsed ? 'mr-4' : ''} ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[15px] font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
                {/* Active Indicator Bar */}
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute left-0 w-1 h-6 bg-brand-600 rounded-r-full"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── User & Logout Section ── */}
      <div className="p-4 border-t border-neutral-100 bg-neutral-50/50">
        <div className={`flex items-center rounded-2xl p-2 transition-all duration-200 ${!isCollapsed ? 'hover:bg-white' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-brand-100 flex-shrink-0">
            {userInfo?.name?.charAt(0).toUpperCase() || 'A'}
          </div>

          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="ml-3 overflow-hidden"
            >
              <p className="text-[14px] font-bold text-neutral-900 truncate tracking-tight">
                {userInfo?.email || 'admin@mttms.com'}
              </p>
              <p className="text-[11px] font-bold text-brand-600 uppercase tracking-widest opacity-80">
                {userInfo?.role || 'Administrator'}
              </p>
            </motion.div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className={`
            w-full mt-3 flex items-center h-11 px-4 rounded-xl font-semibold text-rose-500 hover:bg-rose-50 transition-all duration-200 active:scale-95
            ${isCollapsed ? 'justify-center' : 'justify-start'}
          `}
        >
          <FiLogOut size={18} className={!isCollapsed ? 'mr-3' : ''} />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
