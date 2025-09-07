import type { Project } from '../types';

/**
 * Content loader utilities for project data
 */

export interface ContentMetadata {
  slug: string;
  title: string;
  summary: string;
  year: number;
  role: string;
  tech: string[];
  type: Project['type'];
  featured: boolean;
  complexity: number;
  links?: {
    github?: string;
    demo?: string;
    documentation?: string;
  };
  media?: {
    cover: string;
    gallery?: string[];
    video?: string;
  };
  highlights?: string[];
  metrics?: Array<{
    label: string;
    value: string;
  }>;
}

/**
 * Parse frontmatter from MDX content
 * This is a simplified implementation - in a real app you'd use a proper YAML parser
 */
export function parseFrontmatter(content: string): { metadata: Partial<ContentMetadata>; body: string } {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { metadata: {}, body: content };
  }
  
  const [, frontmatter, body] = match;
  const metadata: any = {};
  
  if (!frontmatter.trim()) {
    return { metadata: {}, body: body || '' };
  }
  
  // Simple YAML-like parsing (in production, use a proper YAML parser)
  const lines = frontmatter.split(/\r?\n/);
  let currentKey = '';
  let currentObject: any = null;
  let currentArray: string[] = [];
  let inArray = false;
  let inObject = false;
  let indent = 0;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    const lineIndent = line.length - line.trimStart().length;
    
    if (trimmed.startsWith('- ') && inArray) {
      // Array item
      currentArray.push(trimmed.substring(2).trim());
    } else if (lineIndent > indent && inObject && currentObject) {
      // Nested object property
      const [key, ...valueParts] = trimmed.split(':');
      const value = valueParts.join(':').trim();
      let cleanValue: any = value;
      
      // Type conversion
      if (cleanValue === 'true') cleanValue = true;
      else if (cleanValue === 'false') cleanValue = false;
      else if (/^\d+$/.test(cleanValue)) cleanValue = parseInt(cleanValue, 10);
      else if (cleanValue.startsWith('"') && cleanValue.endsWith('"')) {
        cleanValue = cleanValue.slice(1, -1);
      }
      
      currentObject[key.trim()] = cleanValue;
    } else if (trimmed.includes(':')) {
      // Save previous array if we were building one
      if (inArray && currentKey) {
        metadata[currentKey] = currentArray;
        currentArray = [];
        inArray = false;
      }
      
      // Save previous object if we were building one
      if (inObject && currentKey && currentObject) {
        metadata[currentKey] = currentObject;
        currentObject = null;
        inObject = false;
      }
      
      const [key, ...valueParts] = trimmed.split(':');
      const value = valueParts.join(':').trim();
      
      if (value === '') {
        // This might be the start of an array or object
        currentKey = key.trim();
        indent = lineIndent;
        
        // Look ahead to see if next non-empty line is an array item or object property
        const nextLineIndex = lines.findIndex((l, i) => i > lines.indexOf(line) && l.trim());
        if (nextLineIndex !== -1) {
          const nextLine = lines[nextLineIndex];
          if (nextLine.trim().startsWith('- ')) {
            inArray = true;
          } else if (nextLine.includes(':') && nextLine.length - nextLine.trimStart().length > lineIndent) {
            inObject = true;
            currentObject = {};
          }
        }
      } else {
        // Simple key-value pair
        const cleanKey = key.trim();
        let cleanValue: any = value;
        
        // Type conversion
        if (cleanValue === 'true') cleanValue = true;
        else if (cleanValue === 'false') cleanValue = false;
        else if (/^\d+$/.test(cleanValue)) cleanValue = parseInt(cleanValue, 10);
        else if (cleanValue.startsWith('"') && cleanValue.endsWith('"')) {
          cleanValue = cleanValue.slice(1, -1);
        }
        
        metadata[cleanKey] = cleanValue;
      }
    }
  }
  
  // Save final array if we were building one
  if (inArray && currentKey) {
    metadata[currentKey] = currentArray;
  }
  
  // Save final object if we were building one
  if (inObject && currentKey && currentObject) {
    metadata[currentKey] = currentObject;
  }
  
  return { metadata, body: body || '' };
}

/**
 * Convert content metadata to Project object
 */
export function metadataToProject(metadata: ContentMetadata, description: string): Project {
  return {
    slug: metadata.slug,
    title: metadata.title,
    summary: metadata.summary,
    description: description.trim(),
    year: metadata.year,
    role: metadata.role,
    tech: metadata.tech,
    type: metadata.type,
    links: metadata.links,
    media: metadata.media,
    highlights: metadata.highlights,
    metrics: metadata.metrics,
    featured: metadata.featured,
    complexity: metadata.complexity
  };
}

/**
 * Validate content metadata
 */
export function validateContentMetadata(metadata: Partial<ContentMetadata>): string[] {
  const errors: string[] = [];
  const required = ['slug', 'title', 'summary', 'year', 'role', 'tech', 'type', 'featured', 'complexity'];
  
  for (const field of required) {
    if (!(field in metadata)) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  if (metadata.year && (metadata.year < 1900 || metadata.year > new Date().getFullYear() + 1)) {
    errors.push('Year must be between 1900 and next year');
  }
  
  if (metadata.complexity && (metadata.complexity < 1 || metadata.complexity > 10)) {
    errors.push('Complexity must be between 1 and 10');
  }
  
  if (metadata.type && !['web', 'mobile', 'systems', 'ml'].includes(metadata.type)) {
    errors.push('Type must be one of: web, mobile, systems, ml');
  }
  
  if (metadata.tech && (!Array.isArray(metadata.tech) || metadata.tech.length === 0)) {
    errors.push('Tech must be a non-empty array');
  }
  
  return errors;
}

/**
 * Load project from file content (future implementation)
 */
export async function loadProjectFromFile(filePath: string): Promise<Project | null> {
  try {
    // In a real implementation, this would:
    // 1. Read the file from the filesystem or fetch from a URL
    // 2. Parse the MDX content
    // 3. Extract frontmatter and body
    // 4. Validate the metadata
    // 5. Return a Project object
    
    console.warn(`File loading not implemented for: ${filePath}`);
    return null;
  } catch (error) {
    console.error(`Failed to load project from file: ${filePath}`, error);
    return null;
  }
}

/**
 * Example MDX content for reference
 */
export const exampleMDXContent = `---
slug: example-project
title: Example Project
summary: This is an example project
year: 2024
role: Full Stack Developer
tech:
  - React
  - TypeScript
  - Node.js
type: web
featured: true
complexity: 7
highlights:
  - Modern React architecture
  - TypeScript for type safety
  - Responsive design
---

# Example Project

This is the main content of the project. It can include:

- Detailed description
- Architecture diagrams
- Code examples
- Screenshots
- Implementation details

## Features

- Feature 1
- Feature 2
- Feature 3

## Technical Implementation

Details about how the project was built...
`;