import * as React from "react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, LogIn } from '@/lib/icons';
import { useTranslation } from "react-i18next";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onOpenChange }) => {
  const { signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      toast({
        title: t("auth.redirecting"),
        description: t("auth.completeLogin"),
      });
      // Supabase sẽ redirect sang Google; sau khi quay lại, session sẽ được cập nhật tự động
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("auth.defaultError");
      toast({
        title: t("auth.loginError"),
        description: message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xs bg-gradient-to-br from-card to-secondary/20 border-2 border-border">
          <DialogHeader className="pb-3">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="bg-[#B5CC89] p-1 rounded-md">
                <Shield className="w-4 h-4 text-black" />
              </div>
              <DialogTitle className="text-lg font-bold text-primary">
                QuizGen AI
              </DialogTitle>
            </div>
            <DialogDescription className="text-center text-[11px] text-muted-foreground leading-relaxed">
              {t("auth.googleOnly")}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 space-y-3">
            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full h-9 border-foreground hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center gap-2"
              disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  <span className="text-sm">{t("auth.redirectingShort")}</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span className="text-sm">{t("auth.signInWithGoogle")}</span>
                </>
              )}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">
              {t("auth.termsAgreement")}
            </p>
          </div>

          <DialogFooter className="flex justify-center">
            <Button
              onClick={() => onOpenChange(false)}
              variant="hero"
              className="px-8 group hover:bg-black hover:text-white"
              disabled={loading}>
              {t("auth.later")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AuthModal;
