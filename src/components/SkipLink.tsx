import React from 'react';
import { cn } from '../utils';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const SkipLink: React.FC<SkipLinkProps> = ({ href, children, className }) => {
  return (
    <a
      href={href}
      className={cn(
        "absolute -top-10 left-4 z-[9999] bg-blue-600 text-white px-4 py-2 rounded-md",
        "focus:top-4 transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-blue-300",
        className
      )}
      data-testid="skip-link"
    >
      {children}
    </a>
  );
};
