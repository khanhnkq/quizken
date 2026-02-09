import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Question } from '@/types/quiz';
import { useAuth } from '@/lib/auth';
import { ActiveMatchView } from '@/components/game/match/ActiveMatchView';
import { GameAwardView, LeaderboardParticipant } from '@/components/game/match/GameAwardView';

const GameHostMatchPage = () => {
    const { t } = useTranslation();
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();

    // Game State
    const [isLoading, setIsLoading] = useState(true);
    const [room, setRoom] = useState<any>(null);
    const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [timerValue, setTimerValue] = useState(0);
    const [timerTotal, setTimerTotal] = useState(20);
    const [phase, setPhase] = useState<'question' | 'result' | 'leaderboard'>('question');
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardParticipant[]>([]);

    // Player State for Host
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [participantId, setParticipantId] = useState<string | null>(null);

    // Fetch Room & Quiz Data
    useEffect(() => {
        const fetchGameData = async () => {
            if (!roomId) return;
            
            // 1. Get Room Data
            const { data: roomData, error: roomError } = await supabase
                .from('game_rooms')
                .select('*, quizzes(*)')
                .eq('id', roomId)
                .single();

            if (roomError || !roomData) {
                toast({ title: t('game.host.errorLoading'), description: roomError?.message, variant: "destructive" });
                navigate('/game/lobby');
                return;
            }

            setRoom(roomData);
            setPhase(roomData.phase);
            
            // If already in leaderboard phase, fetch scores from DB
            if (roomData.phase === 'leaderboard') {
                 const { data: participants } = await supabase
                    .from('game_participants')
                    .select('id, nickname, avatar_url, score')
                    .eq('room_id', roomId)
                    .order('score', { ascending: false });

                 if (participants) {
                     const leaderboard: LeaderboardParticipant[] = participants.map(p => ({
                         id: p.id,
                         nickname: p.nickname,
                         avatar_url: p.avatar_url,
                         score: p.score || 0
                     }));
                     setLeaderboardData(leaderboard);
                 }
            }

            // 2. Parse Questions
            if (roomData.quizzes?.questions) {
                let questions: Question[] = [];
                try {
                    if (Array.isArray(roomData.quizzes.questions)) {
                        questions = roomData.quizzes.questions;
                    } else if (typeof roomData.quizzes.questions === 'string') {
                         questions = JSON.parse(roomData.quizzes.questions);
                    }
                    if (typeof questions === 'string') {
                         questions = JSON.parse(questions);
                    }
                } catch (e) {
                    console.error("Error parsing questions", e);
                }
                setQuizQuestions(questions);
                
                // Set initial question
                const index = roomData.current_question_index || 0;
                if (questions[index]) {
                    setCurrentQuestion(questions[index]);
                }
            }
            setIsLoading(false);
        };

        fetchGameData();
    }, [roomId, navigate, t]);

    // Fetch Participant ID for Host
    useEffect(() => {
        const fetchParticipantId = async () => {
            if (!roomId || !user) return;
            const { data } = await supabase
                .from('game_participants')
                .select('id')
                .eq('room_id', roomId)
                .eq('user_id', user.id)
                .single();
            if (data) setParticipantId(data.id);
        };
        fetchParticipantId();
    }, [roomId, user]);

    // Timer Sync Logic
    useEffect(() => {
        if (!room?.timer_ends_at || phase !== 'question') return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(room.timer_ends_at).getTime();
            const remaining = Math.max(0, Math.ceil((end - now) / 1000));
            
            setTimerValue(remaining);

            if (remaining <= 0) {
                clearInterval(interval);
                handleTimeUp();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [room?.timer_ends_at, phase]);

    // Update Room Phase helper
    const updateRoomPhase = async (newPhase: string, newIndex?: number, newTimerEndsAt?: string) => {
        const updateData: any = { phase: newPhase };
        if (newIndex !== undefined) updateData.current_question_index = newIndex;
        if (newTimerEndsAt) updateData.timer_ends_at = newTimerEndsAt;

        const { error } = await supabase
            .from('game_rooms')
            .update(updateData)
            .eq('id', roomId);
            
        if (error) {
            console.error("Error updating room:", error);
            toast({ title: "Error", description: "Failed to update game state", variant: "destructive" });
        } else {
             // Optimistic update
             setRoom((prev: any) => ({ ...prev, ...updateData }));
             setPhase(newPhase as any);
             if (newIndex !== undefined && quizQuestions[newIndex]) {
                 setCurrentQuestion(quizQuestions[newIndex]);
             }
        }
    };

    const handleTimeUp = () => {
        if (phase === 'result') return;
        setPhase('result');
        // Update DB to show results
        updateRoomPhase('result');
    };

    const handleNextQuestion = () => {
        if (!room) return;
        
        const nextIndex = (room.current_question_index || 0) + 1;
        
        if (nextIndex >= quizQuestions.length) {
            // End Game
            handleEndGame();
        } else {
            // Next Question
            const now = new Date();
            const timerEndsAt = new Date(now.getTime() + (timerTotal + 5) * 1000); // 5s buffer
            updateRoomPhase('question', nextIndex, timerEndsAt.toISOString());
        }
    };

    const handleEndGame = async () => {
         setIsLoading(true);
         
         // 1. Calculate Scores
         const { data: answers } = await supabase
            .from('game_answers')
            .select('participant_id, is_correct')
            .eq('room_id', roomId);

         const { data: participants } = await supabase
            .from('game_participants')
            .select('id, nickname, avatar_url')
            .eq('room_id', roomId);

         if (answers && participants) {
             const scores: Record<string, number> = {};
             // Simple scoring: 100 pts per correct answer
             answers.forEach(a => {
                 if (a.is_correct) {
                     scores[a.participant_id] = (scores[a.participant_id] || 0) + 100;
                 }
             });

             const leaderboard: LeaderboardParticipant[] = participants.map(p => ({
                 id: p.id,
                 nickname: p.nickname,
                 avatar_url: p.avatar_url,
                 score: scores[p.id] || 0
             })).sort((a, b) => b.score - a.score);

             setLeaderboardData(leaderboard);

             // 2. Update ALL Participants Scores in DB FIRST (wait for all to complete)
             await Promise.all(
                 leaderboard.map(p => 
                     supabase.from('game_participants')
                        .update({ score: p.score })
                        .eq('id', p.id)
                 )
             );

             // 3. ONLY AFTER scores are saved, update room phase
             const { error } = await supabase.from('game_rooms')
                .update({ status: 'finished', phase: 'leaderboard' })
                .eq('id', roomId);
             
             if (error) console.error("Error ending game:", error);
         }

         setPhase('leaderboard');
         setIsLoading(false);
    };

    const handleReplay = async () => {
        if (!confirm("Play again with same players?")) return;
        setIsLoading(true);
        
        // Reset Room
        await supabase.from('game_rooms')
            .update({ 
                status: 'waiting', 
                phase: 'lobby', 
                current_question_index: 0 
            })
            .eq('id', roomId);

        // Delete previous answers
        await supabase.from('game_answers').delete().eq('room_id', roomId);

        navigate(`/game/host/${roomId}`); // Or just reload/reset state
        window.location.reload(); 
    };

    const handleExit = async () => {
        // Delete Room (cascades usually handle the rest, or manual cleanup)
        await supabase.from('game_rooms').delete().eq('id', roomId);
        navigate('/');
    };

    // Handle Answer
    const handleSubmitAnswer = async (index: number) => {
        if (isSubmitted || phase !== 'question' || !participantId) return;

        setSelectedAnswer(index);
        setIsSubmitted(true);

        const correct = index === currentQuestion?.correctAnswer;

        // Send to DB
        await supabase
            .from('game_answers')
            .insert({
                room_id: roomId,
                participant_id: participantId,
                question_index: room?.current_question_index || 0,
                answer_index: index,
                is_correct: correct
            });
    };

    // Reset when question changes
    useEffect(() => {
        if (room?.phase === 'question') {
            setSelectedAnswer(null);
            setIsSubmitted(false);
        }
    }, [room?.current_question_index, room?.phase]);


    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p>Loading Quiz...</p>
            </div>
        );
    }

    if (!currentQuestion) {
        return (
             <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-8 text-center">
                <h1 className="text-3xl font-bold mb-4">Quiz Completed!</h1>
                <Button onClick={handleEndGame} size="lg" className="rounded-full">
                    View Leaderboard <Trophy className="ml-2 w-5 h-5" />
                </Button>
            </div>
        );
    }

    return (
        <>
            {phase === 'leaderboard' ? (
                <GameAwardView 
                    participants={leaderboardData}
                    isHost={true}
                    onReplay={handleReplay}
                    onExit={handleExit}
                />
            ) : (
                <ActiveMatchView 
                    question={currentQuestion}
                    currentQuestionIndex={(room?.current_question_index || 0)}
                    totalQuestions={quizQuestions.length}
                    timerValue={timerValue}
                    timeLimit={timerTotal}
                    selectedAnswer={selectedAnswer}
                    isSubmitted={isSubmitted}
                    isHost={true}
                    phase={phase}
                    onAnswer={handleSubmitAnswer}
                    onNext={handleNextQuestion}
                    onSkip={handleTimeUp}
                />
            )}
        </>
    );
};

export default GameHostMatchPage;
