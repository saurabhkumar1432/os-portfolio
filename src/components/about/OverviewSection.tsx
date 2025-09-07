import React from 'react';
import type { AboutData } from '../../types';

interface OverviewSectionProps {
  data: AboutData;
}

/**
 * Overview section showing summary information
 */
const OverviewSection: React.FC<OverviewSectionProps> = ({ data }) => {
  const currentCompany = data.companies[0]; // Most recent company
  const totalExperience = data.companies.reduce((total, company) => {
    const start = new Date(company.startDate);
    const end = company.endDate ? new Date(company.endDate) : new Date();
    const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return total + years;
  }, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
          JD
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          John Doe
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-1">
          {currentCompany.position}
        </p>
        <p className="text-gray-500 dark:text-gray-500">
          📍 {data.contact.location}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {Math.round(totalExperience)}+
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Years Experience
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {data.companies.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Companies
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {data.skills.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Technical Skills
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          About Me
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          I'm a passionate full-stack developer with {Math.round(totalExperience)} years of experience 
          building scalable web applications and leading development teams. I specialize in modern 
          JavaScript frameworks, cloud architecture, and creating exceptional user experiences.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Currently working as a {currentCompany.position} at {currentCompany.name}, where I lead 
          the development of enterprise applications serving thousands of users. I'm passionate about 
          clean code, performance optimization, and mentoring the next generation of developers.
        </p>
      </div>

      {/* Current Role */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Current Role
        </h2>
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 dark:text-blue-400 text-xl">💼</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {currentCompany.position}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {currentCompany.name} • {currentCompany.location}
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              {currentCompany.description}
            </p>
          </div>
        </div>
      </div>

      {/* Top Skills */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Top Skills
        </h2>
        <div className="flex flex-wrap gap-2">
          {data.skills
            .filter(skill => skill.proficiency >= 4)
            .slice(0, 8)
            .map((skill) => (
              <span
                key={skill.name}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
              >
                {skill.name}
              </span>
            ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewSection;