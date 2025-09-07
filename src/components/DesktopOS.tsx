import React, { useEffect } from 'react';
import { Desktop, Taskbar } from './desktop';
import { WindowManager } from './window';
import { KeyboardShortcutProvider } from './KeyboardShortcutProvider';
import { AccessibilityProvider } from './AccessibilityProvider';
import { AccessibilityAnnouncer } from './AccessibilityAnnouncer';
import { AccessibilityToolbar } from './AccessibilityToolbar';
import { SkipLink } from './SkipLink';
import { ThemeProvider } from './ThemeProvider';
import { AnimatedTransition } from './ui/AnimatedTransition';
import { useReduceMotion } from '../hooks/useReduceMotion';
import { useAccessibilitySettings } from '../hooks/useAccessibilitySettings';
import { performanceOptimizer } from '../utils/performanceOptimizations';
import { windowLifecycleManager } from '../services/windowLifecycleManager';

export const DesktopOS: React.FC = () => {
  // Apply reduce motion preference
  useReduceMotion();
  
  // Apply accessibility settings
  useAccessibilitySettings();

  useEffect(() => {
    // Initialize performance monitoring
    performanceOptimizer.monitorComponent('DesktopOS');
    performanceOptimizer.monitorComponent('WindowManager');
    performanceOptimizer.monitorComponent('Desktop');
    
    // Cleanup on unmount
    return () => {
      performanceOptimizer.cleanup();
      windowLifecycleManager.cleanup();
    };
  }, []);

  return (
    <ThemeProvider>
      <AccessibilityProvider>
        <KeyboardShortcutProvider>
          <div className="fixed inset-0 overflow-hidden">
            {/* Skip Links for Accessibility */}
            <SkipLink href="#main-content">
              Skip to main content
            </SkipLink>
            <SkipLink href="#taskbar">
              Skip to taskbar
            </SkipLink>

            {/* Accessibility Features */}
            <AccessibilityAnnouncer />
            <AccessibilityToolbar />

            {/* Main Desktop Area */}
            <AnimatedTransition type="fade" duration={0.5}>
              <main id="main-content" className="h-full w-full relative">
                {/* Desktop Layer */}
                <Desktop />
                
                {/* Window Manager Layer */}
                <WindowManager />
              </main>
            </AnimatedTransition>
            
            {/* Navigation/Controls */}
            <nav id="taskbar" aria-label="System taskbar">
              <Taskbar />
            </nav>
          </div>
        </KeyboardShortcutProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  );
};