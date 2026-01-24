export interface ExchangeItem {
    id: string;
    name: string;
    description: string;
    price: number;
    type: 'theme' | 'avatar' | 'avatar_frame' | 'powerup' | 'document';
    icon: string; // Emoji or image URL
    color: string; // Tailwind color class for card background
    download_url?: string | null; // URL to downloadable file (for 'document' type)
    image_url?: string | null;    // URL to image (for 'avatar' type with custom images)
}

export const EXCHANGE_ITEMS: ExchangeItem[] = [
    {
        id: 'theme_neon_night',
        name: 'Neon Night',
        description: 'Biến giao diện thành phong cách Cyberpunk cực ngầu!',
        price: 500,
        type: 'theme',
        icon: '🌃',
        color: 'bg-slate-900 border-purple-500'
    },
    {
        id: 'theme_pastel_dream',
        name: 'Pastel Dream',
        description: 'Thế giới mộng mơ với màu sắc dịu nhẹ.',
        price: 500,
        type: 'theme',
        icon: '🦄',
        color: 'bg-pink-50 border-pink-300'
    },
    {
        id: 'avatar_cool_cat',
        name: 'Cool Cat',
        description: 'Avatar Mèo đeo kính râm.',
        price: 200,
        type: 'avatar',
        icon: '😎',
        color: 'bg-orange-100 border-orange-300'
    },
    {
        id: 'avatar_quiz_king',
        name: 'Quiz King',
        description: 'Vương miện cho người chiến thắng.',
        price: 1000,
        type: 'avatar',
        icon: '👑',
        color: 'bg-yellow-100 border-yellow-300'
    },
    {
        id: 'powerup_double_xp_1h',
        name: 'X2 XP (1h)',
        description: 'Nhân đôi XP trong vòng 1 giờ!',
        price: 300,
        type: 'powerup',
        icon: '⚡',
        color: 'bg-blue-100 border-blue-300'
    },
    {
        id: 'theme_jujutsu_kaisen',
        name: 'Jujutsu Sorcerer',
        description: 'Triển khai Lãnh Địa của riêng bạn. Theme đặc biệt dành cho các Chú Thuật Sư.',
        price: 1000,
        type: 'theme',
        icon: '🤞',
        color: 'bg-neutral-900 border-red-600 text-red-500' 
    },
    {
        id: 'frame_golden_glory',
        name: 'Golden Glory Frame',
        description: 'Viền avatar vàng rực rỡ cho người đẳng cấp.',
        price: 800,
        type: 'avatar_frame',
        icon: '🖼️',
        color: 'bg-yellow-100 border-yellow-400',
        image_url: '/frames/frame_rank_gold_1769267264636.png' // Local generated frame
    },
    {
        id: 'frame_neon_circle',
        name: 'Neon Circle Frame',
        description: 'Viền neon phát sáng cực chất.',
        price: 600,
        type: 'avatar_frame',
        icon: '⭕',
        color: 'bg-purple-100 border-purple-400',
        image_url: '/frames/frame_style_cyberpunk_1769267300517.png' // Local generated frame
    }
];
