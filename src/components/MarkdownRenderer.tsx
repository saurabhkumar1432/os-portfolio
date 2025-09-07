import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Simple markdown renderer for notepad preview
 * Supports basic markdown syntax without external dependencies
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className = '' 
}) => {
  const renderMarkdown = (text: string): React.ReactNode => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];
    let listType: 'ul' | 'ol' | null = null;
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    // let codeBlockLanguage: string | undefined; // TODO: Use for syntax highlighting

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          React.createElement(
            listType || 'ul',
            { key: `list-${elements.length}`, className: 'ml-4 mb-4' },
            currentList
          )
        );
        currentList = [];
        listType = null;
      }
    };

    const flushCodeBlock = () => {
      if (codeBlockContent.length > 0) {
        elements.push(
          <pre key={`code-${elements.length}`} className="bg-gray-100 dark:bg-gray-800 p-4 rounded mb-4 overflow-x-auto">
            <code className="text-sm font-mono">
              {codeBlockContent.join('\n')}
            </code>
          </pre>
        );
        codeBlockContent = [];
      }
    };

    lines.forEach((line, index) => {
      // Handle code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock();
          inCodeBlock = false;
        } else {
          flushList();
          inCodeBlock = true;
          // codeBlockLanguage = line.slice(3).trim(); // TODO: Use for syntax highlighting
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Handle headers
      if (line.startsWith('#')) {
        flushList();
        const level = line.match(/^#+/)?.[0].length || 1;
        const text = line.replace(/^#+\s*/, '');
        const HeaderTag = `h${Math.min(level, 6)}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
        const headerClasses = {
          1: 'text-3xl font-bold mb-4 mt-6',
          2: 'text-2xl font-bold mb-3 mt-5',
          3: 'text-xl font-bold mb-3 mt-4',
          4: 'text-lg font-bold mb-2 mt-3',
          5: 'text-base font-bold mb-2 mt-2',
          6: 'text-sm font-bold mb-2 mt-2',
        };
        
        elements.push(
          React.createElement(
            HeaderTag,
            { key: `header-${index}`, className: headerClasses[level as keyof typeof headerClasses] },
            renderInlineMarkdown(text)
          )
        );
        return;
      }

      // Handle lists
      const unorderedMatch = line.match(/^(\s*)[-*+]\s+(.+)$/);
      const orderedMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
      
      if (unorderedMatch || orderedMatch) {
        const match = unorderedMatch || orderedMatch;
        const newListType = unorderedMatch ? 'ul' : 'ol';
        
        if (listType !== newListType) {
          flushList();
          listType = newListType;
        }
        
        currentList.push(
          <li key={`list-item-${index}`} className="mb-1">
            {renderInlineMarkdown(match![2])}
          </li>
        );
        return;
      } else {
        flushList();
      }

      // Handle horizontal rules
      if (line.match(/^---+$/)) {
        elements.push(
          <hr key={`hr-${index}`} className="my-6 border-gray-300 dark:border-gray-600" />
        );
        return;
      }

      // Handle blockquotes
      if (line.startsWith('>')) {
        const text = line.replace(/^>\s*/, '');
        elements.push(
          <blockquote key={`quote-${index}`} className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic mb-4">
            {renderInlineMarkdown(text)}
          </blockquote>
        );
        return;
      }

      // Handle empty lines
      if (line.trim() === '') {
        if (elements.length > 0) {
          elements.push(<br key={`br-${index}`} />);
        }
        return;
      }

      // Handle regular paragraphs
      elements.push(
        <p key={`p-${index}`} className="mb-4 leading-relaxed">
          {renderInlineMarkdown(line)}
        </p>
      );
    });

    // Flush any remaining lists or code blocks
    flushList();
    flushCodeBlock();

    return elements;
  };

  const renderInlineMarkdown = (text: string): React.ReactNode => {
    let result: React.ReactNode = text;

    // Handle inline code
    result = processInlinePattern(
      result,
      /`([^`]+)`/g,
      (_match, content) => (
        <code key={Math.random()} className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">
          {content}
        </code>
      )
    );

    // Handle bold
    result = processInlinePattern(
      result,
      /\*\*([^*]+)\*\*/g,
      (_match, content) => (
        <strong key={Math.random()} className="font-bold">
          {content}
        </strong>
      )
    );

    // Handle italic
    result = processInlinePattern(
      result,
      /\*([^*]+)\*/g,
      (_match, content) => (
        <em key={Math.random()} className="italic">
          {content}
        </em>
      )
    );

    // Handle links
    result = processInlinePattern(
      result,
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (_match, text, url) => (
        <a 
          key={Math.random()} 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          {text}
        </a>
      )
    );

    return result;
  };

  const processInlinePattern = (
    text: React.ReactNode,
    pattern: RegExp,
    replacer: (match: string, ...groups: string[]) => React.ReactNode
  ): React.ReactNode => {
    if (typeof text !== 'string') return text;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      // Add replaced content
      parts.push(replacer(match[0], ...match.slice(1)));

      lastIndex = pattern.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 1 ? parts : text;
  };

  return (
    <div className={`prose prose-sm max-w-none dark:prose-invert ${className}`}>
      {renderMarkdown(content)}
    </div>
  );
};