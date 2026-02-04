import { useBossBattle } from "@/hooks/useBossBattle";
import { BossStage } from "@/components/boss/BossStage";
import { QuizActionPanel } from "@/components/boss/QuizActionPanel";
import { HealthBar } from "@/components/boss/HealthBar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const BossBattlePage = () => {
  const navigate = useNavigate();
  const { gameStatus, boss, player, actions, effects } = useBossBattle();

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      actions.attackBoss();
    } else {
      actions.takingDamage(15); // Fixed damage for wrong answer for now
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col p-6 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center z-10 mb-8">
        <Button 
          variant="outline" 
          className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Exit Battle
        </Button>
      </div>

      <BossStage 
         bossState={boss.state} 
         playerState={player.state}
         bossEmotion={
           boss.state === "attacking" ? "angry" :
           boss.state === "hurt" ? "confused" :
           boss.state === "dying" ? "confused" :
           "happy"
         }
         floatingTexts={effects.floatingTexts}
      />

      <div className="relative z-10 flex-1 flex flex-col justify-between max-w-6xl mx-auto w-full">
        {/* Health Bars Row */}
        <div className="grid grid-cols-2 gap-12 w-full mt-4">
          <HealthBar 
            current={player.hp} 
            max={player.maxHp} 
            label="YOU" 
            color="bg-blue-500" 
          />
          <HealthBar 
            current={boss.hp} 
            max={boss.maxHp} 
            label="FINAL BOSS" 
            color="bg-red-600" 
          />
        </div>

        {/* Controls / Game Over Screen */}
        <div className="mb-12">
          {gameStatus === "playing" ? (
             <QuizActionPanel 
               onAnswer={handleAnswer} 
               disabled={boss.state !== "idle" && boss.state !== "hurt"} 
             />
          ) : (
            <div className="text-center space-y-4 bg-black/40 backdrop-blur-xl p-12 rounded-3xl border border-white/10 animate-in fade-in zoom-in duration-500">
               <h1 className="text-7xl font-black text-white uppercase tracking-tighter drop-shadow-2xl">
                 {gameStatus === "victory" ? <span className="text-yellow-400">Victory!</span> : <span className="text-red-600">Defeated</span>}
               </h1>
               <p className="text-slate-200 text-2xl">
                 {gameStatus === "victory" ? "You have conquered the challenge!" : "The boss was too strong this time..."}
               </p>
               <Button size="lg" className="text-xl px-12 py-8 rounded-2xl" onClick={() => window.location.reload()}>
                 Play Again
               </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BossBattlePage;
