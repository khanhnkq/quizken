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
                    variant="ghost"
                    size="icon"
                    className="rounded-xl hover:bg-[#B5CC89]/20 transition-colors"
                    aria-label="Change language">
                    <Globe className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-2">
                <DropdownMenuItem
                    onClick={() => changeLanguage('vi')}
                    className={`rounded-lg cursor-pointer ${isVietnamese ? 'bg-[#B5CC89]/20 font-semibold' : ''}`}>
                    🇻🇳 Tiếng Việt
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => changeLanguage('en')}
                    className={`rounded-lg cursor-pointer ${!isVietnamese ? 'bg-[#B5CC89]/20 font-semibold' : ''}`}>
                    🇬🇧 English
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
