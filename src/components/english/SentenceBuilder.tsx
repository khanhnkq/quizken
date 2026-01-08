import React, { useState, useEffect, useRef } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragEndEvent,
    TouchSensor
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { CheckCircle, RotateCcw, ArrowRight, Sparkles, GripVertical, ArrowLeft, Brain, Lightbulb, Heart, Flame, Flag, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';
import { gsap } from 'gsap';
import confetti from 'canvas-confetti';
import { SentenceChallenge, SentencePart } from '../../lib/constants/vocabData';

// --- Theme & Style Helpers ---
const getTheme = (topic: string) => {
    switch (topic) {
        case 'Academic': return {
            bg: 'bg-indigo-50', text: 'text-indigo-600', accent: 'bg-indigo-500',
            light: 'bg-indigo-100', border: 'border-indigo-200',
            gradient: 'from-indigo-50 via-white to-indigo-50',
            blobMain: 'bg-indigo-300', blobSec: 'bg-purple-300',
            button3D: 'shadow-[0_4px_0_0_#4f46e5] active:shadow-none active:translate-y-1'
        };
        case 'Science': return {
            bg: 'bg-cyan-50', text: 'text-cyan-600', accent: 'bg-cyan-500',
            light: 'bg-cyan-100', border: 'border-cyan-200',
            gradient: 'from-cyan-50 via-white to-cyan-50',
            blobMain: 'bg-cyan-300', blobSec: 'bg-teal-300',
            button3D: 'shadow-[0_4px_0_0_#0891b2] active:shadow-none active:translate-y-1'
        };
        case 'Business': return {
            bg: 'bg-emerald-50', text: 'text-emerald-600', accent: 'bg-emerald-500',
            light: 'bg-emerald-100', border: 'border-emerald-200',
            gradient: 'from-emerald-50 via-white to-emerald-50',
            blobMain: 'bg-emerald-300', blobSec: 'bg-lime-300',
            button3D: 'shadow-[0_4px_0_0_#059669] active:shadow-none active:translate-y-1'
        };
        case 'Society': return {
            bg: 'bg-orange-50', text: 'text-orange-600', accent: 'bg-orange-500',
            light: 'bg-orange-100', border: 'border-orange-200',
            gradient: 'from-orange-50 via-white to-orange-50',
            blobMain: 'bg-orange-300', blobSec: 'bg-amber-300',
            button3D: 'shadow-[0_4px_0_0_#ea580c] active:shadow-none active:translate-y-1'
        };
        case 'Environment': return {
            bg: 'bg-green-50', text: 'text-green-600', accent: 'bg-green-500',
            light: 'bg-green-100', border: 'border-green-200',
            gradient: 'from-green-50 via-white to-green-50',
            blobMain: 'bg-green-300', blobSec: 'bg-emerald-300',
            button3D: 'shadow-[0_4px_0_0_#16a34a] active:shadow-none active:translate-y-1'
        };
        default: return {
            bg: 'bg-violet-50', text: 'text-violet-600', accent: 'bg-violet-500',
            light: 'bg-violet-100', border: 'border-violet-200',
            gradient: 'from-violet-50 via-white to-violet-50',
            blobMain: 'bg-violet-300', blobSec: 'bg-fuchsia-300',
            button3D: 'shadow-[0_4px_0_0_#7c3aed] active:shadow-none active:translate-y-1'
        };
    }
};

const getTypeColor = (type: SentencePart['type']) => {
    switch (type) {
        case 'S': return 'bg-blue-100 text-blue-700 border-blue-300 shadow-[0_4px_0_0_#93c5fd]';
        case 'V': return 'bg-rose-100 text-rose-700 border-rose-300 shadow-[0_4px_0_0_#fda4af]';
        case 'O': return 'bg-emerald-100 text-emerald-700 border-emerald-300 shadow-[0_4px_0_0_#6ee7b7]';
        case 'M': return 'bg-amber-100 text-amber-700 border-amber-300 shadow-[0_4px_0_0_#fcd34d]';
        case 'X': return 'bg-slate-200 text-slate-500 border-slate-300 shadow-[0_4px_0_0_#cbd5e1]';
        default: return 'bg-slate-100 text-slate-700 border-slate-300 shadow-[0_4px_0_0_#cbd5e1]';
    }
};

// --- Draggable Components ---
function DraggablePoolItem({ part, onClick }: { part: SentencePart, onClick?: () => void }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
        id: part.id,
        data: { type: 'pool', part }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0 : 1,
    };

    return (
        <button
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className={`
                px-4 py-3 rounded-xl font-bold text-sm md:text-base cursor-grab active:cursor-grabbing
                bg-white border-2 border-slate-200 hover:border-indigo-300 shadow-[0_4px_0_0_#cbd5e1]
                active:shadow-none active:translate-y-1 transition-all touch-none select-none
                ${part.type === 'X' ? 'hidden' : ''} 
            `}
        // Note: In a real 'distractor' game, 'X' would be visible but penalized on use. 
        // Here we assume it's mixed in.
        >
            {part.text}
        </button>
    );
}

