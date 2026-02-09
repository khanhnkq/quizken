
import Mascot from '@/components/ui/Mascot';
import { useTranslation } from 'react-i18next';

interface PlayerHeaderProps {
    isJoined: boolean;
}

export const PlayerHeader = ({ isJoined }: PlayerHeaderProps) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative w-40 h-40 group cursor-pointer">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl opacity-50 animate-pulse"></div> 
                <Mascot className="w-full h-full transform hover:scale-110 transition-transform duration-300" emotion={isJoined ? "happy" : "neutral"} />
                {isJoined && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white font-bold px-4 py-1 rounded-full animate-bounce shadow-lg border-2 border-white">
                        {t('game.player.ready')}!
                    </div>
                )}
            </div>
            
            <div className="text-center space-y-2">
                <h1 className="text-4xl md:text-5xl font-black font-heading text-foreground tracking-tight">
                    {isJoined ? t('game.player.youAreIn') : t('game.lobby.joinTitle')}
                </h1>
                <p className="text-muted-foreground font-medium text-lg">
                    {isJoined ? t('game.player.waitingForHost') : t('game.player.enterName')}
                </p>
            </div>
        </div>
    );
};
