import { useState, useEffect } from 'react';
import { pwaService } from '../services/pwaService';

interface PWAState {
  canInstall: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  updateAvailable: boolean;
  isUpdating: boolean;
  isOnline: boolean;
  capabilities: {
    serviceWorker: boolean;
    installPrompt: boolean;
    standalone: boolean;
    notifications: boolean;
    backgroundSync: boolean;
  };
}

export function usePWA() {
  const [state, setState] = useState<PWAState>({
    canInstall: false,
    isInstalled: false,
    isStandalone: false,
    updateAvailable: false,
    isUpdating: false,
    isOnline: navigator.onLine,
    capabilities: pwaService.getPWACapabilities(),
  });

  useEffect(() => {
    // Update installation state
    const updateInstallationState = (installationState: any) => {
      setState(prev => ({
        ...prev,
        canInstall: installationState.canInstall,
        isInstalled: installationState.isInstalled,
        isStandalone: installationState.isStandalone,
      }));
    };

    // Update update state
    const updateUpdateState = (updateState: any) => {
      setState(prev => ({
        ...prev,
        updateAvailable: updateState.updateAvailable,
        isUpdating: updateState.isUpdating,
      }));
    };

    // Update connection state
    const updateConnectionState = (connectionData: { online: boolean }) => {
      setState(prev => ({
        ...prev,
        isOnline: connectionData.online,
      }));
    };

    // Get initial states
    const initialInstallationState = pwaService.getInstallationState();
    const initialUpdateState = pwaService.getUpdateState();
    
    updateInstallationState(initialInstallationState);
    updateUpdateState(initialUpdateState);

    // Add event listeners
    pwaService.addEventListener('installationStateChange', updateInstallationState);
    pwaService.addEventListener('updateStateChange', updateUpdateState);
    pwaService.addEventListener('connectionChange', updateConnectionState);

    return () => {
      pwaService.removeEventListener('installationStateChange', updateInstallationState);
      pwaService.removeEventListener('updateStateChange', updateUpdateState);
      pwaService.removeEventListener('connectionChange', updateConnectionState);
    };
  }, []);

  const install = async (): Promise<boolean> => {
    return await pwaService.promptInstall();
  };

  const update = async (): Promise<void> => {
    return await pwaService.updateServiceWorker();
  };

  const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    return await pwaService.requestNotificationPermission();
  };

  const showNotification = (title: string, options?: NotificationOptions): void => {
    pwaService.showNotification(title, options);
  };

  return {
    ...state,
    install,
    update,
    requestNotificationPermission,
    showNotification,
  };
}

export default usePWA;