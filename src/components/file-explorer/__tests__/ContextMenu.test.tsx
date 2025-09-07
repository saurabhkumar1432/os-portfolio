import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContextMenu } from '../ContextMenu';
import type { VNode } from '../../../types';

describe('ContextMenu', () => {
  const mockOnClose = vi.fn();
  const mockOnPreview = vi.fn();
  const mockOnOpen = vi.fn();
  const mockOnCopy = vi.fn();
  const mockOnDownload = vi.fn();
  const mockOnShowInfo = vi.fn();

  const testFile: VNode = {
    name: 'test.txt',
    type: 'file',
    path: '/test.txt',
    ext: 'txt',
    content: 'Test content'
  };

  const testFolder: VNode = {
    name: 'TestFolder',
    type: 'folder',
    path: '/TestFolder',
    children: []
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render context menu with correct items for file', () => {
    render(
      <ContextMenu
        file={testFile}
        x={100}
        y={100}
        onClose={mockOnClose}
        onPreview={mockOnPreview}
        onOpen={mockOnOpen}
        onCopy={mockOnCopy}
        onDownload={mockOnDownload}
        onShowInfo={mockOnShowInfo}
      />
    );

    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('Copy Path')).toBeInTheDocument();
    expect(screen.getByText('Download')).toBeInTheDocument();
    expect(screen.getByText('Properties')).toBeInTheDocument();
  });

  it('should render context menu with correct items for folder', () => {
    render(
      <ContextMenu
        file={testFolder}
        x={100}
        y={100}
        onClose={mockOnClose}
        onPreview={mockOnPreview}
        onOpen={mockOnOpen}
        onCopy={mockOnCopy}
        onDownload={mockOnDownload}
        onShowInfo={mockOnShowInfo}
      />
    );

    expect(screen.getByText('Open Folder')).toBeInTheDocument();
    expect(screen.getByText('Copy Path')).toBeInTheDocument();
    expect(screen.getByText('Properties')).toBeInTheDocument();
  });

  it('should disable preview and download for folders', () => {
    render(
      <ContextMenu
        file={testFolder}
        x={100}
        y={100}
        onClose={mockOnClose}
        onPreview={mockOnPreview}
        onOpen={mockOnOpen}
        onCopy={mockOnCopy}
        onDownload={mockOnDownload}
        onShowInfo={mockOnShowInfo}
      />
    );

    const previewButton = screen.getByText('Preview').closest('button');
    const downloadButton = screen.getByText('Download').closest('button');

    expect(previewButton).toBeDisabled();
    expect(downloadButton).toBeDisabled();
  });

  it('should disable preview and download for files without content', () => {
    const fileWithoutContent: VNode = {
      name: 'empty.txt',
      type: 'file',
      path: '/empty.txt',
      ext: 'txt'
    };

    render(
      <ContextMenu
        file={fileWithoutContent}
        x={100}
        y={100}
        onClose={mockOnClose}
        onPreview={mockOnPreview}
        onOpen={mockOnOpen}
        onCopy={mockOnCopy}
        onDownload={mockOnDownload}
        onShowInfo={mockOnShowInfo}
      />
    );

    const previewButton = screen.getByText('Preview').closest('button');
    const downloadButton = screen.getByText('Download').closest('button');

    expect(previewButton).toBeDisabled();
    expect(downloadButton).toBeDisabled();
  });

  it('should call onOpen when Open is clicked', () => {
    render(
      <ContextMenu
        file={testFile}
        x={100}
        y={100}
        onClose={mockOnClose}
        onPreview={mockOnPreview}
        onOpen={mockOnOpen}
        onCopy={mockOnCopy}
        onDownload={mockOnDownload}
        onShowInfo={mockOnShowInfo}
      />
    );

    fireEvent.click(screen.getByText('Open'));

    expect(mockOnOpen).toHaveBeenCalledWith(testFile);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onPreview when Preview is clicked', () => {
    render(
      <ContextMenu
        file={testFile}
        x={100}
        y={100}
        onClose={mockOnClose}
        onPreview={mockOnPreview}
        onOpen={mockOnOpen}
        onCopy={mockOnCopy}
        onDownload={mockOnDownload}
        onShowInfo={mockOnShowInfo}
      />
    );

    fireEvent.click(screen.getByText('Preview'));

    expect(mockOnPreview).toHaveBeenCalledWith(testFile);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onCopy when Copy Path is clicked', () => {
    render(
      <ContextMenu
        file={testFile}
        x={100}
        y={100}
        onClose={mockOnClose}
        onPreview={mockOnPreview}
        onOpen={mockOnOpen}
        onCopy={mockOnCopy}
        onDownload={mockOnDownload}
        onShowInfo={mockOnShowInfo}
      />
    );

    fireEvent.click(screen.getByText('Copy Path'));

    expect(mockOnCopy).toHaveBeenCalledWith(testFile);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onDownload when Download is clicked', () => {
    render(
      <ContextMenu
        file={testFile}
        x={100}
        y={100}
        onClose={mockOnClose}
        onPreview={mockOnPreview}
        onOpen={mockOnOpen}
        onCopy={mockOnCopy}
        onDownload={mockOnDownload}
        onShowInfo={mockOnShowInfo}
      />
    );

    fireEvent.click(screen.getByText('Download'));

    expect(mockOnDownload).toHaveBeenCalledWith(testFile);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onShowInfo when Properties is clicked', () => {
    render(
      <ContextMenu
        file={testFile}
        x={100}
        y={100}
        onClose={mockOnClose}
        onPreview={mockOnPreview}
        onOpen={mockOnOpen}
        onCopy={mockOnCopy}
        onDownload={mockOnDownload}
        onShowInfo={mockOnShowInfo}
      />
    );

    fireEvent.click(screen.getByText('Properties'));

    expect(mockOnShowInfo).toHaveBeenCalledWith(testFile);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close when clicking outside', () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <ContextMenu
          file={testFile}
          x={100}
          y={100}
          onClose={mockOnClose}
          onPreview={mockOnPreview}
          onOpen={mockOnOpen}
          onCopy={mockOnCopy}
          onDownload={mockOnDownload}
          onShowInfo={mockOnShowInfo}
        />
      </div>
    );

    fireEvent.mouseDown(screen.getByTestId('outside'));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close when pressing Escape', () => {
    render(
      <ContextMenu
        file={testFile}
        x={100}
        y={100}
        onClose={mockOnClose}
        onPreview={mockOnPreview}
        onOpen={mockOnOpen}
        onCopy={mockOnCopy}
        onDownload={mockOnDownload}
        onShowInfo={mockOnShowInfo}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should position menu correctly within viewport', () => {
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });

    const { container } = render(
      <ContextMenu
        file={testFile}
        x={900} // Near right edge
        y={700} // Near bottom edge
        onClose={mockOnClose}
        onPreview={mockOnPreview}
        onOpen={mockOnOpen}
        onCopy={mockOnCopy}
        onDownload={mockOnDownload}
        onShowInfo={mockOnShowInfo}
      />
    );

    const menu = container.querySelector('[role="menu"]') as HTMLElement;
    expect(menu).toBeInTheDocument();
    
    // Menu should be repositioned to stay within viewport
    const style = menu.style;
    expect(parseInt(style.left)).toBeLessThan(900); // Should be moved left
    expect(parseInt(style.top)).toBeLessThan(700);  // Should be moved up
  });

  it('should have proper accessibility attributes', () => {
    render(
      <ContextMenu
        file={testFile}
        x={100}
        y={100}
        onClose={mockOnClose}
        onPreview={mockOnPreview}
        onOpen={mockOnOpen}
        onCopy={mockOnCopy}
        onDownload={mockOnDownload}
        onShowInfo={mockOnShowInfo}
      />
    );

    const menu = screen.getByRole('menu');
    expect(menu).toHaveAttribute('aria-label', 'Context menu for test.txt');

    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems.length).toBeGreaterThan(0);

    menuItems.forEach(item => {
      expect(item).toHaveAttribute('aria-label');
    });
  });
});