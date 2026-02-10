
export const BOSS_BATTLE_CONFIG = {
    BASE_HP_PER_PLAYER: 500,
    BASE_DAMAGE: 100,
    CRIT_TIME_WINDOW: 3, // Seconds
    CRIT_MULTIPLIER: 2,
    MAX_TIME_BONUS: 1.5,
    COMBO_BONUS_PERCENT: 0.1, // 10% per streak
};

/**
 * Calculate Boss Max HP based on player count and question count.
 */
export const calculateBossMaxHp = (playerCount: number, questionCount: number): number => {
    // Minimum 1 player, 1 question
    const players = Math.max(1, playerCount);
    const questions = Math.max(1, questionCount);
    
    // Formula: (Players * 500) * (Questions / 2)
    // Example: 10 players * 500 = 5000. 10 questions / 2 = 5. Total = 25,000 HP.
    // Ensure boss feels beefy but beatable if everyone plays decent.
    return (players * BOSS_BATTLE_CONFIG.BASE_HP_PER_PLAYER) * Math.ceil(questions / 1.5); 
};

/**
 * Calculate Damage for a single correct answer.
 * @param timeRemaining Seconds left when answered
 * @param totalTime Total time for the question
 * @param streak Current player streak
 */
export const calculatePlayerDamage = (timeRemaining: number, totalTime: number, streak: number): { damage: number, isCrit: boolean } => {
    const { BASE_DAMAGE, CRIT_TIME_WINDOW, CRIT_MULTIPLIER, MAX_TIME_BONUS, COMBO_BONUS_PERCENT } = BOSS_BATTLE_CONFIG;

    // Time Bonus: Linear scaling from 1.0 to 1.5 based on speed
    const timeRatio = Math.max(0, timeRemaining / totalTime);
    const timeBonus = 1 + (timeRatio * (MAX_TIME_BONUS - 1));

    // Crit check: Answered within first 3 seconds
    const timeElapsed = totalTime - timeRemaining;
    const isCrit = timeElapsed <= CRIT_TIME_WINDOW;

    // Combo Bonus
    const comboMultiplier = 1 + (streak * COMBO_BONUS_PERCENT);

    // Final Calculation
    let damage = BASE_DAMAGE * timeBonus * comboMultiplier;
    
    if (isCrit) {
        damage *= CRIT_MULTIPLIER;
    }

    return {
        damage: Math.round(damage),
        isCrit
    };
};
