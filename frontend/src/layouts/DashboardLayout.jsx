import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { FiGlobe, FiBell, FiSearch, FiCheck, FiMenu } from 'react-icons/fi';
import { useSocketContext } from '../contexts/SocketContext';
import { fetchNotifications, markNotificationAsRead } from '../api/notificationApi';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const DashboardLayout = () => {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Notification State
  const { socket } = useSocketContext();
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  // Time ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await fetchNotifications();
        if (data.success) {
            setNotifications(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };
    loadNotifications();
  }, []);

  // Socket Listener
  useEffect(() => {
      if (!socket) return;

      const handleNewNotification = (notification) => {
          // Play a sound or show a toast
          toast.error(
              <div className="flex flex-col gap-1">
                  <p className="font-bold text-[13px]">{notification.title}</p>
                  <p className="text-[12px]">{notification.message}</p>
              </div>, 
              { duration: 6000, position: 'top-right' }
          );

          // Add to unread list
          setNotifications(prev => [notification, ...prev]);
      };

      socket.on('NEW_NOTIFICATION', handleNewNotification);

      return () => {
          socket.off('NEW_NOTIFICATION', handleNewNotification);
      };
  }, [socket]);

  const handleMarkAsRead = async (id) => {
      try {
          await markNotificationAsRead(id);
          setNotifications(prev => 
              prev.map(n => n._id === id ? { ...n, isRead: true } : n)
          );
      } catch (err) {
          console.error("Failed to mark as read", err);
      }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Map routes to display titles
  const routeTitles = {
    '/dashboard': 'System Overview',
    '/dashboard/activity-timeline': 'System Logs',
    '/dashboard/users': 'User Governance',
    '/dashboard/transactions': 'Financial Ledger',
    '/dashboard/profile': 'Identity Management',
    '/dashboard/audit-logs': 'Audit Logs',
    '/dashboard/platforms': 'Source Classification',
    '/dashboard/rates': 'Global Rates Management',
    '/dashboard/reports': 'Business Intelligence',
    '/dashboard/user-records': 'User Records',
    '/dashboard/excel': 'Excel Workspace'
  };

  const pageTitle = routeTitles[location.pathname] || 'System Management';

  return (
    <div className="flex h-screen w-screen bg-[#F8F9FA] overflow-hidden">
      {/* ── Sidebar (Left) ── */}
      <Sidebar mobileOpen={isMobileSidebarOpen} setMobileOpen={setIsMobileSidebarOpen} />

      {/* ── Main Content Area (Right) ── */}
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative transition-all duration-300 ease-in-out bg-neutral-50/20 flex flex-col">

        {/* ── Reusable Top Navigation Bar ── */}
        <header className="sticky bg-white top-0 z-50 backdrop-blur-xl shadow-sm flex items-center justify-between px-6 py-3 transition-all border-b border-slate-100">
          <div className="flex items-center gap-3 md:gap-8">
            <button 
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
            >
                <FiMenu size={22} />
            </button>
            <h1 className="text-[15px] md:text-[17px] font-bold text-brand-600 tracking-tight flex items-center gap-4">
              {pageTitle}
              <span className="hidden md:block w-[1px] h-5 bg-slate-200" />
            </h1>

            <div className="hidden md:flex items-center gap-2 text-slate-400 font-medium text-[13px]">
              <FiGlobe className="text-slate-300" size={16} />
              <span className="tabular-nums">
                {currentTime.toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })} | {currentTime.toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false
                })} ({Intl.DateTimeFormat().resolvedOptions().timeZone})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-8 relative">
            {/* Search Bar - Common for all pages */}
            <div className="relative group hidden lg:block">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 transition-all group-focus-within:text-brand-500" size={16} />
              <input
                type="text"
                placeholder="Search everything..."
                className="bg-slate-50/50 border border-slate-100/50 py-2 pl-11 pr-6 rounded-2xl text-[13px] w-64 focus:outline-none focus:ring-2 focus:ring-brand-500/10 focus:bg-white transition-all placeholder:text-slate-300"
              />
            </div>

            <div className="flex items-center gap-4 relative">
              <div 
                  className="relative cursor-pointer p-2.5 hover:bg-slate-50 rounded-xl transition-all group active:scale-95"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
              >
                <FiBell className="text-slate-400 group-hover:text-brand-600 transition-colors" size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-4 h-4 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white px-1">
                        {unreadCount}
                    </span>
                )}
              </div>

              {/* Notifications Dropdown */}
              {isNotifOpen && (
                  <div className="absolute top-12 right-0 w-80 bg-white border border-slate-100 shadow-xl rounded-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                          <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
                          <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">{unreadCount} New</span>
                      </div>
                      
                      <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                              <div className="p-6 text-center text-xs text-slate-400">No recent notifications</div>
                          ) : (
                              notifications.map(notif => (
                                  <div key={notif._id} className={`p-4 border-b border-slate-50 flex gap-3 transition-colors ${notif.isRead ? 'bg-white opacity-70' : 'bg-brand-50/20'}`}>
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${notif.type === 'DISCREPANCY' ? 'bg-rose-100 text-rose-500' : 'bg-brand-100 text-brand-600'}`}>
                                          <FiBell size={14} />
                                      </div>
                                      <div className="flex-1">
                                          <p className="text-[13px] font-bold text-slate-800 mb-0.5 leading-tight">{notif.title}</p>
                                          <p className="text-[12px] text-slate-500 leading-tight mb-2">{notif.message}</p>
                                          <div className="flex items-center justify-between">
                                              <span className="text-[10px] text-slate-400 font-medium">
                                                  {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                              </span>
                                              {!notif.isRead && (
                                                  <button 
                                                      onClick={() => handleMarkAsRead(notif._id)}
                                                      className="text-[10px] text-brand-600 font-bold hover:text-brand-800 flex items-center gap-1"
                                                  >
                                                      <FiCheck size={10} /> Mark Read
                                                  </button>
                                              )}
                                          </div>
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
              )}

            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 w-full max-w-[1440px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700 flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