function SortableLineItem({ part, onRemove }: { part: SentencePart, onRemove?: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: part.id,
        data: { type: 'line', part }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    const colors = getTypeColor(part.type);

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`
                relative group px-4 py-3 rounded-xl font-bold text-sm md:text-base border-2 cursor-grab active:cursor-grabbing
                shadow-[0_4px_0_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-1
                transition-all touch-none select-none flex items-center justify-center
                min-w-[80px] ${colors}
            `}
            onClick={onRemove}
        >
            {part.text}
        </div>
    );
}

function ItemOverlay({ part }: { part: SentencePart }) {
    const colors = getTypeColor(part.type);
    return (
        <div className={`
             px-4 py-3 rounded-xl font-bold text-lg border-2 shadow-2xl scale-110 cursor-grabbing
             ${colors} flex items-center justify-center z-50
         `}>
            {part.text}
        </div>
    );
}

// --- Main Component ---

interface SentenceBuilderProps {
    challenges: SentenceChallenge[]; // NEW: Array of challenges
    topic?: string;
    onComplete?: () => void;
    onClose?: () => void;
}

const SentenceBuilder: React.FC<SentenceBuilderProps> = ({
    challenges,
    topic = 'Academic',
    onComplete,
    onClose
}) => {
    const { t } = useTranslation();
    const theme = getTheme(topic);

    // Game State
    const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
    const [pool, setPool] = useState<SentencePart[]>([]);
    const [line, setLine] = useState<SentencePart[]>([]);
    const [hearts, setHearts] = useState(3);
    const [combo, setCombo] = useState(0);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null); // For DragOverlay
    const [isFinished, setIsFinished] = useState(false);

    // Refs for Animations
    const mascotRef = useRef<HTMLDivElement>(null);
    const feedbackRef = useRef<HTMLDivElement>(null);

    const currentChallenge = challenges[currentChallengeIndex];


    // --- Init Challenge ---
    useEffect(() => {
        if (!currentChallenge) return;

        // Combine parts + distractors and shuffle
        const allParts = [
            ...currentChallenge.parts,
            ...(currentChallenge.distractors || [])
        ].sort(() => 0.5 - Math.random());

        setPool(allParts);
        setLine([]);
        setIsCorrect(null);

        // Reset Mascot
        gsap.to(mascotRef.current, { y: 0, scale: 1, rotation: 0, duration: 0.3 });

    }, [currentChallengeIndex]); // Only re-run when index changes

    // --- DND Sensors ---
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // --- Handlers ---
    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        // Dragging from Pool to Line (Droppable Area)
        if (over.id === 'drop-area' && active.data.current?.type === 'pool') {
            const part = active.data.current.part as SentencePart;
            setLine((items) => [...items, part]);
            setPool((items) => items.filter((i) => i.id !== part.id));
        }

        // Reordering Line
        if (over.id !== 'drop-area' && active.data.current?.type === 'line') {
            const oldIndex = line.findIndex((item) => item.id === active.id);
            const newIndex = line.findIndex((item) => item.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1) {
                setLine((items) => arrayMove(items, oldIndex, newIndex));
            }
        }
    };

    const removeFromLine = (part: SentencePart) => {
        setLine((items) => items.filter((i) => i.id !== part.id));
        setPool((items) => [...items, part]);
    };

    // --- Check Logic ---
    const handleCheck = () => {
        if (!currentChallenge) return;

        const currentIds = line.map(p => p.id);
        const correctIds = currentChallenge.correctOrder;

        const isMatch = currentIds.length === correctIds.length &&
            currentIds.every((id, index) => id === correctIds[index]);

        if (isMatch) {
            // SUCCESS
            setIsCorrect(true);
            setCombo(prev => prev + 1);

            // Celebration
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

            // Mascot Happy
            gsap.to(mascotRef.current, { y: -20, scale: 1.1, duration: 0.3, yoyo: true, repeat: 3 });

            // Next Challenge Delay
            setTimeout(() => {
                if (currentChallengeIndex < challenges.length - 1) {
                    setCurrentChallengeIndex(prev => prev + 1);
                } else {
                    // ALL DONE
                    setIsFinished(true);
                }
            }, 1500);

        } else {
            // FAILURE
            setIsCorrect(false);
            setHearts(prev => Math.max(0, prev - 1));
            setCombo(0);

            // Check for distractor
            if (line.some(p => p.type === 'X')) {
                toast({ title: "Trap Word Detected!", description: "That word doesn't belong here!", variant: "destructive" });
            } else {
                toast({ title: "Try Again!", description: "The order is not quite right.", variant: "destructive" });
            }

            // Mascot Sad
            gsap.to(mascotRef.current, { x: -5, rotation: -5, duration: 0.1, yoyo: true, repeat: 5, clearProps: "all" });

            // Reset status after short delay
            setTimeout(() => setIsCorrect(null), 1500);
        }
    };



    if (isFinished) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-white/90 backdrop-blur-md animate-in fade-in zoom-in duration-300">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border-4 border-slate-100 text-center max-w-md w-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-orange-50 opacity-50" />
                    <div className="relative z-10">
                        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
                            <Trophy className="w-12 h-12 text-yellow-500" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-800 mb-2">Practice Complete!</h3>
                        <p className="text-slate-500 font-medium mb-8">You've mastered this session!</p>

                        <div className="flex flex-col gap-3">
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                                    <div className="text-2xl font-black text-orange-500">{combo}</div>
                                    <div className="text-xs font-bold text-orange-300 uppercase">Max Combo</div>
                                </div>
                                <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                                    <div className="text-2xl font-black text-red-500">{hearts}</div>
                                    <div className="text-xs font-bold text-red-300 uppercase">Hearts Left</div>
                                </div>
                            </div>

                            <button
                                onClick={() => onComplete && onComplete()}
                                className="w-full px-8 py-4 bg-green-500 text-white rounded-2xl font-black shadow-[0_4px_0_0_#16a34a] hover:scale-105 active:scale-95 active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="w-6 h-6" />
                                Finish Practice
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (challenges.length === 0) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-white/90 backdrop-blur-md">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border-4 border-slate-100 text-center max-w-md">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Flag className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">Practice Coming Soon</h3>
                    <p className="text-slate-500 font-medium mb-8">We are crafting challenges for this topic!</p>
                    <div className="flex flex-col gap-3 w-full">
                        <button
                            onClick={() => {
                                if (onComplete) onComplete();
                            }}
                            className="w-full px-8 py-4 bg-green-500 text-white rounded-xl font-black shadow-lg hover:scale-105 hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                        >
                            <Trophy className="w-5 h-5" />
                            Finish Lesson
                        </button>

                        <button onClick={onClose} className="w-full px-8 py-3 text-slate-400 font-bold hover:text-slate-600 transition-colors">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentChallenge) return null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-gradient-to-br ${theme.gradient} overflow-hidden`}>

                {/* Background FX */}
                <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                <div className={`absolute top-1/2 left-1/4 w-96 h-96 ${theme.blobMain} rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob pointer-events-none`}></div>
                <div className={`absolute top-0 right-1/4 w-96 h-96 ${theme.blobSec} rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000 pointer-events-none`}></div>


                {/* HUD: Hearts & Combo */}
                <div className="absolute top-4 right-4 md:top-8 md:right-8 flex gap-4 z-50">
                    <div className="flex bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-sm border border-white/50">
                        {[1, 2, 3].map(i => (
                            <Heart key={i} className={`w-8 h-8 transition-all ${i <= hearts ? 'fill-red-500 text-red-500 scale-100' : 'fill-slate-200 text-slate-200 scale-75'}`} />
                        ))}
                    </div>
                    {combo > 1 && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-2xl shadow-lg animate-bounce font-black text-xl">
                            <Flame className="fill-white w-6 h-6" /> x{combo}
                        </div>
                    )}
                </div>

                {/* Back Button */}
                <div className="absolute top-4 left-4 md:top-8 md:left-8 z-50 flex items-center gap-2">
                    <button
                        onClick={onClose}
                        className="p-3 bg-white/40 backdrop-blur-md hover:bg-white/60 text-slate-700 rounded-full shadow-lg border border-white/50 transition-all hover:scale-105 active:scale-95"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>

                </div>

                {/* Mascot Helper */}



                {/* Main Game Area */}
                <div className="w-full max-w-4xl relative z-10">
                    {/* Mascot Helper - Positioned relative to content */}
                    <div className="absolute -top-12 -left-20 hidden xl:block animate-float pointer-events-none z-10">
                        <div ref={mascotRef} className="bg-white/90 backdrop-blur-sm p-4 rounded-[2rem] shadow-xl border-4 border-white/50 rotate-[-5deg]">
                            <Brain className={`w-12 h-12 ${theme.text}`} />
                        </div>
                    </div>

                    {/* Sentence Container (Drop Zone) */}
                    <div className="mb-8">
                        <div className="text-center mb-6">
                            <span className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-2 block">
                                Challenge {currentChallengeIndex + 1}/{challenges.length}
                            </span>
                            <h3 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight">
                                {currentChallenge.translation}
                            </h3>
                        </div>

                        <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-4 md:p-8 min-h-[160px] shadow-inner border-4 border-white">
                            <SortableContext items={line.map(p => p.id)} strategy={horizontalListSortingStrategy}>
                                <div
                                    className="flex flex-wrap gap-3 items-center justify-center min-h-[100px]"
                                >
                                    {line.length === 0 && (
                                        <div className="flex flex-col items-center text-slate-400 animate-pulse">
                                            <Flag className="w-8 h-8 mb-2 opacity-50" />
                                            <span className="font-bold text-lg">Drag words here</span>
                                        </div>
                                    )}
                                    {line.map((part) => (
                                        <SortableLineItem key={part.id} part={part} onRemove={() => removeFromLine(part)} />
                                    ))}
                                </div>
                            </SortableContext>
                        </div>
                    </div>


                    {/* Pool Container */}
                    <div
                        id="drop-area" // Keep ID for drop check logic
                        className={`
                            bg-white rounded-[2rem] p-6 shadow-2xl border-b-8 transition-all duration-300
                            ${isCorrect === true ? 'border-green-200 bg-green-50' : isCorrect === false ? 'border-red-200 bg-red-50' : 'border-slate-100'}
                        `}
                    >
                        <div className="flex flex-wrap gap-3 justify-center min-h-[80px]">
                            {pool.map((part) => (
                                <DraggablePoolItem key={part.id} part={part} onClick={() => {
                                    setLine(prev => [...prev, part]);
                                    setPool(prev => prev.filter(p => p.id !== part.id));
                                }} />
                            ))}
                        </div>
                    </div>

                    {/* Check Button (Floating) */}
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={handleCheck}
                            disabled={line.length === 0}
                            className={`
                                group relative px-8 py-4 rounded-2xl font-black text-xl shadow-[0_6px_0_0_rgba(0,0,0,0.1)] 
                                active:shadow-none active:translate-y-2 transition-all flex items-center gap-3
                                ${line.length === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : `${theme.accent} text-white hover:brightness-110 shadow-${theme.text.split('-')[1]}-700`}
                            `}
                        >
                            {isCorrect === true ? (
                                <>Correct! <CheckCircle className="w-6 h-6 animate-bounce" /></>
                            ) : (
                                <>Check Answer <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </div>

                </div>

                <DragOverlay adjustScale={true}>
                    {activeId ? (
                        <ItemOverlay part={[...pool, ...line].find(p => p.id === activeId)!} />
                    ) : null}
                </DragOverlay>

            </div>
        </DndContext>
    );
};

export default SentenceBuilder;
