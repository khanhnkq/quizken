import { useState, useEffect, useCallback } from "react";
import { TOPICS } from "@/lib/constants/vocabData";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY_UNLOCKED = "english_hub_unlocked_topics";
const STORAGE_KEY_COMPLETED = "english_hub_completed_topics";
const STORAGE_KEY_LESSONS = "english_hub_completed_lessons";

export function useUserProgress() {
  const { user } = useAuth();
  // Legacy Topic Logic
  const [unlockedTopics, setUnlockedTopics] = useState<string[]>([
    TOPICS[0] || "Academic",
  ]);
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);

  // New Lesson Logic
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [lessonScores, setLessonScores] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [activeDays, setActiveDays] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  // Helper to get keys based on user (for local storage fallback/cache)
  const getKeys = useCallback(() => {
    const suffix = user?.id ? `_${user.id}` : "";
    return {
      unlocked: `${STORAGE_KEY_UNLOCKED}${suffix}`,
      completed: `${STORAGE_KEY_COMPLETED}${suffix}`,
      lessons: `${STORAGE_KEY_LESSONS}${suffix}`,
      scores: `english_hub_lesson_scores${suffix}`,
      skipped: `english_hub_skipped_levels${suffix}`,
    };
  }, [user?.id]);

  // Load initial data (Local Storage + Backend Sync)
  useEffect(() => {
    const loadProgress = async () => {
      setIsLoading(true);
      const {
        unlocked: keyUnlocked,
        completed: keyCompleted,
        lessons: keyLessons,
        scores: keyScores,
        skipped: keySkipped,
      } = getKeys();

      // 1. Load from Local Storage (Immediate Render)
      const storedUnlocked = localStorage.getItem(keyUnlocked);
      const storedCompleted = localStorage.getItem(keyCompleted);
      const storedLessons = localStorage.getItem(keyLessons);
      const storedScores = localStorage.getItem(keyScores);

      if (storedUnlocked) {
        try {
          setUnlockedTopics(JSON.parse(storedUnlocked));
        } catch (e) {
          console.error(e);
        }
      } else {
        setUnlockedTopics([TOPICS[0] || "Academic"]);
      }

      if (storedCompleted) {
        try {
          setCompletedTopics(JSON.parse(storedCompleted));
        } catch (e) {
          console.error(e);
        }
      } else {
        setCompletedTopics([]);
      }

      if (storedLessons) {
        try {
          setCompletedLessons(JSON.parse(storedLessons));
        } catch (e) {
          console.error(e);
          setCompletedLessons([]);
        }
      } else {
        setCompletedLessons([]);
      }

      if (storedScores) {
        try {
          setLessonScores(JSON.parse(storedScores));
        } catch (e) {
          console.error(e);
          setLessonScores({});
        }
      } else {
        setLessonScores({});
      }

      const storedSkipped = localStorage.getItem(keySkipped);
      if (storedSkipped) {
        try {
          setSkippedLevels(JSON.parse(storedSkipped));
        } catch (e) {
          console.error(e);
          setSkippedLevels([]);
        }
      } else {
        setSkippedLevels([]);
      }

      // 2. Sync with Backend if User is Logged In
      if (user?.id) {
        try {
          // Fetch completed lessons
          const { data: lessonData, error: lessonError } = await supabase
            .from("lesson_completions")
            .select("lesson_id, score, completed_at")
            .eq("user_id", user.id);

          if (lessonError) throw lessonError;

          // Fetch skipped levels
          const { data: skippedData, error: skippedError } = await supabase
            .from("skipped_levels")
            .select("level_id")
            .eq("user_id", user.id);

          if (skippedError)
            console.error("Error fetching skipped levels:", skippedError);

          // Fetch quiz attempts (for Streak)
          const { data: quizData, error: quizError } = await supabase
            .from("quiz_attempts")
            .select("created_at")
            .eq("user_id", user.id);

          if (quizError)
            console.error("Error fetching quiz attempts:", quizError);

          if (lessonData) {
            const dbLessons = lessonData.map((r) => r.lesson_id);
            const dbScores = lessonData.reduce(
              (acc, r) => ({ ...acc, [r.lesson_id]: r.score }),
              {},
            );

            // Deduplicate
            const uniqueLessons = Array.from(new Set([...dbLessons]));
            setCompletedLessons(uniqueLessons);

            // Merge Scores
            setLessonScores(dbScores);

            // Update local cache for lessons
            localStorage.setItem(keyLessons, JSON.stringify(uniqueLessons));
            localStorage.setItem(keyScores, JSON.stringify(dbScores));
          }

          // Calculate Streak and Active Days (combining Lessons + Quizzes)
          // Get all dates from lessons
          const lessonDates = lessonData
            ? lessonData.map((r) => r.completed_at)
            : [];
          // Get all dates from quizzes
          const quizDates = quizData ? quizData.map((r) => r.created_at) : [];

          // Combine and format
          const allDates = [...lessonDates, ...quizDates].map((dateStr) =>
            new Date(dateStr).toDateString(),
          );

          const uniqueDates = [...new Set(allDates)];

          let calculatedStreak = 0;
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // Check last 7 days for activity (for grid display)
          const last7Days: boolean[] = [];
          for (let i = 6; i >= 0; i--) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            last7Days.push(uniqueDates.includes(checkDate.toDateString()));
          }
          setActiveDays(last7Days);

          // Calculate consecutive streak from today backwards
          // Logic: If today is active, start counting from today.
          // If today is NOT active, but yesterday IS, start counting from yesterday.
          // If neither, streak is 0.

          let startIndex = 0;
          if (!uniqueDates.includes(today.toDateString())) {
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            if (uniqueDates.includes(yesterday.toDateString())) {
              startIndex = 1; // Start checking from yesterday
            } else {
              startIndex = -1; // No streak
            }
          }

          if (startIndex !== -1) {
            for (let i = startIndex; i < 365; i++) {
              const checkDate = new Date(today);
              checkDate.setDate(today.getDate() - i);
              if (uniqueDates.includes(checkDate.toDateString())) {
                calculatedStreak++;
              } else {
                break;
              }
            }
          }

          setStreak(calculatedStreak);

          if (skippedData) {
            const dbSkipped = skippedData.map((r) => r.level_id);
            const uniqueSkipped = Array.from(new Set([...dbSkipped]));
            setSkippedLevels(uniqueSkipped);
            localStorage.setItem(keySkipped, JSON.stringify(uniqueSkipped));
          }
        } catch (err) {
          console.error("Failed to sync progress from backend:", err);
          // Keep using local storage data if backend fails
        }
      }
      setIsLoading(false);
    };

    loadProgress();
  }, [getKeys, user?.id]);

  const completeTopic = useCallback(
    (topic: string) => {
      const { unlocked: keyUnlocked, completed: keyCompleted } = getKeys();

      // 1. Mark as completed
      let newCompleted = [...completedTopics];
      if (!completedTopics.includes(topic)) {
        newCompleted = [...completedTopics, topic];
        setCompletedTopics(newCompleted);
        localStorage.setItem(keyCompleted, JSON.stringify(newCompleted));
      }

      // 2. Unlock next topic
      const currentIndex = TOPICS.indexOf(topic);
      if (currentIndex !== -1 && currentIndex < TOPICS.length - 1) {
        const nextTopic = TOPICS[currentIndex + 1];
        // Ensure next topic exists and is not already unlocked
        if (nextTopic && !unlockedTopics.includes(nextTopic)) {
          const newUnlocked = [...unlockedTopics, nextTopic];
          setUnlockedTopics(newUnlocked);
          localStorage.setItem(keyUnlocked, JSON.stringify(newUnlocked));
        }
      }
    },
    [completedTopics, unlockedTopics, getKeys],
  );

  const completeLesson = useCallback(
    async (lessonId: string | string[], score?: number) => {
      if (!lessonId) return;

      const ids = Array.isArray(lessonId) ? lessonId : [lessonId];
      if (ids.length === 0) return;

      // Optimistic UI Update
      const currentLessons = [...completedLessons];
      const newIdsToAdd = ids.filter((id) => !currentLessons.includes(id));

      const newLessons = [...currentLessons, ...newIdsToAdd];

      const newScores = { ...lessonScores };
      if (score !== undefined && !Array.isArray(lessonId)) {
        newScores[lessonId as string] = score;
      }

      setCompletedLessons(newLessons);
      setLessonScores(newScores);

      const { lessons: keyLessons, scores: keyScores } = getKeys();
      localStorage.setItem(keyLessons, JSON.stringify(newLessons));
      localStorage.setItem(keyScores, JSON.stringify(newScores));

      // Backend Update
      if (user?.id) {
        try {
          // Prepare upsert data
          const updates = ids.map((id) => ({
            user_id: user.id,
            lesson_id: id,
            score: score !== undefined && ids.length === 1 ? score : 100,
            completed_at: new Date().toISOString(),
          }));

          const { error } = await supabase
            .from("lesson_completions")
            .upsert(updates, { onConflict: "user_id, lesson_id" })
            .select();

          if (error) {
            console.error("Failed to save lesson progress:", error);
            toast({
              title: "Sync Error",
              description:
                "Could not save progress to cloud. It is saved locally.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Progress Saved",
              description: "Your lesson progress has been synced.",
              variant: "default",
            });
          }
        } catch (err) {
          console.error("Backend save exception:", err);
        }
      } else {
        toast({
          title: "Progress Saved Locally",
          description: "Log in to sync your progress across devices.",
          variant: "default",
        });
      }
    },
    [completedLessons, lessonScores, getKeys, user?.id],
  );

  const isTopicLocked = useCallback(
    (topic: string) => !unlockedTopics.includes(topic),
    [unlockedTopics],
  );
  const isTopicCompleted = useCallback(
    (topic: string) => completedTopics.includes(topic),
    [completedTopics],
  );

  // New Lesson Check
  const isLessonCompleted = useCallback(
    (lessonId: string) => completedLessons.includes(lessonId),
    [completedLessons],
  );
  const isLessonLocked = useCallback(
    (lessonId: string, previousLessonId?: string) => {
      // Simple logic: locked if previous lesson is NOT completed
      if (!previousLessonId) return false; // First lesson is unlocked
      return !completedLessons.includes(previousLessonId);
    },
    [completedLessons],
  );

  // Helper to get score
  const getLessonScore = useCallback(
    (lessonId: string) => lessonScores[lessonId] || 0,
    [lessonScores],
  );

  // Helper to reset progress (useful for testing)
  const resetProgress = useCallback(() => {
    const {
      unlocked: keyUnlocked,
      completed: keyCompleted,
      lessons: keyLessons,
      scores: keyScores,
    } = getKeys();
    localStorage.removeItem(keyUnlocked);
    localStorage.removeItem(keyCompleted);
    localStorage.removeItem(keyLessons);
    localStorage.removeItem(keyScores);
    setUnlockedTopics([TOPICS[0] || "Academic"]);
    setCompletedTopics([]);
    setCompletedLessons([]);
    setLessonScores({});
  }, [getKeys]);

  // Level Skip Logic (Test Out)
  const [skippedLevels, setSkippedLevels] = useState<string[]>([]);

  // ... inside getKeys ...
  //   skipped: `english_hub_skipped_levels${suffix}`

  // ... inside useEffect (load) ...
  //   const { ..., skipped: keySkipped } = getKeys();
  //   const storedSkipped = localStorage.getItem(keySkipped);
  //   if (storedSkipped) { try { setSkippedLevels(JSON.parse(storedSkipped)); } catch (e) { console.error(e); setSkippedLevels([]); } }

  const skipLevel = useCallback(
    async (level: string) => {
      const { lessons: keyLessons, skipped: keySkipped } = getKeys();

      // Mark level as skipped
      const newSkipped = [...skippedLevels, level];
      if (!skippedLevels.includes(level)) {
        setSkippedLevels(newSkipped);
        localStorage.setItem(keySkipped, JSON.stringify(newSkipped));

        // Sync with Supabase
        if (user?.id) {
          try {
            const { error } = await supabase.from("skipped_levels").insert({
              user_id: user.id,
              level_id: level,
            });

            if (error) {
              console.error("Error syncing skipped level:", error);
            }
          } catch (err) {
            console.error("Exception syncing skipped level:", err);
          }
        }
      }

      // OPTIONAL: Mark all lessons in this level as completed too?
      // User request says "unlock level", but for stats consistency it might be good to auto-complete.
      // For now, we will just UNLOCK the next level. If we want to fill the progress bar, we would need to mark lessons.
      // Let's just track the skip for unlocking purposes first.
    },
    [skippedLevels, getKeys, user?.id],
  );

  const isLevelSkipped = useCallback(
    (level: string) => skippedLevels.includes(level),
    [skippedLevels],
  );

  return {
    // ...
    completedLessons,
    completeLesson,
    isLessonCompleted,
    isLessonLocked,
    getLessonScore,
    lessonScores,
    isLoading,

    // Skip/Test Out
    skippedLevels,
    skipLevel,
    isLevelSkipped,

    // Streak
    streak,
    activeDays,

    resetProgress,
  };
}
