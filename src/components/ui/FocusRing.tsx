import React, { forwardRef } from 'react';
import { cn } from '../../utils';

interface FocusRingProps {
  children: React.ReactNode;
  className?: string;
  focusClassName?: string;
  disabled?: boolean;
  visible?: boolean;
  offset?: number;
}

/**
 * A wrapper component that provides a consistent focus ring for interactive elements
 */
export const FocusRing = forwardRef<HTMLDivElement, FocusRingProps>(({
  children,
  className,
  focusClassName,
  disabled = false,
  visible = true,
  offset = 2,
  ...props
}, ref) => {
  const defaultFocusStyles = [
    'focus-within:ring-2',
    'focus-within:ring-blue-500',
    'focus-within:ring-offset-2',
    'focus-within:ring-offset-white',
    'focus-within:outline-none',
  ];

  const focusStyles = focusClassName 
    ? focusClassName.split(' ')
    : defaultFocusStyles;

  return (
    <div
      ref={ref}
      className={cn(
        'relative',
        visible && !disabled && (Array.isArray(focusStyles) ? focusStyles.join(' ') : focusStyles),
        className
      )}
      style={{
        '--ring-offset-width': `${offset}px`,
      } as React.CSSProperties}
      {...props}
    >
      {children}
    </div>
  );
});

FocusRing.displayName = 'FocusRing';