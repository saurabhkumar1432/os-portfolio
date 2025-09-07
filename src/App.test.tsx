import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the desktop OS interface', () => {
    render(<App />);
    // Check for desktop elements that should be present
    expect(document.body).toHaveAttribute('role', 'application');
    expect(document.body).toHaveAttribute('aria-label', 'Portfolio OS Desktop');
  });

  it('renders desktop icons', () => {
    render(<App />);
    // Check for desktop icons
    expect(screen.getByLabelText('Projects desktop icon')).toBeInTheDocument();
    expect(screen.getByLabelText('File Explorer desktop icon')).toBeInTheDocument();
    expect(screen.getByLabelText('Terminal desktop icon')).toBeInTheDocument();
  });

  it('renders the taskbar', () => {
    render(<App />);
    // Check for taskbar elements
    expect(screen.getByLabelText('Start Menu')).toBeInTheDocument();
  });
});
