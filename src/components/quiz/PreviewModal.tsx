import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Clock, BarChart } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Quiz } from "@/types/quiz";

interface PreviewModalProps {
    quiz: Quiz | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onPlay: (quiz: Quiz) => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
    quiz,
    open,
    onOpenChange,
    onPlay,
}) => {
    const { t } = useTranslation();

    if (!quiz) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-white/95 backdrop-blur-xl border-4 border-white shadow-2xl rounded-[2rem]">

                {/* Header Section */}
                <div className="p-6 pb-4 bg-gradient-to-br from-green-50 to-emerald-50/50 border-b border-green-100">
                    <DialogHeader className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1.5 flex-1">
                                <DialogTitle className="text-2xl font-bold font-heading text-primary leading-tight">
                                    {quiz.title}
                                </DialogTitle>
                                <DialogDescription className="text-sm font-medium text-muted-foreground line-clamp-2">
                                    {quiz.description || t('quiz.noDescription', 'Không có mô tả')}
                                </DialogDescription>
                            </div>
                            <Button
                                size="lg"
                                onClick={() => onPlay(quiz)}
                                className="shrink-0 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                            >
                                <PlayCircle className="w-5 h-5 mr-1.5" />
                                {t('library.card.use', 'Làm bài')}
                            </Button>
                        </div>

                        {/* Stats Row */}
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/60 border border-green-100 shadow-sm">
                                <BarChart className="w-3.5 h-3.5 mr-1.5 text-primary" />
                                {quiz.questions.length} {t('quizContent.questions', 'Câu hỏi')}
                            </Badge>
                            <Badge variant="secondary" className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/60 border border-green-100 shadow-sm">
                                <Clock className="w-3.5 h-3.5 mr-1.5 text-orange-400" />
                                ~{Math.ceil(quiz.questions.length * 1)} {t('common.minutes', 'phút')}
                            </Badge>
                        </div>
                    </DialogHeader>
                </div>

                {/* Content Header - Fixed */}
                <div className="px-6 py-3 border-b border-dashed flex items-center justify-between bg-white/50 backdrop-blur-sm z-10">
                    <h3 className="font-heading font-bold text-gray-700">
                        {t('quizDetail.previewContent', 'Xem trước nội dung')}
                    </h3>
                    <span className="text-xs font-medium text-muted-foreground bg-gray-100 px-2 py-1 rounded">
                        {t('quizDetail.previewMode', 'Chế độ xem trước')}
                    </span>
                </div>

                {/* Content - Scrollable Questions */}
                <div className="flex-1 min-h-0 overflow-y-auto p-6 pt-2 relative custom-scrollbar">
                    <div className="space-y-6 pb-4">

                        {quiz.questions.map((q, idx) => (
                            <div key={idx} className="group rounded-2xl border-2 border-gray-100 p-4 hover:border-primary/20 hover:bg-green-50/10 transition-colors">
                                <div className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-md bg-gray-100 text-gray-500 font-bold text-xs flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        {idx + 1}
                                    </span>
                                    <div className="space-y-2 flex-1">
                                        <p className="font-medium text-gray-800 leading-snug">{q.question}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Gradient Fade */}
                <div className="h-4 bg-gradient-to-t from-white to-transparent shrink-0" />
            </DialogContent>
        </Dialog>
    );
};
