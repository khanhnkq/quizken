import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const [activeLang, setActiveLang] = useState(i18n.language);

    // Sync state with i18n changes
    useEffect(() => {
        setActiveLang(i18n.language);
    }, [i18n.language]);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        setActiveLang(lng);
    };

    const toggleLanguage = () => {
        const newLang = activeLang === 'vi' ? 'en' : 'vi';
        changeLanguage(newLang);
    };

    return (
        <>
            {/* Mobile: Single Button Toggle */}
            <Button
                variant="outline"
                size="icon"
                onClick={toggleLanguage}
                className="md:hidden rounded-3xl border-4 border-border hover:border-primary hover:text-primary hover:bg-primary/10 transition-all duration-200 active:scale-95 w-10 h-10 text-xs font-bold leading-none"
            >
                {activeLang.toUpperCase()}
            </Button>

            {/* Desktop: Toggle Switch */}
            <div className="hidden md:flex bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm items-center p-1 rounded-full border-2 border-slate-200 dark:border-slate-800 h-10 w-[100px] relative gap-1 shadow-sm transition-all duration-300">
                {/* Background slide animation */}
                <div className="absolute inset-1 flex items-center pointer-events-none z-0">
                    <motion.div
                        layoutId="active-lang-pill"
                        animate={{
                            x: activeLang === 'vi' ? 0 : 44,
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="w-10 h-6 bg-primary rounded-2xl shadow-sm"
                    />
                </div>

                {/* VI Button */}
                <button
                    onClick={() => changeLanguage('vi')}
                    className={cn(
                        "relative z-10 w-10 h-6 text-xs leading-none font-bold transition-colors duration-200 flex items-center justify-center rounded-2xl",
                        activeLang === 'vi' ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    VI
                </button>

                {/* EN Button */}
                <button
                    onClick={() => changeLanguage('en')}
                    className={cn(
                        "relative z-10 w-10 h-6 text-xs leading-none font-bold transition-colors duration-200 flex items-center justify-center rounded-2xl",
                        activeLang === 'en' ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    EN
                </button>
            </div>
        </>
    );
}
