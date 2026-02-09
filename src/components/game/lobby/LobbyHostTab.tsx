
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, BookOpen, User, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';

interface Quiz {
    id: string;
    title: string;
}

interface LobbyHostTabProps {
    myQuizzes: Quiz[];
    selectedQuizId: string;
    setSelectedQuizId: (id: string) => void;
    isLoading: boolean;
    onHost: () => void;
}

export const LobbyHostTab = ({ myQuizzes, selectedQuizId, setSelectedQuizId, isLoading, onHost }: LobbyHostTabProps) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="space-y-6 flex-1 flex flex-col justify-start pt-12">
            {!user ? (
                <div className="text-center py-10 space-y-6">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
                        <User className="w-12 h-12 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold">{t('game.lobby.hostYourOwn')}</h3>
                        <p className="text-muted-foreground font-medium">{t('game.lobby.hostLoginDesc')}</p>
                    </div>
                    <Button 
                        className="rounded-full px-10 h-14 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 border-4 border-primary/20 shadow-lg"
                        onClick={() => navigate('/login')}
                    >
                        {t('game.lobby.loginToHost')}
                    </Button>
                </div>
            ) : (
                <>
                    <div className="space-y-3">
                        <Label className="text-base font-bold text-muted-foreground ml-4 uppercase tracking-wider">{t('game.lobby.selectQuiz')}</Label>
                        <div className="relative">
                            <Select value={selectedQuizId} onValueChange={setSelectedQuizId}>
                                <SelectTrigger className="w-full h-20 rounded-[2rem] bg-white/50 dark:bg-black/20 border-4 border-transparent focus:border-primary/50 text-foreground font-bold text-lg shadow-inner px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <BookOpen className="w-6 h-6 text-primary" />
                                        <SelectValue placeholder={t('game.lobby.selectQuiz')} />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-2 border-primary/20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                                    {myQuizzes.map(q => (
                                        <SelectItem key={q.id} value={q.id} className="text-base font-bold py-3 cursor-pointer focus:bg-primary/10 focus:text-primary">
                                            {q.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                
                    <Button 
                        className="w-full h-20 rounded-[2rem] text-2xl font-black bg-primary text-primary-foreground hover:bg-primary/90 border-4 border-white/20 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 mt-4"
                        onClick={onHost}
                        disabled={isLoading || !selectedQuizId}
                    >
                        {isLoading && <Loader2 className="mr-3 h-8 w-8 animate-spin"/>}
                        {t('game.lobby.createRoom')}
                    </Button>
                </>
            )}
        </div>
    );
};
