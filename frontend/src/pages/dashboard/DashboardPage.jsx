import { useAuthContext } from '../../contexts/AuthContext';
import { Suspense, lazy } from 'react';

// Lazy loading role-specific dashboards for better performance and separation
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));
const SupervisorDashboard = lazy(() => import('./supervisor/SupervisorDashboard'));
const UserDashboard = lazy(() => import('./user/UserDashboard'));

const DashboardPage = () => {
    const { userInfo } = useAuthContext();

    // --- Role-Based Dispatcher Render ──────────────────────────────────────────
    const renderDashboard = () => {
        switch (userInfo?.role) {
            case 'admin':
                return <AdminDashboard userInfo={userInfo} />;
            case 'supervisor':
                return <SupervisorDashboard userInfo={userInfo} />;
            case 'user':
                return <UserDashboard userInfo={userInfo} />;
            default:
                // Fallback for unexpected roles/guest state
                return (
                    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
                        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center text-red-500 animate-pulse">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                <line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black text-neutral-900 uppercase tracking-tighter italic font-display">Access Restricted</h2>
                        <p className="text-neutral-500 max-w-sm font-medium">Your role has not been assigned a specific dashboard interface. Please contact system support.</p>
                    </div>
                );
        }
    };

    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Loading Portal...</p>
                </div>
            </div>
        }>
            {renderDashboard()}
        </Suspense>
    );
};

export default DashboardPage;
