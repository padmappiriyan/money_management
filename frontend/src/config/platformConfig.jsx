import { FiGlobe, FiRepeat, FiCreditCard, FiSmartphone } from 'react-icons/fi';
import RiaLogo from '../assets/MoneyTransformPlatform/Ria.png';
import MoneyGramLogo from '../assets/MoneyTransformPlatform/MoneyGram.png';
import WesternUnionLogo from '../assets/MoneyTransformPlatform/WesternUnion.png';
import TaptapLogo from '../assets/MoneyTransformPlatform/Taptap.png';
import RemitlyLogo from '../assets/MoneyTransformPlatform/Remitly.png';
/**
 * Configuration for financial platforms.
 * Includes branding colors, backgrounds, and associated icons.
 */
export const PLATFORMS_CONFIG = [
    {
        id: 'ria',
        name: 'RIA',
        icon: <img src={RiaLogo} alt="RIA" className="w-full h-full object-contain" />,
        color: '#005596',
        bg: 'bg-blue-50',
        activeBg: 'bg-[#002B49]',
        text: 'text-[#005596]',
        badge: 'bg-blue-100 text-blue-700'
    },
    {
        id: 'moneygram',
        name: 'MoneyGram',
        icon: <img src={MoneyGramLogo} alt="MoneyGram" className="w-full h-full object-contain" />,
        color: '#e01e26',
        bg: 'bg-red-50',
        activeBg: 'bg-[#C4161C]',
        text: 'text-[#e01e26]',
        badge: 'bg-red-100 text-red-700'
    },
    {
        id: 'western_union',
        name: 'Western Union',
        icon: <img src={WesternUnionLogo} alt="WesternUnion" className="w-full h-full object-contain" />,
        color: '#ffcc00',
        bg: 'bg-amber-50',
        activeBg: 'bg-[#DAA520]',
        text: 'text-amber-600',
        badge: 'bg-amber-100 text-amber-700'
    },
    {
        id: 'taptap',
        name: 'Taptap Send',
        icon: <img src={TaptapLogo} alt="Taptap" className="w-full h-full object-contain" />,
        color: '#00afaa',
        bg: 'bg-teal-50',
        activeBg: 'bg-[#008B87]',
        text: 'text-[#00afaa]',
        badge: 'bg-teal-100 text-teal-700'
    },
    {
        id: 'remitly',
        name: 'Remitly',
        icon: <img src={RemitlyLogo} alt="Remitly" className="w-full h-full object-contain" />,
        color: '#7b1fa2',
        bg: 'bg-purple-50',
        activeBg: 'bg-[#5D147A]',
        text: 'text-[#7b1fa2]',
        badge: 'bg-purple-100 text-purple-700'
    }
];

// Helper for mapping
export const PLATFORMS_MAP = PLATFORMS_CONFIG.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});

