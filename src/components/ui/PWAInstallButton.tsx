import { useState, useEffect } from 'react';
import { Download, Smartphone, Monitor } from 'lucide-react';
import { pwaService } from '../../services/pwaService';

interface PWAInstallButtonProps {
  variant?: 'button' | 'banner' | 'minimal';
  className?: string;
}

export function PWAInstallButton({ variant = 'button', className = '' }: PWAInstallButtonProps) {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const updateInstallationState = (state: any) => {
      setCanInstall(state.canInstall);
      setIsInstalled(state.isInstalled);
    };

    // Get initial state
    const initialState = pwaService.getInstallationState();
    updateInstallationState(initialState);

    // Listen for changes
    pwaService.addEventListener('installationStateChange', updateInstallationState);

    return () => {
      pwaService.removeEventListener('installationStateChange', updateInstallationState);
    };
  }, []);

  const handleInstall = async () => {
    if (!canInstall) return;

    setIsInstalling(true);
    try {
      await pwaService.promptInstall();
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  // Don't show if already installed or can't install
  if (isInstalled || !canInstall) {
    return null;
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleInstall}
        disabled={isInstalling}
        className={`
          inline-flex items-center gap-2 px-3 py-1 text-sm
          bg-blue-600 hover:bg-blue-700 text-white rounded
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
          ${className}
        `}
        title="Install Portfolio OS"
      >
        <Download size={16} />
        {isInstalling ? 'Installing...' : 'Install'}
      </button>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`
        flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 
        border border-blue-200 dark:border-blue-800 rounded-lg
        ${className}
      `}>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Monitor size={20} className="text-white" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Install Portfolio OS
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get the full desktop experience with offline access
            </p>
          </div>
        </div>
        <button
          onClick={handleInstall}
          disabled={isInstalling}
          className="
            inline-flex items-center gap-2 px-4 py-2
            bg-blue-600 hover:bg-blue-700 text-white rounded-lg
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200 font-medium
          "
        >
          <Download size={18} />
          {isInstalling ? 'Installing...' : 'Install'}
        </button>
      </div>
    );
  }

  // Default button variant
  return (
    <button
      onClick={handleInstall}
      disabled={isInstalling}
      className={`
        inline-flex items-center gap-2 px-4 py-2
        bg-blue-600 hover:bg-blue-700 text-white rounded-lg
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200 font-medium
        ${className}
      `}
    >
      <Smartphone size={18} />
      {isInstalling ? 'Installing...' : 'Install App'}
    </button>
  );
}

export default PWAInstallButton;