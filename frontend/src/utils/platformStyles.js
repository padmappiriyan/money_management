import { FiGlobe, FiSend, FiArrowUpRight, FiActivity } from 'react-icons/fi';

export const getPlatformStyle = (name = '', slug = '') => {
    const key = `${name} ${slug}`.toUpperCase();

    if (key.includes('WESTERN')) {
        return {
            icon: FiGlobe,
            headerBg: 'bg-[#FEF3C7]',
            headerText: 'text-[#B45309]',
            accent: 'text-[#D97706]',
            border: 'border-[#FDE68A]',
            displayName: 'Western Union',
        };
    }
    if (key.includes('MONEYGRAM') || key.includes('MONEY GRAM')) {
        return {
            icon: FiSend,
            headerBg: 'bg-[#FFE4E6]',
            headerText: 'text-[#BE123C]',
            accent: 'text-[#E11D48]',
            border: 'border-[#FECDD3]',
            displayName: 'Moneygram',
        };
    }
    if (key.includes('RIA')) {
        return {
            icon: FiArrowUpRight,
            headerBg: 'bg-[#FFEDD5]',
            headerText: 'text-[#C2410C]',
            accent: 'text-[#EA580C]',
            border: 'border-[#FED7AA]',
            displayName: 'Ria',
        };
    }

    return {
        icon: FiActivity,
        headerBg: 'bg-brand-50',
        headerText: 'text-brand-700',
        accent: 'text-brand-600',
        border: 'border-brand-100',
        displayName: name || 'Platform',
    };
};

export const sortPlatformsByKnownOrder = (platforms) => {
    const order = ['moneygram', 'ria', 'western'];
    return [...platforms].sort((a, b) => {
        const aIndex = order.findIndex((key) => a.slug?.includes(key) || a.name?.toLowerCase().includes(key));
        const bIndex = order.findIndex((key) => b.slug?.includes(key) || b.name?.toLowerCase().includes(key));
        const aRank = aIndex === -1 ? 99 : aIndex;
        const bRank = bIndex === -1 ? 99 : bIndex;
        return aRank - bRank;
    });
};
