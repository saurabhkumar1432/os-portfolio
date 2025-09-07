import React from 'react';
import type { Company, Institution } from '../../types';

interface ExperienceSectionProps {
  companies: Company[];
  institutions: Institution[];
}

/**
 * Experience section showing work history and education
 */
const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  companies,
  institutions,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  const calculateDuration = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    if (months < 12) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    }
    
    return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  };

  return (
    <div className="p-6 space-y-8">
      {/* Work Experience */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Work Experience
        </h2>
        <div className="space-y-6">
          {companies.map((company, _index) => (
            <div
              key={`${company.name}-${company.startDate}`}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {company.position}
                  </h3>
                  <p className="text-lg text-blue-600 dark:text-blue-400 font-medium">
                    {company.name}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {company.location}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(company.startDate)} - {company.endDate ? formatDate(company.endDate) : 'Present'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {calculateDuration(company.startDate, company.endDate)}
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {company.description}
              </p>
              
              {/* Achievements */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Key Achievements:
                </h4>
                <ul className="space-y-1">
                  {company.achievements.map((achievement, achievementIndex) => (
                    <li
                      key={achievementIndex}
                      className="text-sm text-gray-700 dark:text-gray-300 flex items-start"
                    >
                      <span className="text-green-500 mr-2 mt-1">•</span>
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Technologies */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Technologies:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {company.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Education
        </h2>
        <div className="space-y-4">
          {institutions.map((institution, _index) => (
            <div
              key={`${institution.name}-${institution.startYear}`}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {institution.degree}
                  </h3>
                  <p className="text-lg text-blue-600 dark:text-blue-400 font-medium">
                    {institution.field}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {institution.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {institution.startYear} - {institution.endYear}
                  </p>
                  {institution.gpa && (
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      GPA: {institution.gpa}
                    </p>
                  )}
                </div>
              </div>
              
              {institution.description && (
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {institution.description}
                </p>
              )}
              
              {institution.honors && institution.honors.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Honors & Awards:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {institution.honors.map((honor) => (
                      <span
                        key={honor}
                        className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-medium"
                      >
                        {honor}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ExperienceSection;