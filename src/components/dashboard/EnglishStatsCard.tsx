import React, { useMemo } from 'react';
import { useUserProgress } from '@/hooks/useUserProgress';
import { BookOpen, Trophy, Flame, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CEFR_LEVEL_DATA } from '@/lib/constants/cefrLessons';

export function EnglishStatsCard() {
    const navigate = useNavigate();
    const { isLessonCompleted, lessonScores } = useUserProgress();

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
                // Check main lesson completion (which implies all steps)
                if (isLessonCompleted(baseKey)) {
                    completedLessons++;
                }

                // Check quiz score
                const quizKey = `${baseKey}-quiz`;
                const score = lessonScores[quizKey];
                if (score !== undefined) {
                    totalScore += score;
                    quizCount++;
                }
            });
        });

        // Simple Streak Calculation (Mocked for now as we don't track daily activity purely yet)
        // TODO: Implement real daily streak tracking in DB
        const streak = completedLessons > 0 ? Math.min(completedLessons, 5) : 0;

        const avgScore = quizCount > 0 ? Math.round(totalScore / quizCount) : 0;
        const progress = Math.round((completedLessons / totalLessons) * 100) || 0;

        return { completedLessons, totalLessons, streak, avgScore, progress };
    }, [isLessonCompleted, lessonScores]);

    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 opacity-60 group-hover:block hidden transition-all"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-500" />
                            English Hub
                        </h3>
                        <p className="text-sm text-slate-400 font-medium mt-1">CEFR Vocabulary Journey</p>
                    </div>
                    <button
                        onClick={() => navigate('/english')}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors"
                    >
                        Continue
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {/* Progress */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                        <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progress</span>
                        </div>
                        <div className="text-2xl font-black text-slate-700">
                            {stats.progress}%
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.progress}%` }} />
                        </div>
                    </div>

                    {/* Streak */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                        <div className="flex items-center gap-2 mb-2">
                            <Flame className="w-4 h-4 text-orange-500" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Streak</span>
                        </div>
                        <div className="text-2xl font-black text-slate-700">
                            {stats.streak} <span className="text-sm font-medium text-slate-400">days</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-tight">Keep the fire burning!</p>
                    </div>

                    {/* Avg Score */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                        <div className="flex items-center gap-2 mb-2">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Score</span>
                        </div>
                        <div className="text-2xl font-black text-slate-700">
                            {stats.avgScore}%
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-tight">Based on completed quizzes</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
