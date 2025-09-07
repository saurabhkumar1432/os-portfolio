import React, { useState } from 'react';
import type { TimelineMilestone } from '../../types';

interface TimelineSectionProps {
  timeline: TimelineMilestone[];
  expandedMilestone: string | null;
  onMilestoneToggle: (milestoneId: string | null) => void;
}

const typeColors: Record<TimelineMilestone['type'], string> = {
  education: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  work: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
  project: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  achievement: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  certification: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
};

const typeLabels: Record<TimelineMilestone['type'], string> = {
  education: 'Education',
  work: 'Work',
  project: 'Project',
  achievement: 'Achievement',
  certification: 'Certification',
};

/**
 * Interactive timeline component with expandable milestones
 */
const TimelineSection: React.FC<TimelineSectionProps> = ({
  timeline,
  expandedMilestone,
  onMilestoneToggle,
}) => {
  const [filterType, setFilterType] = useState<TimelineMilestone['type'] | 'all'>('all');

  const filteredTimeline = filterType === 'all' 
    ? timeline 
    : timeline.filter(milestone => milestone.type === filterType);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMonths = Math.round((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    if (diffInMonths < 1) {
      return 'This month';
    } else if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffInMonths / 12);
      return `${years} year${years !== 1 ? 's' : ''} ago`;
    }
  };

  const types = Object.keys(typeLabels) as TimelineMilestone['type'][];

  return (
    <div className="p-6 space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Career Timeline
        </h2>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as TimelineMilestone['type'] | 'all')}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
        >
          <option value="all">All Events</option>
          {types.map(type => (
            <option key={type} value={type}>
              {typeLabels[type]}
            </option>
          ))}
        </select>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600" />
        
        <div className="space-y-8">
          {filteredTimeline.map((milestone, _index) => {
            const isExpanded = expandedMilestone === milestone.id;
            
            return (
              <div key={milestone.id} className="relative flex items-start">
                {/* Timeline Dot */}
                <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-white dark:bg-gray-800 border-4 border-gray-300 dark:border-gray-600 rounded-full">
                  <span className="text-2xl" role="img" aria-label={milestone.type}>
                    {milestone.icon}
                  </span>
                </div>
                
                {/* Content */}
                <div className="flex-1 ml-6">
                  <div
                    className={`
                      bg-white dark:bg-gray-800 rounded-lg border-2 p-6 cursor-pointer transition-all
                      ${typeColors[milestone.type]}
                      ${isExpanded ? 'shadow-lg' : 'hover:shadow-md'}
                    `}
                    onClick={() => onMilestoneToggle(isExpanded ? null : milestone.id)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${typeColors[milestone.type]}`}>
                            {typeLabels[milestone.type]}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {getRelativeTime(milestone.date)}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          {milestone.title}
                        </h3>
                        {milestone.company && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {milestone.company}
                            {milestone.location && ` • ${milestone.location}`}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {formatDate(milestone.date)}
                        </p>
                        <button
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mt-1"
                          aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                        >
                          <svg
                            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {milestone.description}
                    </p>
                    
                    {/* Expandable Details */}
                    {isExpanded && milestone.details && milestone.details.length > 0 && (
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          Details:
                        </h4>
                        <ul className="space-y-1">
                          {milestone.details.map((detail, detailIndex) => (
                            <li
                              key={detailIndex}
                              className="text-sm text-gray-700 dark:text-gray-300 flex items-start"
                            >
                              <span className="text-blue-500 mr-2 mt-1">•</span>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Expand/Collapse Hint */}
                    {milestone.details && milestone.details.length > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                        Click to {isExpanded ? 'collapse' : 'expand'} details
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Timeline Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {types.map(type => {
            const count = timeline.filter(m => m.type === type).length;
            return (
              <div key={type} className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {count}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {typeLabels[type]}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimelineSection;