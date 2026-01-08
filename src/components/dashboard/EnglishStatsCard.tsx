import React, { useMemo } from 'react';
import { useUserProgress } from '@/hooks/useUserProgress';
import { BookOpen, Trophy, Flame, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CEFR_LEVEL_DATA } from '@/lib/constants/cefrLessons';
import { Card, CardContent } from '@/components/ui/card';

export function EnglishStatsCard() {
    const navigate = useNavigate();
    const { isLessonCompleted, lessonScores, streak, activeDays } = useUserProgress();

    // Calculate Stats
    const stats = useMemo(() => {
        let totalLessons = 0;
        let completedLessons = 0;
        let totalScore = 0;
        let quizCount = 0;

        CEFR_LEVEL_DATA.forEach(level => {
            totalLessons += level.lessons.length;
            level.lessons.forEach(lesson => {
                const baseKey = lesson.id;
                if (isLessonCompleted(baseKey)) {
                    completedLessons++;
                }
                const quizKey = `${baseKey}-quiz`;
                const score = lessonScores[quizKey];
                if (score !== undefined) {
                    totalScore += score;
                    quizCount++;
                }
            });
        });

        const avgScore = quizCount > 0 ? Math.round(totalScore / quizCount) : 0;
        const progress = Math.round((completedLessons / totalLessons) * 100) || 0;

        return { completedLessons, totalLessons, avgScore, progress };
    }, [isLessonCompleted, lessonScores]);

    return (
        <Card className="rounded-[2.5rem] border-4 border-blue-200 bg-blue-100 transform transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl rotate-[1deg] hover:rotate-0 cursor-default group overflow-hidden relative">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-200/50 rounded-full blur-xl -ml-6 -mb-6 pointer-events-none"></div>

            <CardContent className="p-6 md:p-8 relative z-10">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-blue-200 text-blue-600 shadow-sm transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                            <BookOpen className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-blue-700">English Hub</h3>
                            <p className="text-sm text-blue-500/70 font-medium">CEFR Vocabulary Journey</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/english')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                    >
                        Continue →
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                    {/* Progress */}
                    <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-blue-200/50">
                        <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Progress</span>
                        </div>
                        <div className="text-3xl font-black text-emerald-600 mb-2">
                            {stats.progress}%
                        </div>
                        <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all" style={{ width: `${stats.progress}%` }} />
                        </div>
                    </div>

                    {/* Streak - GitHub Style */}
                    <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-blue-200/50">
                        <div className="flex items-center gap-2 mb-2">
                            <Flame className="w-4 h-4 text-orange-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Streak</span>
                        </div>

                        {/* GitHub Grid */}
                        <div className="flex gap-0.5 mb-2">
                            {activeDays.map((isActive, index) => (
                                <div
                                    key={index}
                                    className={`w-3 h-3 rounded-sm transition-all ${isActive
                                            ? 'bg-gradient-to-br from-emerald-400 to-green-500 shadow-sm'
                                            : 'bg-slate-200'
                                        }`}
                                />
                            ))}
                        </div>

                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-orange-500">{streak}</span>
                            <span className="text-sm font-bold text-orange-400/70">days</span>
                        </div>
                    </div>

                    {/* Avg Score */}
                    <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-blue-200/50">
                        <div className="flex items-center gap-2 mb-2">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Avg Score</span>
                        </div>
                        <div className="text-3xl font-black text-yellow-600">
                            {stats.avgScore}%
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Quiz average</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
