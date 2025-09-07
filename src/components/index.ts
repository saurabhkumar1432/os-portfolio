// Desktop components
export * from './desktop';

// Window components
export * from './window';

// UI components
export * from './ui';

// App loading
export { AppLoader } from './AppLoader';

// PWA components
export { PWAInstallButton } from './ui/PWAInstallButton';
export { PWAUpdateNotification } from './ui/PWAUpdateNotification';
export { OfflineIndicator } from './ui/OfflineIndicator';

// Accessibility components
export { AccessibilityAnnouncer } from './AccessibilityAnnouncer';
export { AccessibilityProvider, useAccessibility } from './AccessibilityProvider';
export { AccessibilityToolbar } from './AccessibilityToolbar';
export { SkipLink } from './SkipLink';

// Framework components
export { ThemeProvider, useTheme } from './ThemeProvider';
export { KeyboardShortcutProvider, useKeyboardShortcutContext, useComponentKeyboardShortcuts } from './KeyboardShortcutProvider';

// Main OS component
export { DesktopOS } from './DesktopOS';
