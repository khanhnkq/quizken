/**
 * CEFR Vocabulary Analyzer Component
 * Analyzes text and displays vocabulary difficulty statistics
 */

import { useState } from 'react';
import { useVocabularyAnalysis } from '@/hooks/useCEFR';
import { CEFRBadge, CEFRLevelBar } from './CEFRBadge';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { CEFR_LEVELS, type CEFRLevel } from '@/types/cefr';

const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog. This sentence contains words from different vocabulary levels. Some words like "quick" and "lazy" are beginner level, while words like "sentence" and "vocabulary" are more intermediate.`;

export function VocabularyAnalyzer() {
    const [text, setText] = useState(SAMPLE_TEXT);
    const { analysis, isLoading } = useVocabularyAnalysis(text);

    if (isLoading) {
        return (
            <Card className="p-6">
                <p className="text-center text-muted-foreground">Loading CEFR vocabulary data...</p>
            </Card>
        );
    }

    if (!analysis) {
        return (
            <Card className="p-6">
                <p className="text-center text-muted-foreground">Enter text to analyze vocabulary</p>
            </Card>
        );
    }

    const knownPercentage = (analysis.analyzedWords / analysis.totalWords) * 100;

    return (
        <div className="space-y-6">
            {/* Input Area */}
            <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Text to Analyze</h3>
                <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter text to analyze vocabulary difficulty..."
                    className="min-h-[150px] font-mono text-sm"
                />
            </Card>

            {/* Overall Statistics */}
            <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Vocabulary Analysis</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Total Words</p>
                        <p className="text-3xl font-bold">{analysis.totalWords}</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">In CEFR Database</p>
                        <p className="text-3xl font-bold">{analysis.analyzedWords}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {knownPercentage.toFixed(1)}% coverage
                        </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Average Level</p>
                        <CEFRBadge level={analysis.averageLevel} showName size="lg" />
                    </div>
                </div>

                {/* Average Level Progress */}
                <div className="mb-6">
                    <p className="text-sm font-medium mb-2">Difficulty Scale</p>
                    <CEFRLevelBar currentLevel={analysis.averageLevel} />
                </div>

                {/* Level Distribution */}
                <div className="space-y-3">
                    <h4 className="font-semibold">Level Distribution</h4>
                    {(Object.keys(CEFR_LEVELS) as CEFRLevel[]).map((level) => {
                        const count = analysis.levelDistribution[level];
                        const percentage = analysis.analyzedWords > 0
                            ? (count / analysis.analyzedWords) * 100
                            : 0;

                        if (count === 0) return null;

                        return (
                            <div key={level} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <CEFRBadge level={level} size="sm" />
                                        <span className="font-medium">{CEFR_LEVELS[level].name}</span>
                                    </div>
                                    <span className="text-muted-foreground">
                                        {count} words ({percentage.toFixed(1)}%)
                                    </span>
                                </div>
                                <Progress value={percentage} className="h-2" />
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Unknown Words */}
            {analysis.unknownWords.length > 0 && (
                <Card className="p-6">
                    <h4 className="font-semibold mb-3">
                        Words Not Found ({analysis.unknownWords.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {analysis.unknownWords.slice(0, 20).map((word, i) => (
                            <span
                                key={i}
                                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-sm"
                            >
                                {word}
                            </span>
                        ))}
                        {analysis.unknownWords.length > 20 && (
                            <span className="px-3 py-1 text-sm text-muted-foreground">
                                +{analysis.unknownWords.length - 20} more
                            </span>
                        )}
                    </div>
                </Card>
            )}

            {/* Word-by-Word Analysis */}
            <Card className="p-6">
                <h4 className="font-semibold mb-3">Word Details</h4>
                <div className="flex flex-wrap gap-2">
                    {analysis.words.map((wordData, i) => (
                        <span
                            key={i}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-lg"
                        >
                            <span className="font-mono text-sm">{wordData.word}</span>
                            {wordData.level && <CEFRBadge level={wordData.level} size="sm" />}
                        </span>
                    ))}
                </div>
            </Card>
        </div>
    );
}
