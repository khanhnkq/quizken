import { useEffect, useRef, useCallback, useState } from 'react';

export interface BroadcastMessage {
  type: string;
  data?: unknown;
  timestamp: number;
  tabId: string;
}

export interface UseBroadcastChannelOptions {
  channelName: string;
  onMessage?: (message: BroadcastMessage) => void;
  onError?: (error: Event) => void;
}

export interface UseBroadcastChannelReturn {
  postMessage: (type: string, data?: unknown) => void;
  isSupported: boolean;
  isConnected: boolean;
  tabId: string;
}

/**
 * Hook for cross-tab communication using BroadcastChannel API
 * Provides a simple interface for sending and receiving messages between tabs
 * 
 * @param options Configuration object
 * @returns Object with postMessage function and connection status
 */
export const useBroadcastChannel = ({
  channelName,
  onMessage,
  onError,
}: UseBroadcastChannelOptions): UseBroadcastChannelReturn => {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSupported] = useState(() => typeof BroadcastChannel !== 'undefined');
  const tabIdRef = useRef<string>(`tab_${Math.random().toString(36).substr(2, 9)}`);

  // Initialize BroadcastChannel
  useEffect(() => {
    if (!isSupported) {
      console.warn('BroadcastChannel is not supported in this browser');
      return;
    }

    try {
      const channel = new BroadcastChannel(channelName);
      channelRef.current = channel;
      setIsConnected(true);

      // Set up message listener
      const handleMessage = (event: MessageEvent) => {
        try {
          const message: BroadcastMessage = event.data;
          
          // Ignore messages from this tab
          if (message.tabId === tabIdRef.current) {
            return;
          }

          // Validate message structure
          if (typeof message === 'object' && message !== null && 
              typeof message.type === 'string' && 
              typeof message.timestamp === 'number') {
            onMessage?.(message);
          }
        } catch (error) {
          console.error('Error handling broadcast message:', error);
        }
      };

      // Set up error listener
      const handleError = (error: Event) => {
        console.error('BroadcastChannel error:', error);
        onError?.(error);
      };

      channel.addEventListener('message', handleMessage);
      channel.addEventListener('error', handleError);

      // Cleanup function
      return () => {
        channel.removeEventListener('message', handleMessage);
        channel.removeEventListener('error', handleError);
        channel.close();
        channelRef.current = null;
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Failed to create BroadcastChannel:', error);
      onError?.(error as Event);
    }
  }, [channelName, onMessage, onError, isSupported]);

  // Post message function
  const postMessage = useCallback((type: string, data?: unknown) => {
    if (!channelRef.current || !isConnected) {
      console.warn('BroadcastChannel not available for posting message');
      return;
    }

    try {
      const message: BroadcastMessage = {
        type,
        data,
        timestamp: Date.now(),
        tabId: tabIdRef.current,
      };

      channelRef.current.postMessage(message);
    } catch (error) {
      console.error('Error posting broadcast message:', error);
    }
  }, [isConnected]);

  return {
    postMessage,
    isSupported,
    isConnected,
    tabId: tabIdRef.current,
  };
};

export default useBroadcastChannel;
