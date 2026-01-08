import { LucideIcon, BookOpen, PenTool, Headphones, Award, Flag } from 'lucide-react';

export interface RoadmapTask {
    id: string;
    title: string;
    description: string;
    type: 'vocab' | 'grammar' | 'practice' | 'test';
    isCompleted: boolean;
    link?: string; // Internal link to feature (e.g. /english/phase1/vocab)
}

export interface RoadmapPhase {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    icon: any; // LucideIcon type handled loosely for now
    isLocked: boolean;
    tasks: RoadmapTask[];
    color: string;
}

export const ROADMAP_DATA: RoadmapPhase[] = [
    {
        id: 'phase-1',
        title: 'roadmap.phase1.title',
        subtitle: 'roadmap.phase1.subtitle',
        description: 'roadmap.phase1.description',
        icon: BookOpen,
        isLocked: false, // UNLOCKED by default
        color: 'blue',
        tasks: [
            {
                id: 'p1-vocab-core',
                title: 'roadmap.phase1.task1.title',
                description: 'roadmap.phase1.task1.desc',
                type: 'vocab',
                isCompleted: false,
                link: '/english/phase/1/vocab'
            },
            {
                id: 'p1-notebook',
                title: 'roadmap.phase1.task2.title',
                description: 'roadmap.phase1.task2.desc',
                type: 'practice',
                isCompleted: false,
                link: '/english/notebook'
            }
        ]
    },
    {
        id: 'phase-2',
        title: 'roadmap.phase2.title',
        subtitle: 'roadmap.phase2.subtitle',
        description: 'roadmap.phase2.description',
        icon: PenTool,
        isLocked: true,
        color: 'indigo',
        tasks: [
            {
                id: 'p2-grammar-1',
                title: 'roadmap.phase2.task1.title',
                description: 'roadmap.phase2.task1.desc',
                type: 'grammar',
                isCompleted: false
            }
        ]
    },
    {
        id: 'phase-3',
        title: 'roadmap.phase3.title',
        subtitle: 'roadmap.phase3.subtitle',
        description: 'roadmap.phase3.description',
        icon: Headphones,
        isLocked: true,
        color: 'teal',
        tasks: []
    },
    {
        id: 'phase-4',
        title: 'roadmap.phase4.title',
        subtitle: 'roadmap.phase4.subtitle',
        description: 'roadmap.phase4.description',
        icon: Award,
        isLocked: true,
        color: 'orange',
        tasks: []
    },
    {
        id: 'phase-5',
        title: 'roadmap.phase5.title',
        subtitle: 'roadmap.phase5.subtitle',
        description: 'roadmap.phase5.description',
        icon: Flag,
        isLocked: true,
        color: 'red',
        tasks: []
    }
];
