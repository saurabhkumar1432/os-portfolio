import React, { useState, useEffect } from 'react';
import type { AppProps, AboutData, AboutAppState } from '../types';
import { aboutService } from '../services';
import {
  AboutNavigation,
  OverviewSection,
  ExperienceSection,
  SkillsSection,
  TimelineSection,
  ContactSection,
} from '../components/about';

/**
 * About application component
 * Displays personal and professional information with interactive sections
 */
const AboutApp: React.FC<AppProps> = ({ windowId: _windowId, focused: _focused, onTitleChange }) => {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // App state
  const [appState, setAppState] = useState<AboutAppState>({
    activeSection: 'overview',
    expandedMilestone: null,
    skillFilter: null,
    filteredProjects: [],
  });

  // Load about data
  useEffect(() => {
    const loadAboutData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await aboutService.getAboutData();
        setAboutData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load about data');
      } finally {
        setLoading(false);
      }
    };

    loadAboutData();
  }, []);

  // Update window title based on active section
  useEffect(() => {
    const sectionTitles = {
      overview: 'About - Overview',
      experience: 'About - Experience',
      skills: 'About - Skills',
      timeline: 'About - Timeline',
      contact: 'About - Contact',
    };
    
    onTitleChange(sectionTitles[appState.activeSection]);
  }, [onTitleChange, appState.activeSection]);

  // Handle section navigation
  const handleSectionChange = (section: AboutAppState['activeSection']) => {
    setAppState(prev => ({ 
      ...prev, 
      activeSection: section,
      // Reset section-specific state when changing sections
      expandedMilestone: section === 'timeline' ? prev.expandedMilestone : null,
      skillFilter: section === 'skills' ? prev.skillFilter : null,
    }));
  };

  // Handle timeline milestone toggle
  const handleMilestoneToggle = (milestoneId: string | null) => {
    setAppState(prev => ({ ...prev, expandedMilestone: milestoneId }));
  };

  // Handle skill filtering (for project integration)
  const handleSkillFilter = (skill: string | null) => {
    setAppState(prev => ({ ...prev, skillFilter: skill }));
    
    if (skill && aboutData) {
      // Find projects related to this skill
      const relatedSkill = aboutData.skills.find(s => s.name === skill);
      if (relatedSkill && relatedSkill.relatedProjects) {
        setAppState(prev => ({ ...prev, filteredProjects: relatedSkill.relatedProjects || [] }));
        
        // TODO: In a real implementation, this could open the Projects app with filters
        console.log(`Filtering projects by skill: ${skill}`, relatedSkill.relatedProjects);
      }
    } else {
      setAppState(prev => ({ ...prev, filteredProjects: [] }));
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Error Loading About Data
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading || !aboutData) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading about information...</p>
        </div>
      </div>
    );
  }

  // Render active section content
  const renderActiveSection = () => {
    switch (appState.activeSection) {
      case 'overview':
        return <OverviewSection data={aboutData} />;
      
      case 'experience':
        return (
          <ExperienceSection
            companies={aboutData.companies}
            institutions={aboutData.institutions}
          />
        );
      
      case 'skills':
        return (
          <SkillsSection
            skills={aboutData.skills}
            onSkillFilter={handleSkillFilter}
            filteredProjects={appState.filteredProjects}
          />
        );
      
      case 'timeline':
        return (
          <TimelineSection
            timeline={aboutData.timeline}
            expandedMilestone={appState.expandedMilestone}
            onMilestoneToggle={handleMilestoneToggle}
          />
        );
      
      case 'contact':
        return <ContactSection contact={aboutData.contact} />;
      
      default:
        return <OverviewSection data={aboutData} />;
    }
  };

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* Navigation Sidebar */}
      <div className="w-48 flex-shrink-0">
        <AboutNavigation
          activeSection={appState.activeSection}
          onSectionChange={handleSectionChange}
        />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderActiveSection()}
      </div>
    </div>
  );
};

export default AboutApp;