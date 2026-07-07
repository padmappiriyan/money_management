import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
    FiUser, FiShield, FiActivity, FiMail, FiCheckCircle,
    FiAlertCircle, FiEdit3, FiRefreshCw, FiClock,
    FiPhone, FiMapPin, FiBriefcase, FiMoreHorizontal,
    FiCalendar, FiGlobe, FiCheck
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { getMyActivities } from '../../../api/activityApi';
import axiosInstance from '../../../api/axiosInstance';


const ProfilePage = () => {
    const { userInfo, setCredentials } = useAuthContext();

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(userInfo?.name || '');
    const [phoneNumber, setPhoneNumber] = useState(userInfo?.phoneNumber || '');
    const [address, setAddress] = useState(userInfo?.address || '');
    const [dob, setDob] = useState(userInfo?.dob ? userInfo.dob.split('T')[0] : '');
    const [nationalId, setNationalId] = useState(userInfo?.nationalId || '');
    const [updateLoading, setUpdateLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });
    const [activities, setActivities] = useState([]);
    const [actLoading, setActLoading] = useState(false);

    const fetchMyActivities = useCallback(async () => {
        setActLoading(true);
        try {
            const res = await getMyActivities({ limit: 10 });
            setActivities(res.data || []);
        } catch (error) {
            console.error('Failed to load personal timeline', error);
        } finally {
            setActLoading(false);
        }
    }, []);

    useEffect(() => { fetchMyActivities(); }, [fetchMyActivities]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        try {
            const { data } = await axiosInstance.put('/users/profile', {
                name, phoneNumber, address, dob, nationalId
            });
            if (data.success) {
                const updatedUser = {
                    ...userInfo,
                    name: data.user.name,
                    phoneNumber: data.user.phoneNumber,
                    address: data.user.address,
                    dob: data.user.dob,
                    nationalId: data.user.nationalId,
                };
                setCredentials(updatedUser);
                localStorage.setItem('userInfo', JSON.stringify(updatedUser));
                setMessage({ type: 'success', content: 'Profile updated successfully' });
                setIsEditing(false);
                setTimeout(() => setMessage({ type: '', content: '' }), 3000);
            }
        } catch (error) {
            setMessage({ type: 'error', content: error.response?.data?.message || 'Update failed' });
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleReset = () => {
        setName(userInfo?.name || '');
        setPhoneNumber(userInfo?.phoneNumber || '');
        setAddress(userInfo?.address || '');
        setDob(userInfo?.dob ? userInfo.dob.split('T')[0] : '');
        setNationalId(userInfo?.nationalId || '');
        setMessage({ type: '', content: '' });
    };

    const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';

    const formatDate = (dateString) => {
        if (!dateString) return 'Not provided';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: '2-digit'
        });
    };

    // Reusable field row component
    const Field = ({ icon: Icon, label, viewValue, editInput }) => (
        <div className="flex items-start gap-3 py-3 border-b border-neutral-50 last:border-0">
            <div className="w-7 h-7 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400 flex-shrink-0 mt-0.5">
                <Icon size={14} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">{label}</p>
                {isEditing && editInput
                    ? editInput
                    : <p className="text-[13px] font-semibold text-neutral-800 truncate">{viewValue || 'Not provided'}</p>
                }
            </div>
        </div>
    );

    const editInputClass = "text-[13px] font-semibold text-neutral-800 bg-neutral-50 border border-neutral-100 rounded-lg px-3 py-1.5 w-full outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50 transition-all";

    return (
        <div className="animate-in fade-in duration-500 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* ── Left: Profile Card ── */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8">

                        {/* Header */}
                        <div className="flex items-start justify-between mb-7">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-indigo-100 flex-shrink-0">
                                    {getInitial(userInfo?.name)}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-neutral-900 leading-tight">{userInfo?.name}</h2>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-neutral-50 border border-neutral-100 text-neutral-500">
                                            <FiShield size={11} />
                                            {userInfo?.role}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
                                            <FiCheckCircle size={11} />
                                            {userInfo?.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { setIsEditing(!isEditing); setMessage({ type: '', content: '' }); }}
                                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                                        isEditing
                                            ? 'bg-indigo-500 text-white shadow-md shadow-indigo-100'
                                            : 'bg-neutral-50 text-neutral-400 hover:text-indigo-500 hover:bg-indigo-50 border border-neutral-100'
                                    }`}
                                    title="Edit profile"
                                >
                                    <FiEdit3 size={15} />
                                </button>
                                <button className="w-8 h-8 rounded-xl flex items-center justify-center bg-neutral-50 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 border border-neutral-100 transition-all">
                                    <FiMoreHorizontal size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Message Banner */}
                        <AnimatePresence>
                            {message.content && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    className={`mb-5 flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[12px] font-semibold ${
                                        message.type === 'success'
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                            : 'bg-red-50 text-red-600 border border-red-100'
                                    }`}
                                >
                                    {message.type === 'success' ? <FiCheckCircle size={14} /> : <FiAlertCircle size={14} />}
                                    {message.content}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleUpdateProfile} className="space-y-6">

                            {/* About */}
                            <section>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">About</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                    <Field
                                        icon={FiPhone}
                                        label="Phone"
                                        viewValue={phoneNumber}
                                        editInput={<input className={editInputClass} type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />}
                                    />
                                    <Field
                                        icon={FiMail}
                                        label="Email"
                                        viewValue={userInfo?.email}
                                    />
                                </div>
                            </section>

                            <div className="h-px bg-neutral-50" />

                            {/* Address */}
                            <section>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">Address</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                    <Field
                                        icon={FiMapPin}
                                        label="Street address"
                                        viewValue={address}
                                        editInput={<input className={editInputClass} type="text" value={address} onChange={e => setAddress(e.target.value)} />}
                                    />
                                    <Field
                                        icon={FiGlobe}
                                        label="City / State"
                                        viewValue="Jaffna, Sri Lanka"
                                    />
                                </div>
                            </section>

                            <div className="h-px bg-neutral-50" />

                            {/* Employee Details */}
                            <section>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">Employee details</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                    <Field
                                        icon={FiCalendar}
                                        label="Date of birth"
                                        viewValue={formatDate(userInfo?.dob)}
                                        editInput={<input className={editInputClass} type="date" value={dob} onChange={e => setDob(e.target.value)} />}
                                    />
                                    <Field
                                        icon={FiShield}
                                        label="National ID"
                                        viewValue={nationalId || '---'}
                                        editInput={<input className={editInputClass} type="text" value={nationalId} onChange={e => setNationalId(e.target.value)} />}
                                    />
                                    <Field
                                        icon={FiBriefcase}
                                        label="Title"
                                        viewValue={userInfo?.role}
                                    />
                                    <Field
                                        icon={FiClock}
                                        label="Created date"
                                        viewValue={formatDate(userInfo?.createdAt)}
                                    />
                                </div>
                            </section>

                            {/* Edit Actions */}
                            <AnimatePresence>
                                {isEditing && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 6 }}
                                        className="flex justify-end items-center gap-3 pt-2 border-t border-neutral-50"
                                    >
                                        <button
                                            type="button"
                                            onClick={handleReset}
                                            className="text-[12px] font-semibold text-neutral-400 hover:text-neutral-700 transition-colors"
                                        >
                                            Reset
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={updateLoading}
                                            className="h-9 px-6 rounded-xl bg-indigo-500 text-white text-[13px] font-bold hover:bg-indigo-600 transition-all flex items-center gap-2 shadow-md shadow-indigo-100 disabled:opacity-60"
                                        >
                                            {updateLoading
                                                ? <FiRefreshCw size={14} className="animate-spin" />
                                                : <><FiCheck size={14} /> Save changes</>
                                            }
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </form>
                    </div>
                </div>

                {/* ── Right: Activity Feed ── */}
                <div className="lg:col-span-5 sticky top-4">
                    <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 120px)' }}>

                        {/* Feed Header */}
                        <div className="px-6 py-4 border-b border-neutral-50 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <FiActivity size={14} className="text-indigo-500" />
                                <span className="text-[13px] font-bold text-neutral-700">Recent activities</span>
                            </div>
                            <button
                                onClick={fetchMyActivities}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
                                title="Refresh"
                            >
                                <FiRefreshCw size={13} className={actLoading ? 'animate-spin' : ''} />
                            </button>
                        </div>

                        {/* Feed Body */}
                        <div className="flex-1 overflow-y-auto px-6 py-5 no-scrollbar">
                            {activities.length > 0 ? (
                                <div className="relative">
                                    {/* Timeline line */}
                                    <div className="absolute left-[9px] top-2 bottom-2 w-px bg-neutral-100" />
                                    <div className="space-y-5">
                                        {activities.map((log, i) => (
                                            <div key={log._id || i} className="flex gap-4 group">
                                                <div className="w-[19px] h-[19px] rounded-full bg-white border-2 border-neutral-200 group-hover:border-indigo-400 flex-shrink-0 flex items-center justify-center z-10 mt-0.5 transition-colors">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 group-hover:bg-indigo-400 transition-colors" />
                                                </div>
                                                <div className="flex-1 pb-1">
                                                    <p className="text-[10px] font-semibold text-neutral-400 tracking-wide mb-1">
                                                        {new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        &nbsp;·&nbsp;
                                                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    <p className="text-[12px] font-semibold text-neutral-700 leading-snug">{log.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center gap-3 py-16 opacity-40">
                                    <FiClock size={32} className="text-neutral-300" />
                                    <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">No activity yet</p>
                                </div>
                            )}
                        </div>

                        {/* Feed Footer */}
                        <div className="px-6 py-3.5 border-t border-neutral-50 flex justify-center flex-shrink-0">
                            <button className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-neutral-700 transition-colors">
                                View full security log
                            </button>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;