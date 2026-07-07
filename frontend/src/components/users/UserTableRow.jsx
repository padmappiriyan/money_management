import { FiMail, FiShield, FiCalendar, FiUserCheck, FiUserX, FiAlertCircle, FiTrash2 } from 'react-icons/fi';

const UserTableRow = ({ user, isSelf, onUpdateStatus, onDeleteClick }) => {
    const isActive = user.status === 'active';

    const statusStyles = {
        active: 'bg-emerald-100/50 text-emerald-700 border-emerald-200',
        inactive: 'bg-slate-100/50 text-slate-500 border-slate-200',
        suspended: 'bg-amber-100/50 text-amber-700 border-amber-200',
        deleted: 'bg-rose-100/50 text-rose-700 border-rose-200'
    };

    return (
        <tr className={`group transition-all duration-200 hover:bg-brand-50/30 hover:shadow-[inset_4px_0_0_0_#4f46e5] ${!isActive && 'opacity-70 bg-slate-50/30 grayscale-[20%]'}`}>
            <td className="px-6 py-3.5">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-[11px] shadow-sm transition-colors
                        ${isActive ? 'bg-brand-50 text-brand-600 border-brand-100' : 'bg-slate-100 text-slate-500 border-slate-200'}
                    `}>
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                        <p className="font-bold text-slate-800 text-[12px] tracking-tight leading-none mb-1">{user.name}</p>
                        <div className="flex items-center gap-1.5 text-slate-500">
                            <FiMail size={10} className="text-slate-400" />
                            <span className="text-[11px] font-medium">{user.email}</span>
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-3.5">
                <div className="flex justify-center">
                    <span className={`
                        px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 border shadow-sm
                        ${user.role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                            user.role === 'supervisor' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-brand-50 text-brand-600 border-brand-100'}
                    `}>
                        <FiShield size={10} />
                        {user.role}
                    </span>
                </div>
            </td>
            <td className="px-6 py-3.5 text-center">
                <div className="flex justify-center">
                    <span className="text-[11px] font-semibold text-slate-600 tracking-tight bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 flex items-center gap-1.5 w-fit shadow-sm">
                        <FiCalendar size={10} className="text-slate-400" />
                        <span className="tabular-nums">{new Date(user.createdAt).toLocaleDateString()}</span>
                    </span>
                </div>
            </td>
            <td className="px-6 py-3.5">
                <div className="flex justify-center">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase border shadow-sm flex items-center gap-1 w-fit transition-all ${statusStyles[user.status] || statusStyles.inactive}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : user.status === 'suspended' ? 'bg-amber-500' : user.status === 'deleted' ? 'bg-rose-500' : 'bg-slate-400'}`}></div>
                        {user.status}
                    </span>
                </div>
            </td>
            <td className="px-6 py-3.5 text-right relative">
                <div className="flex justify-end gap-1.5 items-center opacity-40 group-hover:opacity-100 transition-opacity">
                    {!isActive && (
                        <button
                            onClick={() => onUpdateStatus(user.id || user._id, 'active')}
                            disabled={isSelf}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all duration-300 disabled:opacity-30 shadow-sm"
                            title="Activate Account"
                        >
                            <FiUserCheck size={14} />
                        </button>
                    )}

                    {isActive && (
                        <button
                            onClick={() => onUpdateStatus(user.id || user._id, 'inactive')}
                            disabled={isSelf}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-500 hover:text-white transition-all duration-300 disabled:opacity-30 shadow-sm"
                            title="Deactivate Account"
                        >
                            <FiUserX size={14} />
                        </button>
                    )}

                    {user.status !== 'suspended' && (
                        <button
                            onClick={() => onUpdateStatus(user.id || user._id, 'suspended')}
                            disabled={isSelf}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-50 border border-amber-100 text-amber-600 hover:bg-amber-500 hover:text-white transition-all duration-300 disabled:opacity-30 shadow-sm"
                            title="Suspend Account"
                        >
                            <FiAlertCircle size={14} />
                        </button>
                    )}

                    <button
                        onClick={onDeleteClick}
                        disabled={isSelf}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-300 disabled:opacity-30 shadow-sm"
                        title="Delete Account Permanently"
                    >
                        <FiTrash2 size={14} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default UserTableRow;
