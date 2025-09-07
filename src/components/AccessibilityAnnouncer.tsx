import React, { useEffect, useRef } from 'react';
import { useWindowStore } from '../store';
import { useAccessibilitySettings } from '../hooks';

interface AccessibilityAnnouncerProps {
  children?: React.ReactNode;
}

export const AccessibilityAnnouncer: React.FC<AccessibilityAnnouncerProps> = ({ children }) => {
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const { windows, getFocusedWindow } = useWindowStore();
  const { announceToScreenReader } = useAccessibilitySettings();

  useEffect(() => {
    const focusedWindow = getFocusedWindow();
    if (focusedWindow) {
      announceToScreenReader(`${focusedWindow.title} window focused`);
    }
  }, [windows, getFocusedWindow, announceToScreenReader]);

  return (
    <>
      {children}
      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="accessibility-announcer"
      />
    </>
  );
};
