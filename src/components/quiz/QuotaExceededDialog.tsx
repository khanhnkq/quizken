import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { KeyRound, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface QuotaExceededDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    message?: string;
}

export function QuotaExceededDialog({ open, onOpenChange, message }: QuotaExceededDialogProps) {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-[450px] rounded-3xl border-4 border-destructive/20 shadow-xl overflow-hidden p-0">
                <div className="bg-destructive/5 p-6 flex flex-col items-center justify-center border-b border-destructive/10">
                    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4 ring-4 ring-destructive/5 animate-pulse">
                        <ShieldAlert className="w-8 h-8 text-destructive" />
                    </div>
                    <AlertDialogTitle className="text-xl font-bold text-center text-destructive">
                        {t('quizGenerator.quota.title', "Daily Limit Reached")}
                    </AlertDialogTitle>
                </div>

                <div className="p-6 space-y-4">
                    <AlertDialogDescription className="text-center text-base text-muted-foreground leading-relaxed">
                        {message || t('quizGenerator.quota.limitMessage', "You have reached the daily limit of 5 quizzes per day.")}
                    </AlertDialogDescription>

                    <div className="p-4 bg-secondary/30 rounded-xl border border-secondary text-sm text-center">
                        <p className="font-semibold text-foreground mb-1">💡 {t('quizGenerator.quota.tip', "Get Unlimited Access")}</p>
                        <p className="text-muted-foreground">
                            {t('quizGenerator.quota.tipDesc', "Add your own Google Gemini API Key in settings to create unlimited quizzes for free!")}
                        </p>
                    </div>
                </div>

                <AlertDialogFooter className="p-6 pt-2 flex-col sm:flex-row gap-3">
                    <AlertDialogCancel
                        className="mt-0 w-full sm:w-auto rounded-xl h-12 border-2 hover:bg-secondary/80 font-semibold"
                        onClick={() => onOpenChange(false)}
                    >
                        {t('common.cancel', "Cancel")}
                    </AlertDialogCancel>
                    <Button
                        className="w-full sm:w-auto rounded-xl h-12 font-bold shadow-md hover:shadow-lg transition-all"
                        onClick={() => {
                            onOpenChange(false);
                            navigate("/user/dashboard?tab=settings");
                        }}
                    >
                        <KeyRound className="w-4 h-4 mr-2" />
                        {t('nav.apiSettings', "Go to API Settings")}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
