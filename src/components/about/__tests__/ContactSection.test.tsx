import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import ContactSection from '../ContactSection';
import type { ContactInfo } from '../../../types';

// Mock window.open
const mockWindowOpen = vi.fn();
Object.assign(window, {
  open: mockWindowOpen,
});

// Clipboard mock variable
let mockWriteText: ReturnType<typeof vi.fn>;

// Use the clipboard mock from our setup file
beforeEach(() => {
  // Reset clipboard mock for each test
  mockWriteText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: mockWriteText,
      readText: vi.fn().mockResolvedValue(''),
    },
    writable: true,
    configurable: true,
  });
});

// Mock document.execCommand for fallback
const mockExecCommand = vi.fn();
Object.assign(document, {
  execCommand: mockExecCommand,
});

describe('ContactSection', () => {
  const mockContact: ContactInfo = {
    email: 'john.doe@example.com',
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    website: 'https://johndoe.dev',
    location: 'San Francisco, CA',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteText.mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
  });

  it('should render contact section with title', () => {
    render(<ContactSection contact={mockContact} />);

    expect(screen.getByText('Get In Touch')).toBeInTheDocument();
  });

  it('should display all contact information', () => {
    render(<ContactSection contact={mockContact} />);

    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('/in/johndoe')).toBeInTheDocument();
    expect(screen.getByText('@johndoe')).toBeInTheDocument();
    expect(screen.getByText('johndoe.dev')).toBeInTheDocument();
    expect(screen.getByText('📍 San Francisco, CA')).toBeInTheDocument();
  });

  it('should copy email to clipboard when copy button is clicked', async () => {
    render(<ContactSection contact={mockContact} />);

    const copyButton = screen.getAllByText('Copy')[0]; // First copy button (email)
    fireEvent.click(copyButton);

    expect(mockWriteText).toHaveBeenCalledWith('john.doe@example.com');
    
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('should copy LinkedIn URL to clipboard', async () => {
    render(<ContactSection contact={mockContact} />);

    const linkedinCopyButton = screen.getByTitle('Copy LinkedIn URL');
    fireEvent.click(linkedinCopyButton);

    expect(mockWriteText).toHaveBeenCalledWith('https://linkedin.com/in/johndoe');
    
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('should copy GitHub URL to clipboard', async () => {
    render(<ContactSection contact={mockContact} />);

    const githubCopyButton = screen.getByTitle('Copy GitHub URL');
    fireEvent.click(githubCopyButton);

    expect(mockWriteText).toHaveBeenCalledWith('https://github.com/johndoe');
    
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('should copy website URL to clipboard', async () => {
    render(<ContactSection contact={mockContact} />);

    const websiteCopyButton = screen.getByTitle('Copy website URL');
    fireEvent.click(websiteCopyButton);

    expect(mockWriteText).toHaveBeenCalledWith('https://johndoe.dev');
    
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('should open email client when send email button is clicked', () => {
    // Mock window.location.href setter
    delete (window as any).location;
    (window as any).location = { href: '' };

    render(<ContactSection contact={mockContact} />);

    const sendEmailButton = screen.getByText('Send Email');
    fireEvent.click(sendEmailButton);

    expect(window.location.href).toBe('mailto:john.doe@example.com');
  });

  it('should open LinkedIn profile in new tab', () => {
    render(<ContactSection contact={mockContact} />);

    const viewProfileButton = screen.getByText('View Profile');
    fireEvent.click(viewProfileButton);

    expect(mockWindowOpen).toHaveBeenCalledWith(
      'https://linkedin.com/in/johndoe',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('should open GitHub repositories in new tab', () => {
    render(<ContactSection contact={mockContact} />);

    const viewReposButton = screen.getByText('View Repositories');
    fireEvent.click(viewReposButton);

    expect(mockWindowOpen).toHaveBeenCalledWith(
      'https://github.com/johndoe',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('should open website in new tab', () => {
    render(<ContactSection contact={mockContact} />);

    const visitWebsiteButton = screen.getByText('Visit Website');
    fireEvent.click(visitWebsiteButton);

    expect(mockWindowOpen).toHaveBeenCalledWith(
      'https://johndoe.dev',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('should generate and download vCard', () => {
    // Mock URL.createObjectURL and revokeObjectURL
    const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    const mockRevokeObjectURL = vi.fn();
    Object.assign(URL, {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    });

    // Mock anchor element creation for download
    const mockAnchor = document.createElement('a');
    mockAnchor.click = vi.fn();
    
    // Spy on document.createElement only when creating 'a' elements
    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        return mockAnchor;
      }
      return originalCreateElement(tagName);
    });
    
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');

    render(<ContactSection contact={mockContact} />);

    const downloadVCardButton = screen.getByText('Download vCard');
    fireEvent.click(downloadVCardButton);

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(mockAnchor.download).toBe('john-doe.vcf');
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalledWith(mockAnchor);
    expect(removeChildSpy).toHaveBeenCalledWith(mockAnchor);
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');

    // Cleanup
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it('should open email client with subject when CTA button is clicked', () => {
    // Mock window.location.href setter
    delete (window as any).location;
    (window as any).location = { href: '' };

    render(<ContactSection contact={mockContact} />);

    const ctaButton = screen.getByText('Start a Conversation');
    fireEvent.click(ctaButton);

    expect(window.location.href).toBe('mailto:john.doe@example.com?subject=Let\'s work together');
  });

  it('should handle clipboard API failure with fallback', async () => {
    // Mock clipboard API to fail
    mockWriteText.mockRejectedValue(new Error('Clipboard API not available'));

    render(<ContactSection contact={mockContact} />);

    const copyButton = screen.getAllByText('Copy')[0];
    fireEvent.click(copyButton);

    // Should fall back to document.execCommand
    await waitFor(() => {
      expect(mockExecCommand).toHaveBeenCalledWith('copy');
    });
  });

  it('should reset copied state after timeout', async () => {
    vi.useFakeTimers();
    
    render(<ContactSection contact={mockContact} />);

    const copyButton = screen.getAllByText('Copy')[0];
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });

    // Fast-forward time by 2 seconds
    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
      expect(screen.getByText('Copy')).toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  it('should not render website section when website is not provided', () => {
    const contactWithoutWebsite = { ...mockContact, website: undefined };
    render(<ContactSection contact={contactWithoutWebsite} />);

    expect(screen.queryByText('Website')).not.toBeInTheDocument();
    expect(screen.queryByText('johndoe.dev')).not.toBeInTheDocument();
  });

  it('should display correct icons for each contact method', () => {
    render(<ContactSection contact={mockContact} />);

    // Check that contact cards have appropriate icons (by checking for SVG elements)
    const emailCard = screen.getByText('Email').closest('div');
    const linkedinCard = screen.getByText('LinkedIn').closest('div');
    const githubCard = screen.getByText('GitHub').closest('div');
    const websiteCard = screen.getByText('Website').closest('div');
    const locationCard = screen.getByText('Location').closest('div');

    expect(emailCard?.querySelector('svg')).toBeInTheDocument();
    expect(linkedinCard?.querySelector('svg')).toBeInTheDocument();
    expect(githubCard?.querySelector('svg')).toBeInTheDocument();
    expect(websiteCard?.querySelector('svg')).toBeInTheDocument();
    expect(locationCard?.querySelector('svg')).toBeInTheDocument();
  });

  it('should show different copy button states for different fields', async () => {
    render(<ContactSection contact={mockContact} />);

    // Click email copy button
    const emailCopyButton = screen.getAllByText('Copy')[0];
    fireEvent.click(emailCopyButton);

    await waitFor(() => {
      // Only the email copy button should show "Copied!"
      const copiedButtons = screen.getAllByText('Copied!');
      expect(copiedButtons).toHaveLength(1);
    });

    // Other copy buttons should still show "Copy"
    expect(screen.getAllByText('Copy').length).toBeGreaterThan(0);
  });
});