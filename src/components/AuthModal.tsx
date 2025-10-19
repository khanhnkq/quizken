import React, { useState } from "react";
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
import { Loader2, Shield, LogIn } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onOpenChange }) => {
  const { signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      toast({
        title: "Đang chuyển đến Google...",
        description: "Vui lòng hoàn tất đăng nhập trên trang Google",
      });
      // Supabase sẽ redirect sang Google; sau khi quay lại, session sẽ được cập nhật tự động
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi khi đăng nhập Google.";
      toast({
        title: "Lỗi đăng nhập",
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
            <DialogDescription className="text-center text-[11px] text-muted-foreground leading-tight">
              Chỉ hỗ trợ đăng nhập bằng Google
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
                  <span className="text-sm">Đang chuyển hướng...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span className="text-sm">Đăng nhập với Google</span>
                </>
              )}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">
              Bằng cách tiếp tục, bạn đồng ý với Điều khoản và Chính sách bảo
              mật của chúng tôi.
            </p>
          </div>

          <DialogFooter className="flex justify-center">
            <Button
              onClick={() => onOpenChange(false)}
              variant="hero"
              className="px-8 group hover:bg-black hover:text-white"
              disabled={loading}>
              Để sau
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AuthModal;
