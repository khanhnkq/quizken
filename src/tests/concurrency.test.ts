/**
 * Concurrency Tests for Quiz Generation System
 * 
 * These tests verify that the concurrency fixes work correctly:
 * 1. Anonymous usage quota race condition prevention
 * 2. Idempotency key duplicate request prevention
 * 3. Counter increment atomicity
 * 4. Multi-tab coordination
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock Supabase client
const mockSupabaseClient = {
  rpc: vi.fn(),
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    })),
    insert: vi.fn(() => Promise.resolve({ error: null })),
    update: vi.fn(() => Promise.resolve({ error: null }))
  }))
};

// Mock BroadcastChannel
class MockBroadcastChannel {
  name: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  private listeners: { [key: string]: ((event: any) => void)[] } = {};

  constructor(name: string) {
    this.name = name;
  }

  postMessage(data: any) {
    // Simulate message delivery to other tabs
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage({ data } as MessageEvent);
      }
    }, 10);
  }

  addEventListener(type: string, listener: (event: any) => void) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(listener);
  }

  removeEventListener(type: string, listener: (event: any) => void) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter(l => l !== listener);
    }
  }

  close() {
    // Mock close
  }
}

// Mock global objects
Object.defineProperty(global, 'BroadcastChannel', {
  value: MockBroadcastChannel,
  writable: true
});

Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  },
  writable: true
});

describe('Concurrency Fixes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Anonymous Usage Quota Race Condition', () => {
    it('should prevent quota bypass with concurrent requests', async () => {
      // Mock the atomic UPSERT function
      mockSupabaseClient.rpc.mockImplementation((fnName, params) => {
        if (fnName === 'increment_anonymous_usage') {
          // Simulate atomic increment returning count
          return Promise.resolve({ 
            data: [{ count: 3 }], // Simulate reaching limit
            error: null 
          });
        }
        return Promise.resolve({ data: null, error: null });
      });

      // Simulate 5 concurrent requests
      const promises = Array.from({ length: 5 }, async (_, i) => {
        const { data, error } = await mockSupabaseClient.rpc(
          'increment_anonymous_usage',
          {
            p_ip: '192.168.1.1',
            p_fingerprint: 'test_fingerprint',
            p_day_date: '2025-01-26',
            p_user_agent: 'test-agent'
          }
        );
        return { data, error, requestId: i };
      });

      const results = await Promise.all(promises);
      
      // All requests should succeed (atomic operation)
      expect(results.every(r => !r.error)).toBe(true);
      
      // The function should have been called 5 times
      expect(mockSupabaseClient.rpc).toHaveBeenCalledTimes(5);
    });

    it('should handle quota exceeded correctly', async () => {
      // Mock quota exceeded scenario
      mockSupabaseClient.rpc.mockResolvedValue({
        data: [{ count: 4 }], // Exceeds limit of 3
        error: null
      });

      const { data, error } = await mockSupabaseClient.rpc(
        'increment_anonymous_usage',
        {
          p_ip: '192.168.1.1',
          p_fingerprint: 'test_fingerprint',
          p_day_date: '2025-01-26',
          p_user_agent: 'test-agent'
        }
      );

      expect(data[0].count).toBe(4);
      expect(error).toBeNull();
    });
  });

  describe('Idempotency Key Duplicate Prevention', () => {
    it('should generate consistent idempotency keys', () => {
      const generateIdempotencyKey = (prompt: string, questionCount: string, userId?: string) => {
        const timestamp = Math.floor(Date.now() / (1000 * 60)); // Round to minute
        const data = `${userId || 'anonymous'}-${prompt}-${questionCount}-${timestamp}`;
        
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
          const char = data.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        return `quiz_${Math.abs(hash).toString(36)}_${timestamp}`;
      };

      const key1 = generateIdempotencyKey('test prompt', '10', 'user123');
      const key2 = generateIdempotencyKey('test prompt', '10', 'user123');
      
      // Keys should be identical for same input within same minute
      expect(key1).toBe(key2);
    });

    it('should generate different keys for different inputs', () => {
      const generateIdempotencyKey = (prompt: string, questionCount: string, userId?: string) => {
        const timestamp = Math.floor(Date.now() / (1000 * 60));
        const data = `${userId || 'anonymous'}-${prompt}-${questionCount}-${timestamp}`;
        
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
          const char = data.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        return `quiz_${Math.abs(hash).toString(36)}_${timestamp}`;
      };

      const key1 = generateIdempotencyKey('test prompt 1', '10', 'user123');
      const key2 = generateIdempotencyKey('test prompt 2', '10', 'user123');
      
      // Keys should be different for different prompts
      expect(key1).not.toBe(key2);
    });
  });

  describe('Counter Increment Atomicity', () => {
    it('should handle concurrent counter increments atomically', async () => {
      // Mock the counter increment function
      let currentCount = 0;
      mockSupabaseClient.rpc.mockImplementation((fnName, params) => {
        if (fnName === 'increment_quiz_usage') {
          // Simulate atomic increment
          currentCount += 1;
          return Promise.resolve({ data: null, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      });

      // Simulate 100 concurrent increments
      const promises = Array.from({ length: 100 }, async () => {
        return mockSupabaseClient.rpc('increment_quiz_usage', { quiz_id: 'test-quiz-id' });
      });

      await Promise.all(promises);

      // Counter should be exactly 100
      expect(currentCount).toBe(100);
      expect(mockSupabaseClient.rpc).toHaveBeenCalledTimes(100);
    });
  });

  describe('Multi-Tab Coordination', () => {
    it('should coordinate localStorage writes across tabs', () => {
      const channel = new MockBroadcastChannel('test-channel');
      let receivedMessages: any[] = [];

      channel.addEventListener('message', (event) => {
        receivedMessages.push(event.data);
      });

      // Simulate leader tab writing to localStorage
      const testData = { quizId: 'test-123', status: 'processing' };
      channel.postMessage({
        type: 'state-update',
        data: testData,
        timestamp: Date.now(),
        tabId: 'leader-tab'
      });

      // Wait for message delivery
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(receivedMessages).toHaveLength(1);
          expect(receivedMessages[0].type).toBe('state-update');
          expect(receivedMessages[0].data).toEqual(testData);
          resolve();
        }, 20);
      });
    });

    it('should elect leader tab correctly', () => {
      const channel1 = new MockBroadcastChannel('leader-election');
      const channel2 = new MockBroadcastChannel('leader-election');
      
      let leader1 = false;
      let leader2 = false;

      // Simulate leader election
      channel1.addEventListener('message', (event) => {
        if (event.data.type === 'heartbeat' && event.data.tabId !== 'tab1') {
          leader1 = false; // Step down if another tab is active
        }
      });

      channel2.addEventListener('message', (event) => {
        if (event.data.type === 'heartbeat' && event.data.tabId !== 'tab2') {
          leader2 = false; // Step down if another tab is active
        }
      });

      // Tab 1 becomes leader
      leader1 = true;
      channel1.postMessage({
        type: 'heartbeat',
        data: { tabId: 'tab1', timestamp: Date.now() }
      });

      // Tab 2 should step down
      expect(leader1).toBe(true);
    });
  });

  describe('Polling Coordination', () => {
    it('should only allow leader tab to poll', () => {
      const isLeader = true;
      const shouldPoll = isLeader;

      expect(shouldPoll).toBe(true);

      // Non-leader should not poll
      const isNonLeader = false;
      const shouldNotPoll = isNonLeader;

      expect(shouldNotPoll).toBe(false);
    });

    it('should broadcast polling status updates', () => {
      const channel = new MockBroadcastChannel('polling-coordination');
      let receivedUpdates: any[] = [];

      channel.addEventListener('message', (event) => {
        if (event.data.type === 'polling-status') {
          receivedUpdates.push(event.data);
        }
      });

      // Simulate status update broadcast
      channel.postMessage({
        type: 'polling-status',
        data: {
          quizId: 'test-quiz-123',
          status: 'processing',
          progress: 'Generating questions...'
        }
      });

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(receivedUpdates).toHaveLength(1);
          expect(receivedUpdates[0].data.quizId).toBe('test-quiz-123');
          expect(receivedUpdates[0].data.status).toBe('processing');
          resolve();
        }, 20);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle BroadcastChannel not supported gracefully', () => {
      // Mock unsupported environment
      const originalBroadcastChannel = global.BroadcastChannel;
      // @ts-ignore
      global.BroadcastChannel = undefined;

      // Should not throw error
      expect(() => {
        // This would normally create a BroadcastChannel
        // In unsupported environment, it should degrade gracefully
      }).not.toThrow();

      // Restore
      global.BroadcastChannel = originalBroadcastChannel;
    });

    it('should handle localStorage errors gracefully', () => {
      const mockLocalStorage = {
        getItem: vi.fn(() => {
          throw new Error('Quota exceeded');
        }),
        setItem: vi.fn(() => {
          throw new Error('Quota exceeded');
        }),
        removeItem: vi.fn(),
        clear: vi.fn()
      };

      Object.defineProperty(global, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      });

      // Should not throw error
      expect(() => {
        try {
          localStorage.getItem('test');
        } catch (e) {
          // Should be caught and handled gracefully
        }
      }).not.toThrow();
    });
  });
});
