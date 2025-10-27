import { useEffect, useRef, useCallback, useState } from 'react';
import { useBroadcastChannel, BroadcastMessage } from './useBroadcastChannel';

export interface UseLeaderElectionOptions {
  channelName?: string;
  heartbeatInterval?: number;
  electionTimeout?: number;
  onLeaderChange?: (isLeader: boolean) => void;
}

export interface UseLeaderElectionReturn {
  isLeader: boolean;
  isElected: boolean;
  tabId: string;
  forceElection: () => void;
  stepDown: () => void;
}

/**
 * Hook for implementing leader election across browser tabs
 * Ensures only one tab acts as the "leader" for coordinating shared resources
 * 
 * @param options Configuration object
 * @returns Object with leader status and control functions
 */
export const useLeaderElection = ({
  channelName = 'quiz-leader-election',
  heartbeatInterval = 5000, // 5 seconds
  electionTimeout = 10000, // 10 seconds
  onLeaderChange,
}: UseLeaderElectionOptions = {}): UseLeaderElectionReturn => {
  const [isLeader, setIsLeader] = useState(false);
  const [isElected, setIsElected] = useState(false);
  const tabIdRef = useRef<string>(`tab_${Math.random().toString(36).substr(2, 9)}`);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const electionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastHeartbeatRef = useRef<number>(0);
  const isElectionInProgressRef = useRef<boolean>(false);

  // Handle incoming messages
  const handleMessage = useCallback((message: BroadcastMessage) => {
    if (message.type === 'heartbeat') {
      const heartbeatData = message.data as { tabId: string; timestamp: number };
      if (heartbeatData && heartbeatData.tabId !== tabIdRef.current) {
        lastHeartbeatRef.current = heartbeatData.timestamp;
        
        // If we're the leader and another tab is sending heartbeats, step down
        if (isLeader && heartbeatData.timestamp > lastHeartbeatRef.current) {
          console.log('Another tab is active, stepping down as leader');
          stepDown();
        }
      }
    } else if (message.type === 'election') {
      const electionData = message.data as { tabId: string; timestamp: number };
      if (electionData && electionData.tabId !== tabIdRef.current) {
        // Another tab is running for election, cancel our election if we started later
        if (isElectionInProgressRef.current && electionData.timestamp > Date.now() - electionTimeout) {
          console.log('Another tab is running for election, canceling ours');
          isElectionInProgressRef.current = false;
          if (electionTimeoutRef.current) {
            clearTimeout(electionTimeoutRef.current);
            electionTimeoutRef.current = null;
          }
        }
      }
    } else if (message.type === 'leader-step-down') {
      // Current leader stepped down, start election
      if (!isLeader && !isElectionInProgressRef.current) {
        console.log('Leader stepped down, starting election');
        startElection();
      }
    }
  }, [isLeader]);

  // Set up BroadcastChannel
  const { postMessage, isSupported, isConnected } = useBroadcastChannel({
    channelName,
    onMessage: handleMessage,
  });

  // Start heartbeat as leader
  const startHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }

    heartbeatRef.current = setInterval(() => {
      if (isLeader) {
        postMessage('heartbeat', {
          tabId: tabIdRef.current,
          timestamp: Date.now(),
        });
      }
    }, heartbeatInterval);
  }, [isLeader, postMessage, heartbeatInterval]);

  // Stop heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  // Start election process
  const startElection = useCallback(() => {
    if (isElectionInProgressRef.current || isLeader) {
      return;
    }

    console.log('Starting leader election');
    isElectionInProgressRef.current = true;

    // Announce candidacy
    postMessage('election', {
      tabId: tabIdRef.current,
      timestamp: Date.now(),
    });

    // Set timeout for election
    electionTimeoutRef.current = setTimeout(() => {
      if (isElectionInProgressRef.current) {
        console.log('Election timeout reached, becoming leader');
        setIsLeader(true);
        setIsElected(true);
        isElectionInProgressRef.current = false;
        onLeaderChange?.(true);
      }
    }, electionTimeout);
  }, [postMessage, electionTimeout, onLeaderChange, isLeader]);

  // Step down as leader
  const stepDown = useCallback(() => {
    if (isLeader) {
      console.log('Stepping down as leader');
      setIsLeader(false);
      stopHeartbeat();
      postMessage('leader-step-down', {
        tabId: tabIdRef.current,
        timestamp: Date.now(),
      });
      onLeaderChange?.(false);
    }
  }, [isLeader, stopHeartbeat, postMessage, onLeaderChange]);

  // Force new election
  const forceElection = useCallback(() => {
    if (isLeader) {
      stepDown();
    }
    startElection();
  }, [isLeader, stepDown, startElection]);

  // Initialize leader election when component mounts
  useEffect(() => {
    if (!isSupported || !isConnected) {
      return;
    }

    // Start election after a short delay to allow other tabs to register
    const initTimeout = setTimeout(() => {
      if (!isLeader && !isElected) {
        startElection();
      }
    }, 1000);

    return () => {
      clearTimeout(initTimeout);
    };
  }, [isSupported, isConnected, isLeader, isElected, startElection]);

  // Start/stop heartbeat when leader status changes
  useEffect(() => {
    if (isLeader) {
      startHeartbeat();
    } else {
      stopHeartbeat();
    }

    return () => {
      stopHeartbeat();
    };
  }, [isLeader, startHeartbeat, stopHeartbeat]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopHeartbeat();
      if (electionTimeoutRef.current) {
        clearTimeout(electionTimeoutRef.current);
      }
      if (isLeader) {
        stepDown();
      }
    };
  }, [stopHeartbeat, isLeader, stepDown]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, step down as leader
        if (isLeader) {
          console.log('Page hidden, stepping down as leader');
          stepDown();
        }
      } else {
        // Page is visible, start election if no leader
        if (!isLeader && !isElected) {
          console.log('Page visible, starting election');
          startElection();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLeader, isElected, stepDown, startElection]);

  return {
    isLeader,
    isElected,
    tabId: tabIdRef.current,
    forceElection,
    stepDown,
  };
};

export default useLeaderElection;
