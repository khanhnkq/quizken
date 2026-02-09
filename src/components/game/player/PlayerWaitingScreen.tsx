
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import Mascot from '@/components/ui/Mascot';

interface PlayerWaitingScreenProps {
    nickname: string;
    avatarUrl: string;
}

export const PlayerWaitingScreen = ({ nickname, avatarUrl }: PlayerWaitingScreenProps) => {
    const { t } = useTranslation();

    return (
        <div className="lg:col-span-5 flex flex-col gap-6 animate-in slide-in-from-left duration-700 delay-100">
            <Card className="flex-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-4 border-primary rounded-[2.5rem] shadow-2xl overflow-hidden relative group">
                <CardContent className="h-full flex flex-col items-center justify-center p-8 gap-8 relative z-10 text-center">
                    
                    {/* Top Section: Status Badge (Matches Host URL Section) */}
                    <div className="space-y-3">
                        <div className="inline-flex items-center justify-center gap-2 bg-green-500/10 px-6 py-2 rounded-full border border-green-500/20">
                            <span className="text-sm font-extrabold text-green-600 uppercase tracking-widest">{t('game.player.joined')}</span>
                        </div>
                    </div>

                    {/* Middle Section: Avatar (Matches Host QR Section) */}
                    <div className="relative group/avatar cursor-default">
                        <div className="p-4 bg-white rounded-[2rem] shadow-lg border-4 border-primary/20 relative transform transition-transform group-hover/avatar:scale-105 duration-300">
                             <Avatar className="w-56 h-56 rounded-xl border-none shadow-none"> {/* Size matches roughly QR code area including padding */}
                                <AvatarImage src={avatarUrl} className="rounded-xl object-cover" />
                                <AvatarFallback className="text-6xl rounded-xl">{nickname[0]}</AvatarFallback>
                            </Avatar>
                            <div className="absolute -top-4 -right-4 w-12 h-12 bg-green-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center animate-bounce">
                                <span className="text-white font-bold text-xl">✓</span>
                            </div>
                        </div>
                        <p className="mt-4 text-2xl font-black text-foreground tracking-tight drop-shadow-sm">{nickname}</p>
                    </div>

                    {/* Bottom Section: Waiting Spinner (Matches Host PIN Section) */}
                    <div className="space-y-2 w-full flex flex-col items-center">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">{t('game.player.status')}</p>
                        <div className="flex items-center justify-center gap-3 bg-primary/5 px-8 py-4 rounded-2xl border-2 border-dashed border-primary/20 w-full max-w-xs">
                             <Loader2 className="w-8 h-8 text-primary animate-spin" />
                             <span className="text-lg font-bold text-primary animate-pulse">{t('game.host.waiting')}</span>
                        </div>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
};
