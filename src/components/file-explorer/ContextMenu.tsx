import React, { useEffect, useRef } from 'react';
import { 
  Eye, 
  Copy, 
  Download, 
  ExternalLink,
  Folder,
  FileText,
  Trash2,
  Info
} from 'lucide-react';
import type { VNode, ContextMenuItem } from '../../types';

interface ContextMenuProps {
  file: VNode;
  x: number;
  y: number;
  onClose: () => void;
  onPreview: (file: VNode) => void;
  onOpen: (file: VNode) => void;
  onCopy: (file: VNode) => void;
  onDownload: (file: VNode) => void;
  onShowInfo: (file: VNode) => void;
  className?: string;
}

/**
 * Context menu component for file operations
 */
export const ContextMenu: React.FC<ContextMenuProps> = ({
  file,
  x,
  y,
  onClose,
  onPreview,
  onOpen,
  onCopy,
  onDownload,
  onShowInfo,
  className = ''
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust menu position to stay within viewport
  const adjustedPosition = React.useMemo(() => {
    const menuWidth = 200;
    const menuHeight = 250;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    if (x + menuWidth > viewportWidth) {
      adjustedX = x - menuWidth;
    }

    if (y + menuHeight > viewportHeight) {
      adjustedY = y - menuHeight;
    }

    return { x: Math.max(0, adjustedX), y: Math.max(0, adjustedY) };
  }, [x, y]);

  const menuItems: ContextMenuItem[] = [
    {
      id: 'open',
      label: file.type === 'folder' ? 'Open Folder' : 'Open',
      icon: file.type === 'folder' ? 'Folder' : 'ExternalLink',
      action: () => {
        onOpen(file);
        onClose();
      }
    },
    {
      id: 'separator1',
      label: '',
      separator: true,
      action: () => {}
    },
    {
      id: 'preview',
      label: 'Preview',
      icon: 'Eye',
      action: () => {
        onPreview(file);
        onClose();
      },
      disabled: file.type === 'folder' || !file.content
    },
    {
      id: 'copy',
      label: 'Copy Path',
      icon: 'Copy',
      action: () => {
        onCopy(file);
        onClose();
      }
    },
    {
      id: 'download',
      label: 'Download',
      icon: 'Download',
      action: () => {
        onDownload(file);
        onClose();
      },
      disabled: file.type === 'folder' || !file.content
    },
    {
      id: 'separator2',
      label: '',
      separator: true,
      action: () => {}
    },
    {
      id: 'info',
      label: 'Properties',
      icon: 'Info',
      action: () => {
        onShowInfo(file);
        onClose();
      }
    }
  ];

  const getIconComponent = (iconName: string) => {
    const iconMap = {
      Eye,
      Copy,
      Download,
      ExternalLink,
      Folder,
      FileText,
      Trash2,
      Info
    };
    return iconMap[iconName as keyof typeof iconMap] || FileText;
  };

  return (
    <div
      ref={menuRef}
      className={`
        fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
        rounded-lg shadow-lg py-1 min-w-48 ${className}
      `}
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y
      }}
      role="menu"
      aria-label={`Context menu for ${file.name}`}
    >
      {menuItems.map((item) => {
        if (item.separator) {
          return (
            <div
              key={item.id}
              className="h-px bg-gray-200 dark:bg-gray-700 my-1"
              role="separator"
            />
          );
        }

        const IconComponent = item.icon ? getIconComponent(item.icon) : null;

        return (
          <button
            key={item.id}
            onClick={item.action}
            disabled={item.disabled}
            className={`
              w-full flex items-center px-3 py-2 text-sm text-left
              transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500
              ${item.disabled
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
            role="menuitem"
            aria-label={item.label}
          >
            {IconComponent && (
              <IconComponent className="w-4 h-4 mr-3 flex-shrink-0" />
            )}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};