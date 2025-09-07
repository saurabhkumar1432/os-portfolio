import React, { useState, useMemo } from 'react';
import type { Skill } from '../../types';

interface SkillsSectionProps {
  skills: Skill[];
  onSkillFilter?: (skill: string | null) => void;
  filteredProjects?: string[];
}

const categoryLabels: Record<Skill['category'], string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  mobile: 'Mobile',
  devops: 'DevOps',
  database: 'Database',
  tools: 'Tools',
  languages: 'Languages',
};

const categoryColors: Record<Skill['category'], string> = {
  frontend: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
  backend: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
  mobile: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
  devops: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
  database: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
  tools: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  languages: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300',
};

/**
 * Skills section with proficiency indicators and project filtering
 */
const SkillsSection: React.FC<SkillsSectionProps> = ({
  skills,
  onSkillFilter,
  filteredProjects: _filteredProjects = [],
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Skill['category'] | 'all'>('all');
  const [sortBy, setSortBy] = useState<'proficiency' | 'experience' | 'name'>('proficiency');

  // Group skills by category
  const skillsByCategory = useMemo(() => {
    const filtered = selectedCategory === 'all' 
      ? skills 
      : skills.filter(skill => skill.category === selectedCategory);

    // Sort skills
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'proficiency':
          return b.proficiency - a.proficiency;
        case 'experience':
          return b.yearsOfExperience - a.yearsOfExperience;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    // Group by category
    const grouped: Record<string, Skill[]> = {};
    sorted.forEach(skill => {
      const category = skill.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(skill);
    });

    return grouped;
  }, [skills, selectedCategory, sortBy]);

  const categories = Object.keys(categoryLabels) as Skill['category'][];

  const getProficiencyLabel = (level: number): string => {
    const labels = ['', 'Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'];
    return labels[level] || 'Unknown';
  };

  const getProficiencyColor = (level: number): string => {
    const colors = [
      '',
      'bg-red-200 dark:bg-red-800',
      'bg-orange-200 dark:bg-orange-800',
      'bg-yellow-200 dark:bg-yellow-800',
      'bg-green-200 dark:bg-green-800',
      'bg-blue-200 dark:bg-blue-800',
    ];
    return colors[level] || 'bg-gray-200 dark:bg-gray-800';
  };

  const handleSkillClick = (skill: Skill) => {
    if (onSkillFilter && skill.relatedProjects && skill.relatedProjects.length > 0) {
      onSkillFilter(skill.name);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Technical Skills
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as Skill['category'] | 'all')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {categoryLabels[category]}
              </option>
            ))}
          </select>
          
          {/* Sort Options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'proficiency' | 'experience' | 'name')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
          >
            <option value="proficiency">Sort by Proficiency</option>
            <option value="experience">Sort by Experience</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="space-y-8">
        {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
          <div key={category}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <span className={`px-2 py-1 rounded text-sm mr-3 ${categoryColors[category as Skill['category']]}`}>
                {categoryLabels[category as Skill['category']]}
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                ({categorySkills.length} skills)
              </span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorySkills.map((skill) => (
                <div
                  key={skill.name}
                  onClick={() => handleSkillClick(skill)}
                  className={`
                    bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 transition-all
                    ${skill.relatedProjects && skill.relatedProjects.length > 0
                      ? 'cursor-pointer hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600'
                      : ''
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {skill.name}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProficiencyColor(skill.proficiency)}`}>
                      {getProficiencyLabel(skill.proficiency)}
                    </span>
                  </div>
                  
                  {/* Proficiency Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>Proficiency</span>
                      <span>{skill.proficiency}/5</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${(skill.proficiency / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Experience */}
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {skill.yearsOfExperience} year{skill.yearsOfExperience !== 1 ? 's' : ''} experience
                  </div>
                  
                  {/* Related Projects */}
                  {skill.relatedProjects && skill.relatedProjects.length > 0 && (
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      {skill.relatedProjects.length} related project{skill.relatedProjects.length !== 1 ? 's' : ''}
                      {onSkillFilter && (
                        <span className="ml-1">→ Click to filter</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Skills Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Skills Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {skills.filter(s => s.proficiency >= 4).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Expert Level
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {skills.filter(s => s.yearsOfExperience >= 3).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              3+ Years Exp
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {categories.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Categories
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {skills.filter(s => s.relatedProjects && s.relatedProjects.length > 0).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              With Projects
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsSection;