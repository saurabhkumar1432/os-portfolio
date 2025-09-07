import { describe, it, expect, vi } from 'vitest';
import { 
  parseFrontmatter, 
  metadataToProject, 
  validateContentMetadata, 
  loadProjectFromFile,
  exampleMDXContent,
  type ContentMetadata 
} from '../contentLoader';

describe('contentLoader', () => {
  describe('parseFrontmatter', () => {
    it('should parse valid frontmatter', () => {
      const content = `---
title: Test Project
year: 2024
featured: true
tech:
  - React
  - TypeScript
---

# Project Content

This is the main content.`;

      const result = parseFrontmatter(content);
      
      expect(result.metadata.title).toBe('Test Project');
      expect(result.metadata.year).toBe(2024);
      expect(result.metadata.featured).toBe(true);
      expect(result.metadata.tech).toEqual(['React', 'TypeScript']);
      expect(result.body.trim()).toBe('# Project Content\n\nThis is the main content.');
    });

    it('should handle content without frontmatter', () => {
      const content = '# Just Content\n\nNo frontmatter here.';
      
      const result = parseFrontmatter(content);
      
      expect(result.metadata).toEqual({});
      expect(result.body).toBe(content);
    });

    it('should handle empty frontmatter', () => {
      const content = `---
---

# Content`;

      const result = parseFrontmatter(content);
      
      expect(result.metadata).toEqual({});
      expect(result.body).toContain('# Content');
    });

    it('should parse boolean values', () => {
      const content = `---
featured: true
draft: false
---

Content`;

      const result = parseFrontmatter(content);
      
      expect(result.metadata.featured).toBe(true);
      expect(result.metadata.draft).toBe(false);
    });

    it('should parse numeric values', () => {
      const content = `---
year: 2024
complexity: 8
---

Content`;

      const result = parseFrontmatter(content);
      
      expect(result.metadata.year).toBe(2024);
      expect(result.metadata.complexity).toBe(8);
    });

    it('should parse quoted strings', () => {
      const content = `---
title: "Quoted Title"
description: "Multi: word: description"
---

Content`;

      const result = parseFrontmatter(content);
      
      expect(result.metadata.title).toBe('Quoted Title');
      expect(result.metadata.description).toBe('Multi: word: description');
    });

    it('should parse arrays', () => {
      const content = `---
tech:
  - React
  - TypeScript
  - Node.js
highlights:
  - Fast performance
  - Great UX
---

Content`;

      const result = parseFrontmatter(content);
      
      expect(result.metadata.tech).toEqual(['React', 'TypeScript', 'Node.js']);
      expect(result.metadata.highlights).toEqual(['Fast performance', 'Great UX']);
    });
  });

  describe('metadataToProject', () => {
    it('should convert metadata to Project object', () => {
      const metadata: ContentMetadata = {
        slug: 'test-project',
        title: 'Test Project',
        summary: 'A test project',
        year: 2024,
        role: 'Developer',
        tech: ['React', 'TypeScript'],
        type: 'web',
        featured: true,
        complexity: 7,
        links: {
          github: 'https://github.com/test/project'
        },
        highlights: ['Feature 1', 'Feature 2']
      };

      const description = 'Detailed project description';
      const project = metadataToProject(metadata, description);

      expect(project.slug).toBe(metadata.slug);
      expect(project.title).toBe(metadata.title);
      expect(project.summary).toBe(metadata.summary);
      expect(project.description).toBe(description);
      expect(project.year).toBe(metadata.year);
      expect(project.role).toBe(metadata.role);
      expect(project.tech).toEqual(metadata.tech);
      expect(project.type).toBe(metadata.type);
      expect(project.featured).toBe(metadata.featured);
      expect(project.complexity).toBe(metadata.complexity);
      expect(project.links).toEqual(metadata.links);
      expect(project.highlights).toEqual(metadata.highlights);
    });

    it('should handle optional fields', () => {
      const metadata: ContentMetadata = {
        slug: 'minimal-project',
        title: 'Minimal Project',
        summary: 'A minimal project',
        year: 2024,
        role: 'Developer',
        tech: ['JavaScript'],
        type: 'web',
        featured: false,
        complexity: 5
      };

      const project = metadataToProject(metadata, 'Description');

      expect(project.links).toBeUndefined();
      expect(project.media).toBeUndefined();
      expect(project.highlights).toBeUndefined();
      expect(project.metrics).toBeUndefined();
    });
  });

  describe('validateContentMetadata', () => {
    const validMetadata: ContentMetadata = {
      slug: 'test-project',
      title: 'Test Project',
      summary: 'A test project',
      year: 2024,
      role: 'Developer',
      tech: ['React'],
      type: 'web',
      featured: true,
      complexity: 7
    };

    it('should return no errors for valid metadata', () => {
      const errors = validateContentMetadata(validMetadata);
      
      expect(errors).toEqual([]);
    });

    it('should detect missing required fields', () => {
      const incompleteMetadata = {
        slug: 'test',
        title: 'Test'
        // Missing other required fields
      };

      const errors = validateContentMetadata(incompleteMetadata);
      
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.includes('Missing required field'))).toBe(true);
    });

    it('should validate year range', () => {
      const invalidYearMetadata = {
        ...validMetadata,
        year: 1800 // Too old
      };

      const errors = validateContentMetadata(invalidYearMetadata);
      
      expect(errors.some(error => error.includes('Year must be between'))).toBe(true);
    });

    it('should validate complexity range', () => {
      const invalidComplexityMetadata = {
        ...validMetadata,
        complexity: 15 // Too high
      };

      const errors = validateContentMetadata(invalidComplexityMetadata);
      
      expect(errors.some(error => error.includes('Complexity must be between'))).toBe(true);
    });

    it('should validate project type', () => {
      const invalidTypeMetadata = {
        ...validMetadata,
        type: 'invalid' as any
      };

      const errors = validateContentMetadata(invalidTypeMetadata);
      
      expect(errors.some(error => error.includes('Type must be one of'))).toBe(true);
    });

    it('should validate tech array', () => {
      const invalidTechMetadata = {
        ...validMetadata,
        tech: [] // Empty array
      };

      const errors = validateContentMetadata(invalidTechMetadata);
      
      expect(errors.some(error => error.includes('Tech must be a non-empty array'))).toBe(true);
    });

    it('should validate tech is array', () => {
      const invalidTechMetadata = {
        ...validMetadata,
        tech: 'React' as any // Should be array
      };

      const errors = validateContentMetadata(invalidTechMetadata);
      
      expect(errors.some(error => error.includes('Tech must be a non-empty array'))).toBe(true);
    });
  });

  describe('loadProjectFromFile', () => {
    it('should return null and log warning for unimplemented functionality', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const result = await loadProjectFromFile('/path/to/project.mdx');
      
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('File loading not implemented for: /path/to/project.mdx');
      
      consoleSpy.mockRestore();
    });
  });

  describe('exampleMDXContent', () => {
    it('should be valid MDX content that can be parsed', () => {
      const result = parseFrontmatter(exampleMDXContent);
      
      expect(result.metadata.slug).toBe('example-project');
      expect(result.metadata.title).toBe('Example Project');
      expect(result.metadata.year).toBe(2024);
      expect(result.metadata.tech).toEqual(['React', 'TypeScript', 'Node.js']);
      expect(result.metadata.type).toBe('web');
      expect(result.metadata.featured).toBe(true);
      expect(result.metadata.complexity).toBe(7);
      
      expect(result.body).toContain('# Example Project');
      expect(result.body).toContain('## Features');
      expect(result.body).toContain('## Technical Implementation');
    });

    it('should pass validation', () => {
      const { metadata } = parseFrontmatter(exampleMDXContent);
      const errors = validateContentMetadata(metadata as ContentMetadata);
      
      expect(errors).toEqual([]);
    });

    it('should convert to valid Project object', () => {
      const { metadata, body } = parseFrontmatter(exampleMDXContent);
      const project = metadataToProject(metadata as ContentMetadata, body);
      
      expect(project.slug).toBe('example-project');
      expect(project.title).toBe('Example Project');
      expect(project.description).toBe(body.trim());
      expect(project.highlights).toContain('Modern React architecture');
      expect(project.tech).toEqual(['React', 'TypeScript', 'Node.js']);
      expect(project.type).toBe('web');
      expect(project.featured).toBe(true);
      expect(project.complexity).toBe(7);
    });
  });
});