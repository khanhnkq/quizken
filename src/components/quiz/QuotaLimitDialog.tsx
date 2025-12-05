import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Sparkles, Clock } from '@/lib/icons';
import { useTranslation } from "react-i18next";

interface TimeUntilReset {
  hours: number;
  minutes: number;
}

interface QuotaLimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  getTimeUntilReset: () => TimeUntilReset | null;
}

export const QuotaLimitDialog: React.FC<QuotaLimitDialogProps> = ({ open, onOpenChange, getTimeUntilReset }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gradient-to-br from-card to-secondary/20 border-2 border-border">
        <DialogHeader className="pb-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="bg-[#B5CC89] p-1 rounded-md">
              <Shield className="w-4 h-4 text-black" />
            </div>
            <DialogTitle className="text-lg font-bold text-primary">{t("quotaDialog.title")}</DialogTitle>
          </div>
          <DialogDescription className="text-center text-[12px] text-muted-foreground leading-relaxed">
            {t("quotaDialog.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-3 space-y-3">
          <div className="p-3 bg-[#B5CC89]/10 border border-[#B5CC89]/20 rounded-lg">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#B5CC89]" />
              <p className="text-xs font-medium text-foreground">{t("quotaDialog.loginPrompt")}</p>
            </div>
            <ul className="text-[11px] text-muted-foreground leading-relaxed list-disc list-inside space-y-1">
              <li>{t("quotaDialog.benefits.save")}</li>
              <li>{t("quotaDialog.benefits.download")}</li>
              <li>{t("quotaDialog.benefits.manageKey")}</li>
            </ul>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {(() => {
                const time = getTimeUntilReset();
                return time
                  ? t("quotaDialog.resetTime", { hours: time.hours, minutes: time.minutes })
                  : t("quotaDialog.resetTimeDefault");
              })()}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-8 text-xs border-2 hover:bg-primary hover:text-primary-foreground hover:border-foreground">
            {t("quotaDialog.buttons.close")}
          </Button>
          <Button
            variant="hero"
            size="sm"
            onClick={() => {
              onOpenChange(false);
              window.dispatchEvent(new Event("open-auth-modal"));
            }}
            className="flex-1 h-8 text-xs group hover:bg-black hover:text-white transition-colors">
            {t("quotaDialog.buttons.login")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuotaLimitDialog;







