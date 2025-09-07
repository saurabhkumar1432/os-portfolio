import React from 'react';
import { motion } from 'framer-motion';
import { useReduceMotion } from '../../hooks/useReduceMotion';

interface AnimatedTransitionProps {
  children: React.ReactNode;
  type?: 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideDown';
  duration?: number;
  delay?: number;
  className?: string;
}

export const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({
  children,
  type = 'fade',
  duration = 0.2,
  delay = 0,
  className = '',
}) => {
  const reduceMotion = useReduceMotion();

  // If motion is reduced, render without animation
  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
    slideDown: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
    },
  };

  const transition = {
    duration,
    delay,
    ease: 'easeInOut' as const, // Use predefined easing
  };

  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants[type]}
      transition={transition}
    >
      {children}
    </motion.div>
  );
};

interface AnimatedListProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({
  children,
  staggerDelay = 0.1,
  className = '',
}) => {
  const reduceMotion = useReduceMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};
