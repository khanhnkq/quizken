import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Crown } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useTranslation } from 'react-i18next';

export const HostCard = ({ hostId }: { hostId: string }) => {
    const { profileData } = useProfile(hostId);
    const { t } = useTranslation();
    
    const displayName = profileData?.display_name || t('game.host.hostRole');
    const avatarUrl = profileData?.avatar_url;

    return (
        <div className="group relative bg-yellow-50 border-4 border-yellow-400/50 hover:border-yellow-400 hover:shadow-[0_0_15px_rgba(250,204,21,0.4)] dark:bg-yellow-900/10 rounded-3xl p-4 flex flex-col items-center gap-3 transition-all duration-300 animate-in zoom-in-50 fade-in cursor-default hover:-translate-y-1">
             <div className="relative">
                <Avatar className="w-16 h-16 border-4 border-yellow-400 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="bg-yellow-100 text-yellow-600 font-bold">{t('game.host.hostRole').charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 p-1.5 rounded-full shadow-md animate-bounce-slow">
                    <Crown className="w-4 h-4 fill-current" />
                </div>
             </div>
            <span className="font-bold text-center truncate w-full text-sm sm:text-base text-yellow-600 dark:text-yellow-400 group-hover:text-yellow-500 transition-colors">
                {displayName}
            </span>
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md uppercase tracking-wide">
                {t('game.host.hostRole').toUpperCase()}
            </div>
        </div>
    );
};
