import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

type GameStatus = "playing" | "victory" | "defeat";
type BossState = "idle" | "attacking" | "hurt" | "dying";
type PlayerState = "idle" | "attacking" | "hurt";

interface UseBossBattleProps {
  initialBossHp?: number;
  initialPlayerHp?: number;
  damagePerHit?: number;
  startDelay?: number;
}

export const useBossBattle = ({
  initialBossHp = 1000,
  initialPlayerHp = 100,
  damagePerHit = 100,
}: UseBossBattleProps = {}) => {
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  
  const [bossHp, setBossHp] = useState(initialBossHp);
  const [maxBossHp] = useState(initialBossHp);
  const [bossState, setBossState] = useState<BossState>("idle");

  const [playerHp, setPlayerHp] = useState(initialPlayerHp);
  const [maxPlayerHp] = useState(initialPlayerHp);
  const [playerState, setPlayerState] = useState<PlayerState>("idle");

  // Floating text (damage numbers)
  const [floatingTexts, setFloatingTexts] = useState<{id: number, text: string, x: number, y: number, color: string}[]>([]);

  const addFloatingText = (text: string, type: "damage" | "heal" | "info" = "damage") => {
    const id = Date.now();
    const color = type === "damage" ? "text-red-500" : type === "heal" ? "text-green-500" : "text-yellow-400";
    // Random position offset for variety
    const x = Math.random() * 40 - 20; 
    
    setFloatingTexts(prev => [...prev, { id, text, x, y: 0, color }]);
    
    // Cleanup after animation
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
    }, 1000);
  };

  const attackBoss = useCallback(() => {
    if (gameStatus !== "playing") return;

    // 1. Player Attack Animation
    setPlayerState("attacking");

    // 2. Delay damage slightly to match animation impact
    setTimeout(() => {
      // 3. Boss takes damage
      setBossHp(prev => {
        const newHp = Math.max(0, prev - damagePerHit);
        addFloatingText(`-${damagePerHit}`, "damage");
        
        if (newHp === 0) {
          setBossState("dying");
          setGameStatus("victory");
          toast({
            title: "VICTORY!",
            description: "You have defeated the boss!",
            variant: "default", // You might want a success variant if available
          });
        } else {
          setBossState("hurt");
          // Reset boss to idle after hurt animation
          setTimeout(() => setBossState("idle"), 500);
        }
        return newHp;
      });

      // Reset player to idle
      setPlayerState("idle");
    }, 300); // 300ms delay for impact

  }, [gameStatus, damagePerHit]);

  const takingDamage = useCallback((damage: number) => {
    if (gameStatus !== "playing") return;

    // 1. Boss Attack Animation
    setBossState("attacking");

    // 2. Delay damage
    setTimeout(() => {
      // 3. Player gets hurt
      setPlayerState("hurt");
      setBossState("idle"); // Boss finishes attack

      setPlayerHp(prev => {
        const newHp = Math.max(0, prev - damage);
        // Maybe show damage on player side? 
        // For now let's just screen shake or red flash in UI
        
        if (newHp === 0) {
          setGameStatus("defeat");
          toast({
            title: "DEFEAT!",
            description: "The boss has overwhelmed you...",
            variant: "destructive",
          });
        } else {
          setTimeout(() => setPlayerState("idle"), 500);
        }
        return newHp;
      });

    }, 300);

  }, [gameStatus]);

  return {
    gameStatus,
    boss: {
      hp: bossHp,
      maxHp: maxBossHp,
      state: bossState,
    },
    player: {
      hp: playerHp,
      maxHp: maxPlayerHp,
      state: playerState,
    },
    actions: {
      attackBoss,
      takingDamage,
    },
    effects: {
      floatingTexts,
    }
  };
};
