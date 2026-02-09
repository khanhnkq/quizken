import Mascot from '@/components/ui/Mascot';
import { useTranslation } from 'react-i18next';

export const LobbyMascotSection = () => {
    const { t } = useTranslation();
    return (
        <div className="hidden md:flex flex-col items-center text-center space-y-8 animate-in slide-in-from-left duration-700">
            <div className="relative w-72 h-72 group cursor-pointer">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500 animate-pulse"></div>
                    <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-500">
                    <Mascot className="w-full h-full" />
                    </div>
            </div>
            <div className="space-y-4">
                <h1 className="text-6xl font-black font-heading tracking-tight text-foreground drop-shadow-sm">
                    <span className="relative inline-block">
                        Quiz
                        <svg className="absolute -bottom-2 left-0 w-full h-3 text-yellow-300 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                            <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                        </svg>
                    </span>{" "}
                    <span className="text-primary relative inline-block">
                        Survival
                    </span>
                </h1>
                <p className="text-2xl text-muted-foreground font-medium max-w-md mx-auto">
                    {t('game.lobby.mascot.slogan')} <br/>
                    <span className="text-primary font-bold">{t('game.lobby.mascot.cta')}</span>
                </p>
            </div>
        </div>
    );
};
