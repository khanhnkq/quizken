import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const currentLanguage = i18n.language;
    const isVietnamese = currentLanguage === 'vi';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-3xl border-4 border-border hover:border-primary hover:text-primary hover:bg-primary/10 transition-all duration-200 active:scale-95 w-10 h-10"
                    aria-label="Change language">
                    <Globe className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-3xl border-4 border-primary/20 shadow-xl bg-white/95 backdrop-blur-sm p-2 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2">
                <DropdownMenuItem
                    onClick={() => changeLanguage('vi')}
                    className={`rounded-xl cursor-pointer py-3 px-3 mb-1 transition-colors duration-200 ${isVietnamese ? 'bg-secondary/40' : 'hover:bg-secondary/20'}`}>
                    <div className="flex items-center gap-3 w-full">
                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs border-2 border-red-200 shadow-sm">
                            VI
                        </div>
                        <span className={`font-heading flex-1 ${isVietnamese ? 'text-primary font-bold' : 'text-foreground'}`}>
                            Tiếng Việt
                        </span>
                        {isVietnamese && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => changeLanguage('en')}
                    className={`rounded-xl cursor-pointer py-3 px-3 transition-colors duration-200 ${!isVietnamese ? 'bg-secondary/40' : 'hover:bg-secondary/20'}`}>
                    <div className="flex items-center gap-3 w-full">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs border-2 border-blue-200 shadow-sm">
                            EN
                        </div>
                        <span className={`font-heading flex-1 ${!isVietnamese ? 'text-primary font-bold' : 'text-foreground'}`}>
                            English
                        </span>
                        {!isVietnamese && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
