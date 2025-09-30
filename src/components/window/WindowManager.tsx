import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useWindowStore } from '../../store/windowStore';
import { useCloseConfirmation } from '../../hooks/useCloseConfirmation';
import { useGlobalSnapOverlay } from '../../hooks/useGlobalSnapOverlay';
import { useResponsive } from '../../hooks/useResponsive';
import { appRegistry } from '../../services/appRegistry';

import { MobileWindowManager } from './MobileWindowManager';
import { ResponsiveWindow } from './ResponsiveWindow';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { SnapOverlay } from './SnapOverlay';

export const WindowManager: React.FC = () => {
  const { windows, zOrder } = useWindowStore();
  const { confirmationState, confirmClose, cancelClose } = useCloseConfirmation();
  const snapOverlayState = useGlobalSnapOverlay();
  const { isMobile } = useResponsive();

  // Render windows in z-order (all windows, not just visible ones)
  const sortedWindows = zOrder
    .map(id => windows[id])
    .filter(Boolean);

  const windowContent = sortedWindows.map((window) => {
    // Get the app configuration and component
    const appConfig = appRegistry.getApp(window.appId);
    const AppComponent = appConfig?.component;

    return (
      <ResponsiveWindow key={window.id} window={window}>
        {AppComponent ? (
          <React.Suspense fallback={
            <div className="p-4 h-full flex items-center justify-center text-gray-500 bg-inherit">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p>Loading {appConfig.name}...</p>
              </div>
            </div>
          }>
            <AppComponent 
              windowId={window.id}
              focused={window.focused}
              onTitleChange={(title) => {
                // TODO: Update window title if needed
                if (title) {
                  // Title change detected
                }
              }}
              onUnsavedStateChange={(hasUnsaved) => {
                const { updateWindowUnsavedState } = useWindowStore.getState();
                updateWindowUnsavedState(window.id, hasUnsaved);
              }}
            />
          </React.Suspense>
        ) : (
          <div className="p-4 h-full flex items-center justify-center text-gray-500 bg-inherit">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2 capitalize">{window.appId.replace('-', ' ')}</h2>
              <p className="text-sm">Application not found</p>
              <div className="mt-4 text-xs opacity-60">
                <p>Window ID: {window.id}</p>
                <p>App ID: {window.appId}</p>
                <p>Z-Index: {window.zIndex}</p>
                <p>Focused: {window.focused ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        )}
      </ResponsiveWindow>
    );
  });

  return (
    <>
      {isMobile ? (
        <MobileWindowManager>
          <AnimatePresence>
            {windowContent}
          </AnimatePresence>
        </MobileWindowManager>
      ) : (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1000 }}>
          <AnimatePresence>
            {windowContent.map((content, index) => (
              <div key={sortedWindows[index]?.id} className="pointer-events-auto">
                {content}
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Global Snap Overlay - Desktop only */}
      {!isMobile && (
        <SnapOverlay
          visible={snapOverlayState.visible}
          snapZones={snapOverlayState.snapZones}
          activeZone={snapOverlayState.activeZone}
        />
      )}

      {/* Close Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmationState.isOpen}
        title="Unsaved Changes"
        message={`The window "${confirmationState.windowTitle}" has unsaved changes. Are you sure you want to close it? Your changes will be lost.`}
        confirmText="Close Anyway"
        cancelText="Cancel"
        onConfirm={confirmClose}
        onCancel={cancelClose}
        variant="danger"
      />
    </>
  );
};