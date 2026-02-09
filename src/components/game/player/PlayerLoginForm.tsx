import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface PlayerLoginFormProps {
    roomId: string;
}

export const PlayerLoginForm = ({ roomId }: PlayerLoginFormProps) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="w-full space-y-6 animate-in slide-in-from-bottom duration-500 delay-100 text-center">
            <div className="bg-white/50 dark:bg-slate-800/50 rounded-[2rem] p-8 border-4 border-white/20">
                <p className="text-xl font-bold mb-6">{t('game.player.loginToJoin')}</p>
                <Button 
                    className="w-full h-16 text-xl font-bold rounded-[2rem] bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl"
                    onClick={() => navigate(`/login?redirect=/game/play/${roomId}`)}
                >
                    {t('game.player.loginNow')}
                </Button>
            </div>
        </div>
    );
};
