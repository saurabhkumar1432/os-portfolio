/**
 * PWA Service for handling installation, updates, and offline functionality
 */

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallationState {
  canInstall: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
}

interface PWAUpdateState {
  updateAvailable: boolean;
  isUpdating: boolean;
  needsRefresh: boolean;
}

export class PWAService {
  private static instance: PWAService;
  private installationState: PWAInstallationState = {
    canInstall: false,
    isInstalled: false,
    isStandalone: false,
    installPrompt: null,
  };
  private updateState: PWAUpdateState = {
    updateAvailable: false,
    isUpdating: false,
    needsRefresh: false,
  };
  private listeners: Map<string, Set<Function>> = new Map();

  private constructor() {
    this.initializePWA();
  }

  public static getInstance(): PWAService {
    if (!PWAService.instance) {
      PWAService.instance = new PWAService();
    }
    return PWAService.instance;
  }

  /**
   * Initialize PWA functionality
   */
  private initializePWA(): void {
    this.detectInstallationState();
    this.setupInstallPrompt();
    this.setupUpdateHandling();
    this.setupOfflineHandling();
  }

  /**
   * Detect current installation state
   */
  private detectInstallationState(): void {
    // Check if running in standalone mode
    this.installationState.isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    // Check if already installed
    this.installationState.isInstalled = this.installationState.isStandalone;

    this.notifyListeners('installationStateChange', this.installationState);
  }

  /**
   * Setup install prompt handling
   */
  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.installationState.installPrompt = event as BeforeInstallPromptEvent;
      this.installationState.canInstall = true;
      this.notifyListeners('installationStateChange', this.installationState);
    });

    window.addEventListener('appinstalled', () => {
      this.installationState.isInstalled = true;
      this.installationState.canInstall = false;
      this.installationState.installPrompt = null;
      this.notifyListeners('installationStateChange', this.installationState);
      
      // Track installation
      this.trackPWAEvent('app_installed');
    });
  }

  /**
   * Setup service worker update handling
   */
  private setupUpdateHandling(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATE_AVAILABLE') {
          this.updateState.updateAvailable = true;
          this.notifyListeners('updateStateChange', this.updateState);
        }
      });

      // Listen for controlling service worker changes
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (this.updateState.needsRefresh) {
          window.location.reload();
        }
      });
    }
  }

  /**
   * Setup offline handling
   */
  private setupOfflineHandling(): void {
    window.addEventListener('online', () => {
      this.notifyListeners('connectionChange', { online: true });
      this.showConnectionStatus('Back online');
    });

    window.addEventListener('offline', () => {
      this.notifyListeners('connectionChange', { online: false });
      this.showConnectionStatus('You are offline. Some features may be limited.');
    });
  }

  /**
   * Prompt user to install the PWA
   */
  public async promptInstall(): Promise<boolean> {
    if (!this.installationState.canInstall || !this.installationState.installPrompt) {
      return false;
    }

    try {
      await this.installationState.installPrompt.prompt();
      const choiceResult = await this.installationState.installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        this.trackPWAEvent('install_prompt_accepted');
        return true;
      } else {
        this.trackPWAEvent('install_prompt_dismissed');
        return false;
      }
    } catch (error) {
      console.error('Error prompting for installation:', error);
      return false;
    }
  }

  /**
   * Update the service worker
   */
  public async updateServiceWorker(): Promise<void> {
    if (!this.updateState.updateAvailable) {
      return;
    }

    this.updateState.isUpdating = true;
    this.notifyListeners('updateStateChange', this.updateState);

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          this.updateState.needsRefresh = true;
        }
      }
    } catch (error) {
      console.error('Error updating service worker:', error);
    } finally {
      this.updateState.isUpdating = false;
      this.notifyListeners('updateStateChange', this.updateState);
    }
  }

  /**
   * Check if the app is running offline
   */
  public isOffline(): boolean {
    return !navigator.onLine;
  }

  /**
   * Get installation state
   */
  public getInstallationState(): PWAInstallationState {
    return { ...this.installationState };
  }

  /**
   * Get update state
   */
  public getUpdateState(): PWAUpdateState {
    return { ...this.updateState };
  }

  /**
   * Add event listener
   */
  public addEventListener(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  /**
   * Remove event listener
   */
  public removeEventListener(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  /**
   * Notify listeners of events
   */
  private notifyListeners(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  /**
   * Show connection status notification
   */
  private showConnectionStatus(message: string): void {
    // This could integrate with a toast notification system
    console.log(`PWA: ${message}`);
    this.notifyListeners('statusMessage', { message, type: 'connection' });
  }

  /**
   * Track PWA events for analytics
   */
  private trackPWAEvent(event: string): void {
    // This could integrate with analytics
    console.log(`PWA Event: ${event}`);
    
    // Store in localStorage for basic tracking
    try {
      const events = JSON.parse(localStorage.getItem('pwa-events') || '[]');
      events.push({
        event,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      });
      
      // Keep only last 50 events
      if (events.length > 50) {
        events.splice(0, events.length - 50);
      }
      
      localStorage.setItem('pwa-events', JSON.stringify(events));
    } catch (error) {
      console.warn('Failed to track PWA event:', error);
    }
  }

  /**
   * Get PWA capabilities and support
   */
  public getPWACapabilities(): {
    serviceWorker: boolean;
    installPrompt: boolean;
    standalone: boolean;
    notifications: boolean;
    backgroundSync: boolean;
  } {
    return {
      serviceWorker: 'serviceWorker' in navigator,
      installPrompt: 'BeforeInstallPromptEvent' in window,
      standalone: this.installationState.isStandalone,
      notifications: 'Notification' in window,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
    };
  }

  /**
   * Request notification permission
   */
  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.trackPWAEvent(`notification_permission_${permission}`);
      return permission;
    }

    return Notification.permission;
  }

  /**
   * Show notification
   */
  public showNotification(title: string, options?: NotificationOptions): void {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        ...options,
      });
    }
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    this.listeners.clear();
  }
}

// Export singleton instance
export const pwaService = PWAService.getInstance();