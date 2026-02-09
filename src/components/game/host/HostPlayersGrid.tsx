
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Users, Play, Loader2 } from 'lucide-react';
import Mascot from '@/components/ui/Mascot';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { HostCard } from './HostCard';

interface HostPlayersGridProps {
    participants: any[];
    hostId: string;
    onStartGame: () => void;
    isPlayerView?: boolean;
}

export const HostPlayersGrid = ({ participants, hostId, onStartGame, isPlayerView = false }: HostPlayersGridProps) => {
    const { t } = useTranslation();

    return (
        <div className="lg:col-span-7 flex flex-col gap-6 animate-in slide-in-from-right duration-700 delay-200">
            <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/20 p-6 md:p-8 flex-1 flex flex-col min-h-[400px] shadow-xl">
                <div className="flex justify-between items-center mb-12">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold font-heading">{t('game.host.players')}</h2>
                            <p className="text-muted-foreground text-sm font-medium">{t('game.host.waiting')}</p>
                        </div>
                    </div>
                    <div className="text-3xl font-black bg-white dark:bg-slate-800 px-6 py-2 rounded-2xl shadow-sm border border-border">
                        {participants.length}
                    </div>
                </div>

                {/* Players Grid */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {participants.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground/40 space-y-4">
                            <div className="opacity-50 grayscale hover:grayscale-0 transition-all duration-500 transform hover:scale-110">
                                <Mascot className="w-24 h-24" />
                            </div>
                            <p className="text-lg font-medium animate-pulse">{t('game.host.waiting')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 content-start pt-4">
                            {/* Host Card */}
                            {hostId && (
                                <HostCard hostId={hostId} />
                            )}

                            {participants
                                .filter(p => p.user_id !== hostId)
                                .map((p, idx) => (
                                <div 
                                    key={p.id} 
                                    className="group relative bg-white border-4 border-primary/20 hover:border-primary/40 hover:shadow-lg dark:bg-slate-800 rounded-3xl p-4 flex flex-col items-center gap-3 transition-all duration-300 animate-in zoom-in-50 fade-in cursor-default hover:-translate-y-1"
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    <Avatar className="w-16 h-16 border-4 border-border shadow-sm group-hover:scale-110 transition-transform duration-300">
                                        <AvatarImage src={p.avatar_url} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">{p.nickname[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-bold text-center truncate w-full text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                                        {p.nickname}
                                    </span>
                                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                                        {t('game.player.ready').toUpperCase()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Start Button or Waiting Status */}
            {!isPlayerView ? (
                <Button 
                    className={cn(
                        "w-full h-24 text-3xl font-black font-heading uppercase tracking-widest rounded-[2rem] transition-all shadow-xl border-4",
                        participants.length > 0 
                            ? "bg-primary text-primary-foreground hover:bg-primary/90 border-white/20 hover:shadow-2xl hover:-translate-y-1"
                            : "bg-muted text-muted-foreground border-transparent cursor-not-allowed"
                    )}
                    onClick={onStartGame}
                    disabled={participants.length === 0}
                >
                    {t('game.host.startGame')} 
                    <Play className={cn("ml-4 w-8 h-8 fill-current", participants.length > 0 && "animate-pulse")} />
                </Button>
            ) : (
                <Button 
                    className="w-full h-24 text-2xl font-black font-heading uppercase tracking-widest rounded-[2rem] bg-white/50 dark:bg-slate-800/50 text-muted-foreground border-4 border-transparent cursor-default hover:bg-white/60"
                    disabled
                >
                    <Loader2 className="mr-3 h-8 w-8 animate-spin" />
                    {t('game.player.waitingForHost')}
                </Button>
            )}
        </div>
    );
};
