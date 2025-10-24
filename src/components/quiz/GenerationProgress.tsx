import * as React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, XCircle } from '@/lib/icons';

interface GenerationProgressProps {
  generationStatus: string | null;
  generationProgress: string;
  onCancel: () => void;
}

const progressSteps = [
  { key: "init", label: "Khởi tạo", match: ["starting generation", "đang chuẩn bị"] },
  { key: "auth", label: "Xác thực", match: ["authenticating"] },
  { key: "limit", label: "Giới hạn", match: ["checking rate limits", "rate limit"] },
  { key: "generate", label: "Sinh AI", match: ["generating with ai"] },
  { key: "done", label: "Hoàn tất", match: ["completed"] },
] as const;

const getActiveStep = (progressText: string | undefined): number => {
  if (!progressText) return 0;
  const p = progressText.toLowerCase();
  for (let i = progressSteps.length - 1; i >= 0; i--) {
    if (progressSteps[i].match.some((m) => p.includes(m))) return i;
  }
  return 0;
};

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  generationStatus,
  generationProgress,
  onCancel,
}) => {
  const percent = Math.min(
    Math.max(
      Math.round(((getActiveStep(generationProgress) + 1) / progressSteps.length) * 100),
      10
    ),
    95
  );

  return (
    <div className="space-y-6 py-4 md:py-8">
      <div className="flex justify-center">
        <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-[#B5CC89] animate-spin" />
      </div>

      <div className="space-y-1 text-center px-4">
        <h3 className="text-lg md:text-xl font-semibold">
          {generationStatus === "failed"
            ? "❌ Không thể tạo quiz"
            : generationStatus === "expired"
            ? "⏰ Quiz đã hết hạn"
            : "Đang tạo câu hỏi AI..."}
        </h3>
        <p className="text-sm md:text-base text-muted-foreground" role="status" aria-live="polite">
          {generationProgress || "Đang xử lý..."}
        </p>
      </div>

      <div className="max-w-xl mx-auto px-4">
        <div className="grid grid-cols-5 gap-1 md:gap-2">
          {progressSteps.map((s, i) => {
            const active = getActiveStep(generationProgress) >= i;
            return (
              <div key={s.key} className="flex flex-col items-center">
                <div className={`h-2 w-full rounded-full ${active ? "bg-[#B5CC89] animate-pulse" : "bg-secondary"}`} />
                <span
                  className={`mt-1 md:mt-2 text-[10px] md:text-[11px] text-center ${
                    active ? "text-foreground" : "text-muted-foreground"
                  }`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4">
        <Progress value={percent} aria-label="Tiến độ tạo quiz" className="h-2" />
      </div>

      <p className="text-xs md:text-sm text-center text-muted-foreground px-4">
        Bạn có thể tiếp tục thao tác khác; tiến trình chạy nền và sẽ hiển thị khi hoàn tất.
      </p>

      <div className="flex justify-center px-4">
        <Button
          onClick={onCancel}
          variant="outline"
          size="lg"
          className="w-full sm:w-auto hover:bg-primary hover:text-primary-foreground hover:border-foreground transition-colors">
          <XCircle className="mr-2 h-4 w-4" />
          Hủy tạo quiz
        </Button>
      </div>
    </div>
  );
};

export default GenerationProgress;







