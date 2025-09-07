import { useState, useEffect } from 'react';
import { RefreshCw, X, Download } from 'lucide-react';
import { pwaService } from '../../services/pwaService';

export function PWAUpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateStateChange = (state: any) => {
      setUpdateAvailable(state.updateAvailable);
      setIsUpdating(state.isUpdating);
      
      if (state.updateAvailable && !isVisible) {
        setIsVisible(true);
      }
    };

    // Get initial state
    const initialState = pwaService.getUpdateState();
    updateStateChange(initialState);

    // Listen for changes
    pwaService.addEventListener('updateStateChange', updateStateChange);

    return () => {
      pwaService.removeEventListener('updateStateChange', updateStateChange);
    };
  }, [isVisible]);

  const handleUpdate = async () => {
    try {
      await pwaService.updateServiceWorker();
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!updateAvailable || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="
        bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
        rounded-lg shadow-lg p-4 animate-in slide-in-from-bottom-2
      ">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <Download size={16} className="text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              Update Available
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              A new version of Portfolio OS is ready to install.
            </p>
            
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="
                  inline-flex items-center gap-1 px-3 py-1 text-sm
                  bg-green-600 hover:bg-green-700 text-white rounded
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors duration-200
                "
              >
                <RefreshCw 
                  size={14} 
                  className={isUpdating ? 'animate-spin' : ''} 
                />
                {isUpdating ? 'Updating...' : 'Update'}
              </button>
              
              <button
                onClick={handleDismiss}
                className="
                  px-3 py-1 text-sm text-gray-600 dark:text-gray-400
                  hover:text-gray-800 dark:hover:text-gray-200
                  transition-colors duration-200
                "
              >
                Later
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="
              flex-shrink-0 p-1 text-gray-400 hover:text-gray-600
              dark:text-gray-500 dark:hover:text-gray-300
              transition-colors duration-200
            "
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PWAUpdateNotification;