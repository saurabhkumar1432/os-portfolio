import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePreferencesStore } from '../../store/preferencesStore';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'default' | 'danger';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
}) => {
  const { theme, reduceMotion } = usePreferencesStore();
  const isDark = theme === 'dark' || (theme === 'auto' && globalThis.window?.matchMedia('(prefers-color-scheme: dark)').matches);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter') {
      onConfirm();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          initial={reduceMotion ? undefined : { opacity: 0 }}
          animate={reduceMotion ? undefined : { opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Dialog */}
          <motion.div
            className={`relative w-full max-w-md mx-4 rounded-lg shadow-2xl border ${
              isDark 
                ? 'bg-gray-800 border-gray-600' 
                : 'bg-white border-gray-300'
            }`}
            initial={reduceMotion ? undefined : { scale: 0.9, opacity: 0 }}
            animate={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
            exit={reduceMotion ? undefined : { scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className={`px-6 py-4 border-b ${
              isDark ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {title}
              </h3>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              <p className={`text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {message}
              </p>
            </div>

            {/* Actions */}
            <div className={`px-6 py-4 flex justify-end gap-3 border-t ${
              isDark ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <motion.button
                className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                  isDark
                    ? 'text-gray-300 hover:bg-gray-700 border border-gray-600'
                    : 'text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
                onClick={onCancel}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {cancelText}
              </motion.button>
              <motion.button
                className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                  variant === 'danger'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : isDark
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
                onClick={onConfirm}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                autoFocus
              >
                {confirmText}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};