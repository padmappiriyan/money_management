const UserTableHeader = () => {
    const headers = [
        { label: 'User Details', align: 'left' },
        { label: 'Role', align: 'center' },
        { label: 'Joined Date', align: 'center' },
        { label: 'Status', align: 'center' },
        { label: 'Account Control', align: 'right' }
    ];

    return (
        <thead className="bg-slate-50 border-b border-slate-200/60 sticky top-0 z-10">
            <tr>
                {headers.map((h, i) => (
                    <th 
                        key={i} 
                        className={`px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap ${
                            h.align === 'center' ? 'text-center' : 
                            h.align === 'right' ? 'text-right' : 'text-left'
                        } ${h.className || ''}`}
                    >
                        {h.label}
                    </th>
                ))}
            </tr>
        </thead>
    );
};

export default UserTableHeader;
