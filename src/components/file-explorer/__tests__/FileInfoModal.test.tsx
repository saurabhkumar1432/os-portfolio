import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileInfoModal } from '../FileInfoModal';
import type { VNode } from '../../../types';

describe('FileInfoModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const testFile: VNode = {
    name: 'test.txt',
    type: 'file',
    path: '/Documents/test.txt',
    ext: 'txt',
    size: 1024,
    modified: new Date('2024-01-01T10:30:00'),
    content: 'This is test content for the file.'
  };

  const testFolder: VNode = {
    name: 'TestFolder',
    type: 'folder',
    path: '/Documents/TestFolder',
    modified: new Date('2024-01-01T10:30:00'),
    children: [
      { name: 'file1.txt', type: 'file', path: '/Documents/TestFolder/file1.txt' },
      { name: 'file2.txt', type: 'file', path: '/Documents/TestFolder/file2.txt' }
    ]
  };

  it('should render file information correctly', () => {
    render(<FileInfoModal file={testFile} onClose={mockOnClose} />);

    expect(screen.getByText('Properties')).toBeInTheDocument();
    expect(screen.getByText('test.txt')).toBeInTheDocument();
    expect(screen.getByText('TXT File')).toBeInTheDocument();
    expect(screen.getByText('/Documents/test.txt')).toBeInTheDocument();
    expect(screen.getByText('1 KB (1,024 bytes)')).toBeInTheDocument();
    expect(screen.getByText(/1\/1\/2024.*10:30/)).toBeInTheDocument();
    expect(screen.getByText('34 characters')).toBeInTheDocument();
  });

  it('should render folder information correctly', () => {
    render(<FileInfoModal file={testFolder} onClose={mockOnClose} />);

    expect(screen.getByText('Properties')).toBeInTheDocument();
    expect(screen.getByText('TestFolder')).toBeInTheDocument();
    expect(screen.getAllByText('Folder')).toHaveLength(2); // One in type description, one in type field
    expect(screen.getByText('/Documents/TestFolder')).toBeInTheDocument();
    expect(screen.getByText('2 items')).toBeInTheDocument();
  });

  it('should display special info for markdown files', () => {
    const markdownFile: VNode = {
      ...testFile,
      name: 'readme.md',
      ext: 'md'
    };

    render(<FileInfoModal file={markdownFile} onClose={mockOnClose} />);

    expect(screen.getByText('Markdown Document')).toBeInTheDocument();
    expect(screen.getByText('This file contains formatted text that can be rendered as HTML.')).toBeInTheDocument();
  });

  it('should display special info for PDF files', () => {
    const pdfFile: VNode = {
      ...testFile,
      name: 'document.pdf',
      ext: 'pdf'
    };

    render(<FileInfoModal file={pdfFile} onClose={mockOnClose} />);

    expect(screen.getByText('PDF Document')).toBeInTheDocument();
    expect(screen.getByText('Portable Document Format file. Use external viewer for full functionality.')).toBeInTheDocument();
  });

  it('should display special info for shortcut files', () => {
    const shortcutFile: VNode = {
      ...testFile,
      name: 'app.lnk',
      ext: 'lnk'
    };

    render(<FileInfoModal file={shortcutFile} onClose={mockOnClose} />);

    expect(screen.getByText('Shortcut Link')).toBeInTheDocument();
    expect(screen.getByText('This is a shortcut that opens an application or file.')).toBeInTheDocument();
  });

  it('should handle files without size information', () => {
    const fileWithoutSize: VNode = {
      name: 'test.txt',
      type: 'file',
      path: '/test.txt',
      ext: 'txt'
    };

    render(<FileInfoModal file={fileWithoutSize} onClose={mockOnClose} />);

    expect(screen.getByText('test.txt')).toBeInTheDocument();
    expect(screen.getByText('TXT File')).toBeInTheDocument();
    // Size should not be displayed if not available
    expect(screen.queryByText(/KB/)).not.toBeInTheDocument();
  });

  it('should handle files without modification date', () => {
    const fileWithoutDate: VNode = {
      name: 'test.txt',
      type: 'file',
      path: '/test.txt',
      ext: 'txt'
    };

    render(<FileInfoModal file={fileWithoutDate} onClose={mockOnClose} />);

    expect(screen.getByText('test.txt')).toBeInTheDocument();
    // Modified date should not be displayed if not available
    expect(screen.queryByText(/Modified:/)).not.toBeInTheDocument();
  });

  it('should handle folders with no children', () => {
    const emptyFolder: VNode = {
      name: 'EmptyFolder',
      type: 'folder',
      path: '/EmptyFolder',
      children: []
    };

    render(<FileInfoModal file={emptyFolder} onClose={mockOnClose} />);

    expect(screen.getByText('EmptyFolder')).toBeInTheDocument();
    expect(screen.getByText('0 items')).toBeInTheDocument();
  });

  it('should handle folders with one child', () => {
    const folderWithOneChild: VNode = {
      name: 'SingleFolder',
      type: 'folder',
      path: '/SingleFolder',
      children: [
        { name: 'file1.txt', type: 'file', path: '/SingleFolder/file1.txt' }
      ]
    };

    render(<FileInfoModal file={folderWithOneChild} onClose={mockOnClose} />);

    expect(screen.getByText('SingleFolder')).toBeInTheDocument();
    expect(screen.getByText('1 item')).toBeInTheDocument(); // Singular form
  });

  it('should close modal when close button is clicked', () => {
    render(<FileInfoModal file={testFile} onClose={mockOnClose} />);

    const closeButton = screen.getByLabelText('Close properties dialog');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close modal when Close button in footer is clicked', () => {
    render(<FileInfoModal file={testFile} onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close modal when clicking backdrop', () => {
    render(<FileInfoModal file={testFile} onClose={mockOnClose} />);

    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should not close modal when clicking inside the modal content', () => {
    render(<FileInfoModal file={testFile} onClose={mockOnClose} />);

    const modalContent = screen.getByText('Properties').closest('div');
    fireEvent.click(modalContent!);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should close modal when pressing Escape', () => {
    render(<FileInfoModal file={testFile} onClose={mockOnClose} />);

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should have proper accessibility attributes', () => {
    render(<FileInfoModal file={testFile} onClose={mockOnClose} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'file-info-title');

    const title = screen.getByText('Properties');
    expect(title).toHaveAttribute('id', 'file-info-title');
  });

  it('should handle files with unknown extensions', () => {
    const unknownFile: VNode = {
      name: 'test.xyz',
      type: 'file',
      path: '/test.xyz',
      ext: 'xyz'
    };

    render(<FileInfoModal file={unknownFile} onClose={mockOnClose} />);

    expect(screen.getByText('test.xyz')).toBeInTheDocument();
    expect(screen.getByText('XYZ File')).toBeInTheDocument();
  });

  it('should handle files without extensions', () => {
    const noExtFile: VNode = {
      name: 'README',
      type: 'file',
      path: '/README'
    };

    render(<FileInfoModal file={noExtFile} onClose={mockOnClose} />);

    expect(screen.getByText('README')).toBeInTheDocument();
    expect(screen.getByText('Unknown File')).toBeInTheDocument();
  });
});