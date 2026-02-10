
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Swords, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HostHeaderProps {
    quizTitle: string;
    timeLimit: string;
    onTimeLimitChange: (value: string) => void;
    gameMode: 'classic' | 'boss_battle';
    onGameModeChange: (value: 'classic' | 'boss_battle') => void;
    onExit: () => void;
}

export const HostHeader = ({ quizTitle, timeLimit, onTimeLimitChange, gameMode, onGameModeChange, onExit }: HostHeaderProps) => {
    const { t } = useTranslation();

    return (
        <div className="w-full flex flex-col md:flex-row justify-between items-center mb-10 gap-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/20 shadow-xl animate-in fade-in slide-in-from-top duration-500">
            <div className="flex items-center gap-6">
                <Button variant="ghost" className="h-14 px-6 text-lg rounded-2xl hover:bg-white/20 border-2 border-transparent hover:border-white/20 transition-all" onClick={onExit}>
                    &larr; {t('game.host.exit')}
                </Button>
                <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t('game.host.nowHosting')}</span>
                        <h2 className="font-extrabold text-2xl md:text-3xl font-heading text-foreground drop-shadow-sm">{quizTitle}</h2>
                </div>
            </div>
            
            <div className="flex items-center gap-6">
                {/* Game Mode Selector */}
                <div className="flex flex-col items-end mr-2 gap-1">
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t('game.host.gameMode', 'Game Mode')}</span>
                    <div className="w-48">
                        <Select value={gameMode} onValueChange={(v) => onGameModeChange(v as 'classic' | 'boss_battle')}>
                            <SelectTrigger className="h-14 rounded-2xl bg-white/50 dark:bg-black/20 border-2 border-transparent focus:border-primary/50 shadow-sm font-bold text-lg px-4">
                                {gameMode === 'classic' ? <Trophy className="w-6 h-6 mr-3 text-yellow-500" /> : <Swords className="w-6 h-6 mr-3 text-red-500" />}
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="classic" className="font-bold">
                                    <div className="flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-yellow-500" />
                                        {t('game.host.modeClassic', 'Classic')}
                                    </div>
                                </SelectItem>
                                <SelectItem value="boss_battle" className="font-bold">
                                    <div className="flex items-center gap-2">
                                        <Swords className="w-5 h-5 text-red-500" />
                                        {t('game.host.modeBoss', 'Boss Battle')}
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                {/* Time Limit Selector */}
                <div className="flex flex-col items-end mr-2 gap-1">
                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t('game.host.timePerQuestion')}</span>
                        <div className="w-44">
                        <Select value={timeLimit} onValueChange={onTimeLimitChange}>
                            <SelectTrigger className="h-14 rounded-2xl bg-white/50 dark:bg-black/20 border-2 border-transparent focus:border-primary/50 shadow-sm font-bold text-lg px-4">
                                <Clock className="w-6 h-6 mr-3 text-primary" />
                                <SelectValue placeholder="20s" />
                            </SelectTrigger>
                            <SelectContent>
                                {[10, 15, 20, 30, 45, 60, 90, 120].map(seconds => (
                                    <SelectItem key={seconds} value={seconds.toString()} className="font-bold">
                                        {seconds}s
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        </div>
                </div>
            </div>
        </div>
    );
};
