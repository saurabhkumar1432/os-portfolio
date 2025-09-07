import React, { useState } from 'react';
import type { Project } from '../../types';

interface ProjectDetailProps {
  project: Project;
  onClose?: () => void;
  onNavigateToProject?: (slug: string) => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onClose,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

  const allImages = project.media?.gallery || (project.media?.cover ? [project.media.cover] : []);

  const handleImageError = (src: string) => {
    setImageError(prev => ({ ...prev, [src]: true }));
  };

  const handlePrevImage = () => {
    setSelectedImageIndex(prev => 
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImageIndex(prev => 
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose?.();
    } else if (event.key === 'ArrowLeft' && allImages.length > 1) {
      handlePrevImage();
    } else if (event.key === 'ArrowRight' && allImages.length > 1) {
      handleNextImage();
    }
  };

  return (
    <div 
      className="flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close project detail"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {project.title}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {project.year} • {project.role}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {project.featured && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              ⭐ Featured
            </span>
          )}
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 capitalize">
            {project.type}
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Complexity: {project.complexity}/10
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          {/* Media Gallery */}
          {allImages.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Media
              </h2>
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                  {!imageError[allImages[selectedImageIndex]] ? (
                    <img
                      src={allImages[selectedImageIndex]}
                      alt={`${project.title} - Image ${selectedImageIndex + 1}`}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(allImages[selectedImageIndex])}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      <div className="text-center">
                        <div className="text-6xl font-bold mb-2">{project.title.charAt(0)}</div>
                        <div className="text-sm opacity-75">Image not available</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Navigation arrows */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                        aria-label="Previous image"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                        aria-label="Next image"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                  
                  {/* Image counter */}
                  {allImages.length > 1 && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/50 text-white text-sm">
                      {selectedImageIndex + 1} / {allImages.length}
                    </div>
                  )}
                </div>
                
                {/* Thumbnail strip */}
                {allImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {allImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                          index === selectedImageIndex
                            ? 'border-blue-500'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        {!imageError[image] ? (
                          <img
                            src={image}
                            alt={`${project.title} thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={() => handleImageError(image)}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs">
                            N/A
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Project Summary */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Summary
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {project.summary}
            </p>
          </section>

          {/* Project Description */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Description
            </h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                {project.description}
              </div>
            </div>
          </section>

          {/* Technologies */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Technologies Used
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.tech.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>

          {/* Highlights */}
          {project.highlights && project.highlights.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Key Highlights
              </h2>
              <ul className="space-y-2">
                {project.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Metrics */}
          {project.metrics && project.metrics.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Project Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.metrics.map((metric, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center"
                  >
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                      {metric.value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Links */}
          {project.links && Object.keys(project.links).length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Project Links
              </h2>
              <div className="flex flex-wrap gap-3">
                {project.links.github && (
                  <a
                    href={project.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    View on GitHub
                  </a>
                )}
                {project.links.demo && (
                  <a
                    href={project.links.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Live Demo
                  </a>
                )}
                {project.links.documentation && (
                  <a
                    href={project.links.documentation}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Documentation
                  </a>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;