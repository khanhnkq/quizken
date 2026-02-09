
import { Card, CardContent } from '@/components/ui/card';
import { QRCodeSVG } from 'qrcode.react';
import { useToast } from '@/hooks/use-toast';
import logo from "@/assets/logo/logo.png";
import { useTranslation } from 'react-i18next';

interface HostActionCardProps {
    joinLink: string;
    roomCode: string;
}

export const HostActionCard = ({ joinLink, roomCode }: HostActionCardProps) => {
    const { t } = useTranslation();
    const { toast } = useToast();

    return (
        <div className="lg:col-span-5 flex flex-col gap-6 animate-in slide-in-from-left duration-700 delay-100">
            <Card className="flex-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-4 border-primary rounded-[2.5rem] shadow-2xl overflow-hidden relative group">
                <CardContent className="h-full flex flex-col items-center justify-center p-8 gap-8 relative z-10 text-center">
                    
                    {/* URL Section */}
                    <div className="space-y-3">
                        <div className="inline-flex items-center justify-center gap-2 bg-primary/10 px-6 py-2 rounded-full border border-primary/20">
                            <span className="text-sm font-extrabold text-primary uppercase tracking-widest">{t('game.host.joinAt')}</span>
                        </div>
                    </div>

                    {/* QR Code Section */}
                    <div className="relative group/qr cursor-pointer" onClick={() => {
                        navigator.clipboard.writeText(joinLink);
                        toast({ title: t('game.host.copied'), description: t('game.host.shareLink') });
                    }}>
                        
                        <div className="p-4 bg-white rounded-[2rem] shadow-lg border-4 border-primary/20 relative transform transition-transform group-hover/qr:scale-105 duration-300 hover:rotate-2">
                                <QRCodeSVG 
                                    value={joinLink} 
                                    size={220}
                                    level="Q"
                                    includeMargin={true}
                                    className="rounded-xl w-full h-full"
                                    fgColor="#000000" // Force black for best contrast on white bg
                                />
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full p-1 shadow-md border-2 border-white">
                                <img 
                                    src={logo} 
                                    alt="Logo" 
                                    className="w-full h-full object-cover rounded-full bg-gray-50" 
                                />
                            </div>
                        </div>
                        <p className="mt-4 text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-0 group-hover/qr:opacity-100 transition-opacity absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">{t('game.host.clickToCopy')}</p>
                    </div>

                    {/* PIN Section */}
                    <div className="space-y-2 w-full">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">{t('game.lobby.orEnterCode')}</p>
                        <div className="relative group/pin cursor-pointer" onClick={() => {
                            navigator.clipboard.writeText(roomCode);
                            toast({ title: t('game.host.copied'), description: t('game.host.linkCopied') });
                        }}>
                            <h2 className="text-7xl sm:text-8xl font-black text-primary tracking-widest drop-shadow-sm select-all">
                                {roomCode}
                            </h2>
                            <p className="opacity-0 group-hover/pin:opacity-100 transition-opacity text-xs font-bold text-primary absolute -bottom-6 left-1/2 -translate-x-1/2">
                                {t('game.host.clickToCopy').toUpperCase()}
                            </p>
                        </div>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
};
