import { useState, useCallback } from 'react';
import { useWindowStore } from '../store/windowStore';

interface CloseConfirmationState {
  isOpen: boolean;
  windowId: string | null;
  windowTitle: string;
}

export const useCloseConfirmation = () => {
  const { closeWindow, windows } = useWindowStore();
  const [confirmationState, setConfirmationState] = useState<CloseConfirmationState>({
    isOpen: false,
    windowId: null,
    windowTitle: '',
  });

  const requestClose = useCallback(async (windowId: string) => {
    const window = windows[windowId];
    if (!window) return;

    // If no unsaved state, close immediately
    if (!window.hasUnsavedState) {
      closeWindow(windowId);
      return;
    }

    // Show confirmation dialog
    setConfirmationState({
      isOpen: true,
      windowId,
      windowTitle: window.title,
    });
  }, [windows, closeWindow]);

  const confirmClose = useCallback(() => {
    if (confirmationState.windowId) {
      closeWindow(confirmationState.windowId, true); // Force close
    }
    setConfirmationState({
      isOpen: false,
      windowId: null,
      windowTitle: '',
    });
  }, [confirmationState.windowId, closeWindow]);

  const cancelClose = useCallback(() => {
    setConfirmationState({
      isOpen: false,
      windowId: null,
      windowTitle: '',
    });
  }, []);

  return {
    confirmationState,
    requestClose,
    confirmClose,
    cancelClose,
  };
};