
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Play, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';

interface LobbyJoinTabProps {
    joinCode: string;
    setJoinCode: (code: string) => void;
    isLoading: boolean;
    onJoin: () => void;
}

export const LobbyJoinTab = ({ joinCode, setJoinCode, isLoading, onJoin }: LobbyJoinTabProps) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { profileData } = useProfile(user?.id);

    return (
        <div className="space-y-6 flex-1 flex flex-col justify-start pt-12">
            <div className="space-y-5">
                <div className="space-y-2">
                    <Label className="text-base font-bold text-muted-foreground ml-4 uppercase tracking-wider">{t('game.lobby.enterPin')}</Label>
                    <Input 
                        placeholder="000000" 
                        className="text-center text-4xl tracking-[0.4em] font-black h-20 rounded-3xl bg-white/50 dark:bg-black/20 border-4 border-transparent focus:border-primary/50 focus:ring-0 placeholder:text-muted-foreground/20 transition-all shadow-inner"
                        maxLength={6}
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                    />
                </div>

                {!user ? (
                    <div className="bg-white/50 dark:bg-slate-800/50 rounded-3xl p-6 text-center space-y-4 border-4 border-transparent">
                        <p className="text-lg font-bold text-muted-foreground">{t('game.lobby.loginToJoinArena')}</p>
                        <Button 
                            variant="outline"
                            className="w-full h-14 rounded-2xl text-lg font-bold border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all"
                            onClick={() => navigate('/login')}
                        >
                            {t('game.lobby.loginRegister')}
                        </Button>
                    </div>
                ) : (
                    <div className="bg-white/50 dark:bg-slate-800/50 rounded-3xl p-4 flex items-center gap-4 border-4 border-primary/20">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary shadow-sm">
                            <img 
                                src={profileData?.avatar_url || user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                                alt="Avatar" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Joining as</p>
                            <h3 className="text-xl font-bold truncate text-primary">{profileData?.display_name || user.user_metadata.full_name || user.email?.split('@')[0]}</h3>
                        </div>
                    </div>
                )}
            </div>

            <Button 
                className="w-full h-20 rounded-[2rem] text-2xl font-black bg-primary text-primary-foreground hover:bg-primary/90 border-4 border-white/20 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                onClick={onJoin}
                disabled={isLoading || !user}
            >
                {isLoading ? <Loader2 className="mr-3 h-8 w-8 animate-spin"/> : <Sparkles className="mr-3 h-8 w-8 fill-current animate-pulse"/>}
                {t('game.lobby.joinButton')}
            </Button>
        </div>
    );
};
