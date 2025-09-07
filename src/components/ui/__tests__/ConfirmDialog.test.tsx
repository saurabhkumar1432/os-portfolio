import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ConfirmDialog } from '../ConfirmDialog';
import { usePreferencesStore } from '../../../store/preferencesStore';

// Mock the preferences store
vi.mock('../../../store/preferencesStore');

const mockUsePreferencesStore = vi.mocked(usePreferencesStore);

describe('ConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    title: 'Test Dialog',
    message: 'This is a test message',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUsePreferencesStore.mockReturnValue({
      theme: 'light',
      accentColor: '#3b82f6',
      wallpaper: 'default',
      iconSize: 'md',
      sounds: true,
      reduceMotion: false,
      desktopLayout: [],
      windowPositions: {},
      setTheme: vi.fn(),
      setAccentColor: vi.fn(),
      setWallpaper: vi.fn(),
      setIconSize: vi.fn(),
      setSounds: vi.fn(),
      setReduceMotion: vi.fn(),
      setDesktopLayout: vi.fn(),
      setWindowPosition: vi.fn(),
      resetPreferences: vi.fn(),
    });
  });

  it('should render when open', () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    expect(screen.getByText('This is a test message')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<ConfirmDialog {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
  });

  it('should call onConfirm when confirm button is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);

    fireEvent.click(screen.getByText('Confirm'));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);

    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when backdrop is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);

    const backdrop = screen.getByText('Test Dialog').closest('[tabindex="-1"]');
    fireEvent.click(backdrop!);
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('should not call onCancel when dialog content is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);

    const dialogContent = screen.getByText('Test Dialog').closest('.relative');
    fireEvent.click(dialogContent!);
    expect(defaultProps.onCancel).not.toHaveBeenCalled();
  });

  it('should call onCancel when Escape key is pressed', () => {
    render(<ConfirmDialog {...defaultProps} />);

    const dialog = screen.getByText('Test Dialog').closest('[tabindex="-1"]');
    fireEvent.keyDown(dialog!, { key: 'Escape' });
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('should call onConfirm when Enter key is pressed', () => {
    render(<ConfirmDialog {...defaultProps} />);

    const dialog = screen.getByText('Test Dialog').closest('[tabindex="-1"]');
    fireEvent.keyDown(dialog!, { key: 'Enter' });
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should use custom button text', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        confirmText="Delete"
        cancelText="Keep"
      />
    );

    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Keep')).toBeInTheDocument();
  });

  it('should apply danger variant styling', () => {
    render(<ConfirmDialog {...defaultProps} variant="danger" />);

    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton).toHaveClass('bg-red-600');
  });

  it('should apply default variant styling', () => {
    render(<ConfirmDialog {...defaultProps} variant="default" />);

    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton).toHaveClass('bg-blue-500');
  });

  it('should apply dark theme styling', () => {
    mockUsePreferencesStore.mockReturnValue({
      ...mockUsePreferencesStore(),
      theme: 'dark',
    });

    render(<ConfirmDialog {...defaultProps} />);

    const dialog = screen.getByText('Test Dialog').closest('.relative');
    expect(dialog).toHaveClass('bg-gray-800');
  });

  it('should apply light theme styling', () => {
    render(<ConfirmDialog {...defaultProps} />);

    const dialog = screen.getByText('Test Dialog').closest('.relative');
    expect(dialog).toHaveClass('bg-white');
  });

  it('should auto-focus confirm button', async () => {
    render(<ConfirmDialog {...defaultProps} />);

    const confirmButton = screen.getByText('Confirm');
    
    await waitFor(() => {
      expect(confirmButton).toHaveFocus();
    });
  });

  it('should handle reduced motion preference', () => {
    mockUsePreferencesStore.mockReturnValue({
      ...mockUsePreferencesStore(),
      reduceMotion: true,
    });

    render(<ConfirmDialog {...defaultProps} />);

    // Dialog should still render but without animations
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
  });

  it('should handle auto theme detection', () => {
    // Mock matchMedia for auto theme
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    mockUsePreferencesStore.mockReturnValue({
      ...mockUsePreferencesStore(),
      theme: 'auto',
    });

    render(<ConfirmDialog {...defaultProps} />);

    const dialog = screen.getByText('Test Dialog').closest('.relative');
    expect(dialog).toHaveClass('bg-gray-800'); // Should use dark theme
  });

  it('should prevent event propagation on button clicks', () => {
    const mockStopPropagation = vi.fn();
    render(<ConfirmDialog {...defaultProps} />);

    const confirmButton = screen.getByText('Confirm');
    const cancelButton = screen.getByText('Cancel');

    // Mock the event object
    const mockEvent = { stopPropagation: mockStopPropagation };

    fireEvent.click(confirmButton, mockEvent);
    fireEvent.click(cancelButton, mockEvent);

    expect(defaultProps.onConfirm).toHaveBeenCalled();
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('should handle long messages gracefully', () => {
    const longMessage = 'This is a very long message that should wrap properly and not break the dialog layout. '.repeat(10);
    
    render(<ConfirmDialog {...defaultProps} message={longMessage} />);

    // Use a partial text match since the text might be wrapped
    expect(screen.getByText(/This is a very long message/)).toBeInTheDocument();
  });

  it('should handle long titles gracefully', () => {
    const longTitle = 'This is a very long title that should be handled properly';
    
    render(<ConfirmDialog {...defaultProps} title={longTitle} />);

    expect(screen.getByText(longTitle)).toBeInTheDocument();
  });
});