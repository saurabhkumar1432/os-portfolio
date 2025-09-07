import { useEffect } from 'react';
import './App.css';
import { DesktopOS } from './components';
import { getURLStateService } from './services/urlStateService';
import { useDeepLinkRestoration, useURLValidation } from './hooks/useDeepLinkRestoration';
import { performanceMonitor } from './utils/performanceMonitor';
// preloadService is initialized automatically
import { pwaService } from './services/pwaService';
import { PWAUpdateNotification } from './components/ui/PWAUpdateNotification';
import { OfflineIndicator } from './components/ui/OfflineIndicator';

function App() {
  // Enable deep link restoration for production use
  const { isRestoring, restorationError } = useDeepLinkRestoration();
  const { isValidURL, validationError } = useURLValidation();

  useEffect(() => {
    // Services are auto-initialized when imported
    // URL state service is already active via singleton
    // Performance monitoring is passive
    // PWA service handles installation prompts automatically
    
    return () => {
      // Clean up on unmount
      getURLStateService().destroy?.();
      performanceMonitor.destroy?.();
      pwaService.destroy?.();
    };
  }, []);

  // Show loading state during restoration
  if (isRestoring) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Restoring application state...</p>
        </div>
      </div>
    );
  }

  // Show error state if URL validation fails
  if (!isValidURL && validationError) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center max-w-md">
          <div className="text-red-400 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Invalid URL</h2>
          <p className="text-gray-300 mb-4">{validationError}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
          >
            Go to Desktop
          </button>
        </div>
      </div>
    );
  }

  // Show error state if restoration fails
  if (restorationError) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center max-w-md">
          <div className="text-yellow-400 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Restoration Error</h2>
          <p className="text-gray-300 mb-4">{restorationError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white mr-2"
          >
            Retry
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white"
          >
            Go to Desktop
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <DesktopOS />
      <PWAUpdateNotification />
      <OfflineIndicator />
    </>
  );
}

export default App;
