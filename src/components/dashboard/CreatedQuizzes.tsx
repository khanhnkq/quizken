import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { CreatedQuiz } from "@/types/dashboard";
import {
    BookOpen,
    ArrowRightIcon,
    CalendarIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PenTool,
    Download,
    Trash2,
    FileQuestion,
    PlayCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CreatedQuizzesProps {
    quizzes: CreatedQuiz[];
    isLoading: boolean;
    onRefresh?: () => void;
}

const ITEMS_PER_PAGE = 5;

export function CreatedQuizzes({
    quizzes,
    isLoading,
    onRefresh,
}: CreatedQuizzesProps) {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    // Pagination Logic
    const totalPages = Math.ceil((quizzes?.length || 0) / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = quizzes?.slice(startIndex, startIndex + ITEMS_PER_PAGE) || [];

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(i18n.language === 'en' ? "en-US" : "vi-VN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const handleDelete = async (quizId: string) => {
        setIsDeleting(quizId);
        try {
            const { error } = await supabase.from('quizzes').delete().eq('id', quizId);

            if (error) throw error;

            toast({
                title: t('dashboard.createdQuizzes.deleteSuccess'),
                variant: "success",
            });

            if (onRefresh) onRefresh();
        } catch (error) {
            console.error("Error deleting quiz:", error);
            toast({
                title: t('dashboard.createdQuizzes.deleteError'),
                variant: "destructive",
            });
        } finally {
            setIsDeleting(null);
        }
    };

    // Preview / Use Quiz
    const handleUseQuiz = (quiz: CreatedQuiz) => {
        navigate(`/quiz/play/${quiz.id}`);
    };

    const handleDownloadPDF = async (quiz: CreatedQuiz) => {
        // Placeholder for PDF download triggers
        // Ideally this would reuse the same logic as in QuizLibrary or QuizGenerator
        // For now, we'll just navigate to the quiz view which has download button
        handleUseQuiz(quiz);
    };

    if (isLoading) {
        return (
            <Card className="rounded-[2.5rem] border-0 shadow-sm bg-white/50">
                <CardContent className="p-6 md:p-8 space-y-4">
                    <Skeleton className="h-8 w-48 rounded-lg" />
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (!quizzes || quizzes.length === 0) {
        return (
            <Card className="rounded-[2.5rem] border-0 shadow-sm bg-white/50 text-center py-12">
                <CardContent>
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
                        <PenTool className="w-10 h-10 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {t('dashboard.createdQuizzes.empty')}
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {t('dashboard.createdQuizzes.emptyDescription')}
                    </p>
                    <Button onClick={() => navigate('/')} className="rounded-xl">
                        {t('dashboard.createQuiz')}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <h3 className="text-2xl font-heading font-bold flex items-center gap-3 text-gray-800 group select-none">
                    <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                        <PenTool className="h-6 w-6" />
                    </div>
                    {t('dashboard.createdQuizzes.title')}
                    <Badge variant="secondary" className="ml-2 rounded-lg">
                        {quizzes.length}
                    </Badge>
                    <div className={`ml-2 p-1 rounded-full text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-gray-100' : ''}`}>
                        <ChevronLeftIcon className="w-5 h-5 -rotate-90" />
                    </div>
                </h3>

                {isExpanded && quizzes.length > ITEMS_PER_PAGE && (
                    <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                        {t('common.page')} {currentPage} / {totalPages}
                    </span>
                )}
            </div>

            <div className={`grid gap-4 transition-all duration-300 ease-in-out origin-top ${isExpanded ? 'opacity-100 max-h-[5000px]' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                {currentItems.map((quiz) => {
                    const questionCount = Array.isArray(quiz.questions) ? quiz.questions.length : 0;
                    return (
                        <div
                            key={quiz.id}
                            className="group bg-white rounded-[1.5rem] p-4 md:p-5 shadow-sm border-2 border-gray-100/60 hover:border-blue-500/30 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                        >
                            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between relative z-10">

                                {/* Info Section */}
                                <div className="space-y-2 flex-1 min-w-0">
                                    <div className="flex items-start justify-between md:justify-start gap-3">
                                        <Badge variant="outline" className="rounded-lg bg-blue-50 text-blue-700 border-blue-100 capitalize shrink-0">
                                            {quiz.category || 'General'}
                                        </Badge>
                                        <Badge variant="outline" className={`rounded-lg capitalize shrink-0 ${quiz.difficulty === 'easy' ? 'bg-green-50 text-green-700 border-green-100' :
                                            quiz.difficulty === 'hard' ? 'bg-red-50 text-red-700 border-red-100' :
                                                'bg-yellow-50 text-yellow-700 border-yellow-100'
                                            }`}>
                                            {quiz.difficulty || 'Medium'}
                                        </Badge>
                                    </div>

                                    <h4 className="font-bold text-lg md:text-xl truncate text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {quiz.title || t('common.untitledQuiz')}
                                    </h4>

                                    <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-gray-500 font-medium">
                                        <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md">
                                            <FileQuestion className="w-3.5 h-3.5" />
                                            {questionCount} {t('dashboard.createdQuizzes.questions')}
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md">
                                            <CalendarIcon className="w-3.5 h-3.5" />
                                            {formatDate(quiz.created_at)}
                                        </span>
                                        {(quiz.usage_count > 0) && (
                                            <span className="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md">
                                                <PlayCircle className="w-3.5 h-3.5" />
                                                {quiz.usage_count} {t('dashboard.createdQuizzes.usageCount')}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions Section */}
                                <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0 justify-end">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleUseQuiz(quiz)}
                                        className="h-9 px-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium"
                                        title={t('common.view')}
                                    >
                                        <BookOpen className="w-4 h-4 mr-1.5" />
                                        {t('common.view')}
                                    </Button>

                                    {/* Delete Button with Confirmation */}
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                title={t('common.delete')}
                                            >
                                                {isDeleting === quiz.id ? (
                                                    <span className="loading loading-spinner loading-xs">...</span>
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="rounded-[2rem]">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>{t('common.delete')}</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    {t('dashboard.createdQuizzes.deleteConfirm')}
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="rounded-full">{t('common.cancel')}</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDelete(quiz.id)}
                                                    className="rounded-full bg-red-500 hover:bg-red-600 border-0"
                                                >
                                                    {t('common.delete')}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Pagination Controls */}
                {quizzes.length > ITEMS_PER_PAGE && (
                    <div className="flex justify-center items-center gap-4 pt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="rounded-xl border-2 hover:bg-white hover:text-blue-600 hover:border-blue-600 disabled:opacity-50 transition-all"
                        >
                            <ChevronLeftIcon className="w-4 h-4 mr-1" />
                            {t('common.previous')}
                        </Button>

                        <span className="text-sm font-medium text-gray-500">
                            {currentPage} / {totalPages}
                        </span>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="rounded-xl border-2 hover:bg-white hover:text-blue-600 hover:border-blue-600 disabled:opacity-50 transition-all"
                        >
                            {t('common.next')}
                            <ChevronRightIcon className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

