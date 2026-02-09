
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PlayerJoinFormProps {
    user: { id: string; user_metadata?: { full_name?: string; avatar_url?: string } } | null;
    profileData: { display_name?: string; avatar_url?: string } | null;
    isJoining: boolean;
    onJoin: () => void;
}

export const PlayerJoinForm = ({ user, profileData, isJoining, onJoin }: PlayerJoinFormProps) => {
    const { t } = useTranslation();
    const displayName = profileData?.display_name || user?.user_metadata?.full_name || t('game.common.playerFallback');
    const avatarUrl = profileData?.avatar_url || user?.user_metadata?.avatar_url;

    return (
        <div className="w-full space-y-6 animate-in slide-in-from-bottom duration-500 delay-100">
            <div className="flex flex-col items-center gap-4 mb-6">
                <Avatar className="w-24 h-24 border-4 border-primary shadow-lg ring-4 ring-white/10">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback>?</AvatarFallback>
                </Avatar>
                <div className="text-center">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">{t('game.player.joiningAs')}</p>
                    <h3 className="text-2xl font-black text-foreground">{displayName}</h3>
                </div>
            </div>

            <Button 
                className="w-full h-20 text-2xl font-black font-heading uppercase tracking-widest rounded-[2rem] bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl hover:shadow-2xl border-b-8 border-primary-foreground/20"
                onClick={onJoin}
                disabled={isJoining}
            >
                {isJoining ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                    <>
                        {t('game.lobby.joinButton')} <Play className="ml-3 w-6 h-6 fill-current" />
                    </>
                )}
            </Button>
        </div>
    );
};
