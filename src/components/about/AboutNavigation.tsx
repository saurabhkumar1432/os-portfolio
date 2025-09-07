import React from 'react';
import type { AboutAppState } from '../../types';

interface AboutNavigationProps {
  activeSection: AboutAppState['activeSection'];
  onSectionChange: (section: AboutAppState['activeSection']) => void;
}

const sections = [
  { id: 'overview' as const, label: 'Overview', icon: '👋' },
  { id: 'experience' as const, label: 'Experience', icon: '💼' },
  { id: 'skills' as const, label: 'Skills', icon: '🛠️' },
  { id: 'timeline' as const, label: 'Timeline', icon: '📅' },
  { id: 'contact' as const, label: 'Contact', icon: '📧' },
];

/**
 * Navigation component for About app sections
 */
const AboutNavigation: React.FC<AboutNavigationProps> = ({
  activeSection,
  onSectionChange,
}) => {
  return (
    <nav className="flex flex-col space-y-1 p-4 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => onSectionChange(section.id)}
          className={`
            flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${activeSection === section.id
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }
          `}
          aria-current={activeSection === section.id ? 'page' : undefined}
        >
          <span className="text-lg" role="img" aria-hidden="true">
            {section.icon}
          </span>
          <span>{section.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default AboutNavigation;