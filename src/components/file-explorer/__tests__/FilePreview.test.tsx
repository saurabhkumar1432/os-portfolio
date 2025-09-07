import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilePreview } from '../FilePreview';
import type { VNode } from '../../../types';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
});

describe('FilePreview', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render empty state when no file is provided', () => {
    render(<FilePreview file={null} onClose={mockOnClose} />);
    
    expect(screen.getByText('No file selected')).toBeInTheDocument();
    expect(screen.getByText('Select a file to preview its contents')).toBeInTheDocument();
  });

  it('should render markdown file preview', () => {
    const markdownFile: VNode = {
      name: 'test.md',
      type: 'file',
      path: '/test.md',
      ext: 'md',
      size: 1000,
      modified: new Date('2024-01-01'),
      content: '# Test Markdown\n\nThis is a test.'
    };

    render(<FilePreview file={markdownFile} onClose={mockOnClose} />);
    
    expect(screen.getByText('test.md')).toBeInTheDocument();
    expect(screen.getByText('1.0 KB')).toBeInTheDocument();
    // Check that the content is rendered
    expect(screen.getByText(/Test Markdown/)).toBeInTheDocument();
  });

  it('should render text file preview', () => {
    const textFile: VNode = {
      name: 'test.txt',
      type: 'file',
      path: '/test.txt',
      ext: 'txt',
      size: 500,
      modified: new Date('2024-01-01'),
      content: 'This is plain text content.'
    };

    render(<FilePreview file={textFile} onClose={mockOnClose} />);
    
    expect(screen.getByText('test.txt')).toBeInTheDocument();
    expect(screen.getByText('This is plain text content.')).toBeInTheDocument();
  });

  it('should render PDF file preview with download option', () => {
    const pdfFile: VNode = {
      name: 'test.pdf',
      type: 'file',
      path: '/test.pdf',
      ext: 'pdf',
      size: 2048000,
      modified: new Date('2024-01-01'),
      content: 'PDF content placeholder'
    };

    render(<FilePreview file={pdfFile} onClose={mockOnClose} />);
    
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
    expect(screen.getByText('PDF Preview')).toBeInTheDocument();
    expect(screen.getByText('Download PDF')).toBeInTheDocument();
  });

  it('should render image file preview placeholder', () => {
    const imageFile: VNode = {
      name: 'test.jpg',
      type: 'file',
      path: '/test.jpg',
      ext: 'jpg',
      size: 1024000,
      modified: new Date('2024-01-01')
    };

    render(<FilePreview file={imageFile} onClose={mockOnClose} />);
    
    expect(screen.getByText('test.jpg')).toBeInTheDocument();
    expect(screen.getByText('No preview available')).toBeInTheDocument();
  });

  it('should handle copy content action', async () => {
    const textFile: VNode = {
      name: 'test.txt',
      type: 'file',
      path: '/test.txt',
      ext: 'txt',
      content: 'Content to copy'
    };

    render(<FilePreview file={textFile} onClose={mockOnClose} />);
    
    const copyButton = screen.getByLabelText('Copy file content to clipboard');
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Content to copy');
  });


});