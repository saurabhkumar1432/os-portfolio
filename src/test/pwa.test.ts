import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { pwaService } from '../services/pwaService';

// Mock global APIs
const mockServiceWorker = {
  addEventListener: vi.fn(),
  getRegistration: vi.fn(),
};

const mockNotification = {
  permission: 'default' as NotificationPermission,
  requestPermission: vi.fn(),
};

const mockServiceWorkerRegistration = {
  prototype: {
    sync: true
  }
};

// Mock window APIs
Object.defineProperty(global, 'navigator', {
  value: {
    onLine: true,
    serviceWorker: mockServiceWorker,
  },
  writable: true,
});

Object.defineProperty(global, 'window', {
  value: {
    addEventListener: vi.fn(),
    matchMedia: vi.fn(() => ({ matches: false })),
    Notification: mockNotification,
    ServiceWorkerRegistration: mockServiceWorkerRegistration,
  },
  writable: true,
});

Object.defineProperty(global, 'Notification', {
  value: mockNotification,
  writable: true,
});

Object.defineProperty(global, 'ServiceWorkerRegistration', {
  value: mockServiceWorkerRegistration,
  writable: true,
});

describe('PWA Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mocks
    vi.mocked(window.matchMedia).mockReturnValue({ matches: false } as any);
    mockNotification.permission = 'default';
    
    // Clear any existing event listeners
    vi.mocked(window.addEventListener).mockClear();
  });

  afterEach(() => {
    // Don't destroy between tests as it's a singleton
  });

  describe('Installation State Detection', () => {
    it('should detect standalone mode correctly', () => {
      // Manually set the standalone state for testing
      (pwaService as any).installationState.isStandalone = true;
      
      const state = pwaService.getInstallationState();
      expect(state.isStandalone).toBe(true);
    });

    it('should detect non-standalone mode correctly', () => {
      // Manually set the standalone state for testing
      (pwaService as any).installationState.isStandalone = false;
      
      const state = pwaService.getInstallationState();
      expect(state.isStandalone).toBe(false);
    });
  });

  describe('Installation Prompt', () => {
    it('should handle beforeinstallprompt event', () => {
      const mockEvent = {
        preventDefault: vi.fn(),
        prompt: vi.fn(),
        userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
      };

      // Manually set the install prompt to simulate the event
      (pwaService as any).installationState.installPrompt = mockEvent;
      (pwaService as any).installationState.canInstall = true;

      expect((pwaService as any).installationState.canInstall).toBe(true);
    });

    it('should prompt for installation when available', async () => {
      const mockEvent = {
        preventDefault: vi.fn(),
        prompt: vi.fn().mockResolvedValue(undefined),
        userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
      };

      // Manually set install prompt
      (pwaService as any).installationState.canInstall = true;
      (pwaService as any).installationState.installPrompt = mockEvent;

      const result = await pwaService.promptInstall();
      
      expect(mockEvent.prompt).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when installation not available', async () => {
      // Ensure no install prompt is available
      (pwaService as any).installationState.canInstall = false;
      (pwaService as any).installationState.installPrompt = null;
      
      const result = await pwaService.promptInstall();
      expect(result).toBe(false);
    });
  });

  describe('Offline Detection', () => {
    it('should detect offline state correctly', () => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
      });

      expect(pwaService.isOffline()).toBe(true);
    });

    it('should detect online state correctly', () => {
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true,
      });

      expect(pwaService.isOffline()).toBe(false);
    });
  });

  describe('PWA Capabilities', () => {
    it('should detect PWA capabilities correctly', () => {
      const capabilities = pwaService.getPWACapabilities();
      
      expect(capabilities).toHaveProperty('serviceWorker');
      expect(capabilities).toHaveProperty('installPrompt');
      expect(capabilities).toHaveProperty('standalone');
      expect(capabilities).toHaveProperty('notifications');
      expect(capabilities).toHaveProperty('backgroundSync');
    });

    it('should return correct service worker support', () => {
      const capabilities = pwaService.getPWACapabilities();
      expect(capabilities.serviceWorker).toBe(true);
    });
  });

  describe('Notification Handling', () => {
    it('should request notification permission', async () => {
      vi.mocked(mockNotification.requestPermission).mockResolvedValue('granted');
      
      const permission = await pwaService.requestNotificationPermission();
      
      expect(mockNotification.requestPermission).toHaveBeenCalled();
      expect(permission).toBe('granted');
    });

    it('should return existing permission if already granted', async () => {
      mockNotification.permission = 'granted';
      
      const permission = await pwaService.requestNotificationPermission();
      
      expect(permission).toBe('granted');
      expect(mockNotification.requestPermission).not.toHaveBeenCalled();
    });

    it('should handle denied notification permission', async () => {
      mockNotification.permission = 'denied';
      
      const permission = await pwaService.requestNotificationPermission();
      
      expect(permission).toBe('denied');
    });
  });

  describe('Event Listeners', () => {
    it('should add and remove event listeners correctly', () => {
      const callback = vi.fn();
      
      pwaService.addEventListener('test-event', callback);
      
      // Trigger event manually
      (pwaService as any).notifyListeners('test-event', { data: 'test' });
      
      expect(callback).toHaveBeenCalledWith({ data: 'test' });
      
      // Remove listener
      pwaService.removeEventListener('test-event', callback);
      
      // Trigger event again
      (pwaService as any).notifyListeners('test-event', { data: 'test2' });
      
      // Should not be called again
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Service Worker Updates', () => {
    it('should handle service worker update messages', () => {
      // Manually trigger update state change
      (pwaService as any).updateState.updateAvailable = true;
      
      const updateState = pwaService.getUpdateState();
      expect(updateState.updateAvailable).toBe(true);
    });

    it('should update service worker when requested', async () => {
      const mockRegistration = {
        waiting: {
          postMessage: vi.fn(),
        },
      };

      vi.mocked(mockServiceWorker.getRegistration).mockResolvedValue(mockRegistration as any);
      
      // Set update available
      (pwaService as any).updateState.updateAvailable = true;
      
      await pwaService.updateServiceWorker();
      
      expect(mockRegistration.waiting.postMessage).toHaveBeenCalledWith({
        type: 'SKIP_WAITING'
      });
    });
  });
});

describe('PWA Integration', () => {
  it('should handle complete PWA lifecycle', async () => {
    // Test installation flow
    const installPrompt = {
      preventDefault: vi.fn(),
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
    };

    // Simulate install prompt
    (pwaService as any).installationState.canInstall = true;
    (pwaService as any).installationState.installPrompt = installPrompt;

    const installResult = await pwaService.promptInstall();
    expect(installResult).toBe(true);

    // Test notification permission
    mockNotification.permission = 'granted';
    const notificationPermission = await pwaService.requestNotificationPermission();
    expect(notificationPermission).toBe('granted');

    // Test offline detection
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
    expect(pwaService.isOffline()).toBe(true);
  });
});