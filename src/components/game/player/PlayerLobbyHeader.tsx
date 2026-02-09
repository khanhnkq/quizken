
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { LogOut } from 'lucide-react';

interface PlayerLobbyHeaderProps {
    quizTitle: string;
    onExit: () => void;
}

export const PlayerLobbyHeader = ({ quizTitle, onExit }: PlayerLobbyHeaderProps) => {
    const { t } = useTranslation();

    return (
        <div className="w-full flex flex-col md:flex-row justify-between items-center mb-10 gap-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/20 shadow-xl animate-in fade-in slide-in-from-top duration-500">
            <div className="flex items-center gap-6">
                <Button variant="ghost" className="h-14 px-6 text-lg rounded-2xl hover:bg-white/20 border-2 border-transparent hover:border-white/20 transition-all" onClick={onExit}>
                    &larr; {t('game.host.exit')}
                </Button>
                <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t('game.player.playing')}</span>
                        <h2 className="font-extrabold text-2xl md:text-3xl font-heading text-foreground drop-shadow-sm">{quizTitle || "Loading..."}</h2>
                </div>
            </div>
            
            <div className="flex items-center gap-6">
                 {/* Right side placeholder to match Host Header spacing/balance if needed, or just leave empty but keep structure */}
                 <div className="flex flex-col items-end mr-2 gap-1 opacity-80">
                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t('game.common.status')}</span>
                        <div className="h-14 px-6 flex items-center bg-white/50 dark:bg-black/20 rounded-2xl border-2 border-transparent font-bold text-lg text-primary">
                            {t('game.player.joined')}
                        </div>
                 </div>
            </div>
        </div>
    );
};
