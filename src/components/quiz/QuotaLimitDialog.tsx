import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Sparkles, Clock } from '@/lib/icons';

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gradient-to-br from-card to-secondary/20 border-2 border-border">
        <DialogHeader className="pb-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="bg-[#B5CC89] p-1 rounded-md">
              <Shield className="w-4 h-4 text-black" />
            </div>
            <DialogTitle className="text-lg font-bold text-primary">Bạn đã hết lượt miễn phí</DialogTitle>
          </div>
          <DialogDescription className="text-center text-[12px] text-muted-foreground leading-relaxed">
            Bạn đã sử dụng 3/3 lượt tạo quiz miễn phí hôm nay.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-3 space-y-3">
          <div className="p-3 bg-[#B5CC89]/10 border border-[#B5CC89]/20 rounded-lg">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#B5CC89]" />
              <p className="text-xs font-medium text-foreground">Đăng nhập để tiếp tục tạo quiz không giới hạn</p>
            </div>
            <ul className="text-[11px] text-muted-foreground leading-relaxed list-disc list-inside space-y-1">
              <li>Lưu quiz vào thư viện cá nhân</li>
              <li>Tải xuống PDF và chia sẻ</li>
              <li>Quản lý API key cá nhân để tránh rate limit</li>
            </ul>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {(() => {
                const t = getTimeUntilReset();
                return t
                  ? `Lượt miễn phí sẽ reset sau ${t.hours} giờ ${t.minutes} phút`
                  : "Lượt miễn phí sẽ bắt đầu tính từ thời điểm bạn tạo quiz đầu tiên trong ngày";
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
            Đóng
          </Button>
          <Button
            variant="hero"
            size="sm"
            onClick={() => {
              onOpenChange(false);
              window.dispatchEvent(new Event("open-auth-modal"));
            }}
            className="flex-1 h-8 text-xs group hover:bg-black hover:text-white transition-colors">
            Đăng nhập
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuotaLimitDialog;







