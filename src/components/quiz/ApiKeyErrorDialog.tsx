import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

interface ApiKeyErrorDialogProps {
  open: boolean;
  errorMessage: string;
  onOpenChange: (open: boolean) => void;
}

export const ApiKeyErrorDialog: React.FC<ApiKeyErrorDialogProps> = ({ open, errorMessage, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-gradient-to-br from-card to-secondary/20 border-2 border-border">
        <DialogHeader className="pb-3">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-[#B5CC89] p-2 rounded-full">
              <Shield className="w-6 h-6 text-black" />
            </div>
          </div>
          <DialogTitle className="text-center text-lg font-bold">Lỗi xác thực API Key</DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            Không thể kết nối tới dịch vụ AI. Vui lòng kiểm tra và cập nhật API Key của bạn.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-[#B5CC89]/10 border border-[#B5CC89]/30 rounded-lg p-4">
            <div className="text-sm font-medium text-foreground mb-2">Lỗi: {errorMessage}</div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>• API Key không hợp lệ hoặc đã hết hạn</div>
              <div>• API Key không có quyền truy cập Gemini AI</div>
              <div>• Đã đạt giới hạn sử dụng API</div>
              <div>• Lỗi kết nối mạng</div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3 text-sm">Cách khắc phục:</h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                <span>Đăng nhập để sử dụng API key cá nhân</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                <span>Truy cập API Settings trong Navbar</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                <div>
                  Lấy API key mới từ {" "}
                  <a
                    href="https://makersuite.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium">
                    Google AI Studio
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
                <span>Kích hoạt quyền truy cập Gemini AI</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 flex pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="flex-1 text-sm">
            Thử lại sau
          </Button>
          <Button
            variant="hero"
            size="sm"
            onClick={() => {
              onOpenChange(false);
              window.dispatchEvent(new Event("login-and-settings"));
            }}
            className="flex-1 text-sm text-white hover:bg-black hover:text-white">
            Cập nhật API Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyErrorDialog;







