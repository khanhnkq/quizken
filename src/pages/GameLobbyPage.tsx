import React from 'react';
import { GameLobby } from '@/components/game/GameLobby';
import { BackgroundDecorations } from '@/components/ui/BackgroundDecorations';

const GameLobbyPage = () => {
    return (
        <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
            <BackgroundDecorations />
            <div className="relative z-10 w-full p-4">
                <GameLobby />
            </div>
        </div>
    );
};

export default GameLobbyPage;
