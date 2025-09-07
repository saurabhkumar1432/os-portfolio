import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { pwaService } from '../../services/pwaService';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const connectionChange = (data: { online: boolean }) => {
      setIsOnline(data.online);
      
      // Show notification briefly when connection changes
      setShowNotification(true);
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);

      return () => clearTimeout(timer);
    };

    // Listen for connection changes
    pwaService.addEventListener('connectionChange', connectionChange);

    return () => {
      pwaService.removeEventListener('connectionChange', connectionChange);
    };
  }, []);

  // Always show offline indicator when offline
  if (!isOnline) {
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="
          bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800
          text-orange-800 dark:text-orange-200 px-4 py-2 rounded-lg shadow-lg
          flex items-center gap-2 text-sm font-medium
        ">
          <WifiOff size={16} />
          You are offline
        </div>
      </div>
    );
  }

  // Show temporary notification when coming back online
  if (showNotification && isOnline) {
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="
          bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800
          text-green-800 dark:text-green-200 px-4 py-2 rounded-lg shadow-lg
          flex items-center gap-2 text-sm font-medium
          animate-in slide-in-from-top-2
        ">
          <Wifi size={16} />
          Back online
        </div>
      </div>
    );
  }

  return null;
}

export default OfflineIndicator;