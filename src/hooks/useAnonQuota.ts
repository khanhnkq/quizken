import { useCallback, useEffect, useMemo, useState } from "react";

export type ResetEta = { hours: number; minutes: number } | null;

const ANON_COUNT_KEY = "anonymousQuizzes";
const ANON_LAST_RESET_KEY = "lastQuotaReset";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const DAILY_LIMIT = 3;

export const useAnonQuota = () => {
  const [count, setCount] = useState<number>(0);
  const [hasReachedLimit, setHasReachedLimit] = useState<boolean>(false);

  const readCount = useCallback(() => {
    const raw = localStorage.getItem(ANON_COUNT_KEY) || "0";
    return parseInt(raw, 10) || 0;
  }, []);

  const writeCount = useCallback((value: number) => {
    localStorage.setItem(ANON_COUNT_KEY, String(value));
    setCount(value);
  }, []);

  const checkQuotaReset = useCallback(() => {
    const last = localStorage.getItem(ANON_LAST_RESET_KEY);
    if (!last) return false;
    const diff = Date.now() - parseInt(last, 10);
    if (diff > ONE_DAY_MS) {
      localStorage.setItem(ANON_COUNT_KEY, "0");
      localStorage.setItem(ANON_LAST_RESET_KEY, String(Date.now()));
      setCount(0);
      setHasReachedLimit(false);
      return true;
    }
    return false;
  }, []);

  const getTimeUntilReset = useCallback((): ResetEta => {
    const last = localStorage.getItem(ANON_LAST_RESET_KEY);
    if (!last) return null;
    const diff = Date.now() - parseInt(last, 10);
    const remaining = ONE_DAY_MS - diff;
    if (remaining <= 0) return null;
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    return { hours, minutes };
  }, []);

  const increment = useCallback(() => {
    const current = readCount();
    const next = current + 1;
    writeCount(next);
    if (current === 0) {
      localStorage.setItem(ANON_LAST_RESET_KEY, String(Date.now()));
    }
    setHasReachedLimit(next >= DAILY_LIMIT);
    return next;
  }, [readCount, writeCount]);

  const reset = useCallback(() => {
    writeCount(0);
    localStorage.setItem(ANON_LAST_RESET_KEY, String(Date.now()));
    setHasReachedLimit(false);
  }, [writeCount]);

  useEffect(() => {
    checkQuotaReset();
    const c = readCount();
    setCount(c);
    setHasReachedLimit(c >= DAILY_LIMIT);
  }, [checkQuotaReset, readCount]);

  return useMemo(
    () => ({
      count,
      hasReachedLimit,
      increment,
      reset,
      checkQuotaReset,
      getTimeUntilReset,
      DAILY_LIMIT,
    }),
    [count, hasReachedLimit, increment, reset, checkQuotaReset, getTimeUntilReset]
  );
};
