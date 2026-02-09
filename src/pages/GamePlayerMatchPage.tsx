import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BackgroundDecorations } from '@/components/ui/BackgroundDecorations';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Question } from '@/types/quiz';
import { ActiveMatchView } from '@/components/game/match/ActiveMatchView';
import { GameAwardView, LeaderboardParticipant } from '@/components/game/match/GameAwardView';

const GamePlayerMatchPage = () => {
    const { t } = useTranslation();
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [room, setRoom] = useState<any>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [phase, setPhase] = useState<'question' | 'result' | 'leaderboard'>('question');
    const [participantId, setParticipantId] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [timerValue, setTimerValue] = useState(0);
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardParticipant[]>([]);

    const fetchLeaderboard = async () => {
         // Fetch participants with their scores directly (calculated by Host)
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
    };

    // Trigger fetch when phase becomes leaderboard (both Realtime and Initial Load)
    useEffect(() => {
        if (phase === 'leaderboard') {
            fetchLeaderboard();
        }
    }, [phase, roomId]);

    // Load Session & Initial Data
    useEffect(() => {
        const loadSessionAndData = async () => {
            if (!roomId) return;
            // ... (keep existing load logic)
            // 1. Get Participant Info from Session
            const sessionKey = `quiz_game_session_${roomId}`;
            const savedSession = sessionStorage.getItem(sessionKey);
            if (!savedSession) {
                toast({ title: "Session Expired", description: "Please join the game again.", variant: "destructive" });
                navigate(`/game/play/${roomId}`);
                return;
            }
            const { participantId } = JSON.parse(savedSession);
            setParticipantId(participantId);

            // 2. Fetch Room & Quiz
            const { data: roomData, error } = await supabase
                .from('game_rooms')
                .select('*, quizzes(*)')
                .eq('id', roomId)
                .single();

            if (error || !roomData) {
                 navigate('/game/lobby');
                 return;
            }

            setRoom(roomData);
            setPhase(roomData.phase);
            
            // Parse Questions
             if (roomData.quizzes?.questions) {
                let parsedQuestions: Question[] = [];
                try {
                    if (Array.isArray(roomData.quizzes.questions)) {
                        parsedQuestions = roomData.quizzes.questions;
                    } else if (typeof roomData.quizzes.questions === 'string') {
                        parsedQuestions = JSON.parse(roomData.quizzes.questions);
                    }
                    if (typeof parsedQuestions === 'string') {
                         parsedQuestions = JSON.parse(parsedQuestions);
                    }
                } catch (e) { console.error(e); }
                
                setQuestions(parsedQuestions);
                if (parsedQuestions[roomData.current_question_index || 0]) {
                    setCurrentQuestion(parsedQuestions[roomData.current_question_index || 0]);
                }
            }
            setIsLoading(false);
        };

        loadSessionAndData();
    }, [roomId, navigate, toast]);

    // Keep current question synced with room state
    useEffect(() => {
        if (room && questions.length > 0) {
            const index = room.current_question_index || 0;
            if (questions[index]) {
                setCurrentQuestion(questions[index]);
            }
        }
    }, [room?.current_question_index, questions]);

    // 3. Subscribe to Realtime Updates
    useEffect(() => {
        if (!roomId) return;

        const channel = supabase
            .channel(`game_room_${roomId}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_rooms', filter: `id=eq.${roomId}` }, (payload) => {
                const newRoom = payload.new as any;
                setRoom(newRoom);
                setPhase(newRoom.phase);
                
                // Replay Logic
                if (newRoom.phase === 'lobby' && newRoom.status === 'waiting') {
                    toast({ title: "Host restarted the game!", description: "Returning to lobby..." });
                    window.location.href = `/game/play/${roomId}`; // Reload to reset state fully
                }
                
                // Leaderboard fetch is handled by the phase dependency effect now
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'game_rooms', filter: `id=eq.${roomId}` }, () => {
                 toast({ title: "Game Ended", description: "The host has closed the room.", variant: "destructive" });
                 navigate('/');
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomId, navigate, toast]);





    // Reset when question changes (Robustness fix)
    useEffect(() => {
        if (room?.phase === 'question') {
            console.log("Index changed, resetting state for new question.");
            setSelectedAnswer(null);
            setIsSubmitted(false);
            setIsCorrect(null);
        }
    }, [room?.current_question_index, room?.phase]);

    // Timer Sync Logic (Added for Player)
    useEffect(() => {
        if (!room?.timer_ends_at || phase !== 'question') return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(room.timer_ends_at).getTime();
            const remaining = Math.max(0, Math.ceil((end - now) / 1000));
            
            setTimerValue(remaining);

            if (remaining <= 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [room?.timer_ends_at, phase]);


    const handleSubmitAnswer = async (index: number) => {
        if (isSubmitted || phase !== 'question' || !participantId) return;

        setSelectedAnswer(index);
        setIsSubmitted(true);

        // Check correctness locally (optimistic)
        const correct = index === currentQuestion?.correctAnswer;
        setIsCorrect(correct);

        // Send to DB
        const { error } = await supabase
            .from('game_answers')
            .insert({
                room_id: roomId,
                participant_id: participantId,
                question_index: room?.current_question_index || 0,
                answer_index: index,
                is_correct: correct
            });

        if (error) {
            console.error("Submit Answer Error:", error);
            toast({ 
                title: "Error submitting", 
                description: error.message || "Could not save your answer", 
                variant: "destructive" 
            });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }
    
    // Result Screen for Player (Overlay or separate view? Keeping separate for now for distinct feedback)
    // Result Screen handling now delegated to ActiveMatchView for consistency
    // The ActiveMatchView will show correct/incorrect states on the grid itself.

    return (
        <>
            {phase === 'leaderboard' ? (
                <GameAwardView 
                    participants={leaderboardData}
                    isHost={false}
                    onExit={() => navigate('/')}
                />
            ) : (
                <ActiveMatchView 
                    question={currentQuestion}
                    currentQuestionIndex={(room?.current_question_index || 0)}
                    totalQuestions={questions.length}
                    timerValue={timerValue}
                    timeLimit={room?.time_limit_seconds || 20}
                    selectedAnswer={selectedAnswer}
                    isSubmitted={isSubmitted}
                    isHost={false}
                    phase={phase}
                    onAnswer={handleSubmitAnswer}
                />
            )}
        </>
    );
};

export default GamePlayerMatchPage;
