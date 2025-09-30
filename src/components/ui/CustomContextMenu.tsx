import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  RefreshCw,
  Monitor,
  Palette,
  Settings,
  Grid3X3,
  Maximize2,
  Trash2,
  Copy,
  Scissors,
  ClipboardPaste,
} from 'lucide-react';

interface ContextMenuItem {
  id: string;
  label?: string;
  icon?: React.ReactNode;
  action?: () => void;
  separator?: boolean;
  submenu?: ContextMenuItem[];
  disabled?: boolean;
}

interface CustomContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  items: ContextMenuItem[];
}

export const CustomContextMenu: React.FC<CustomContextMenuProps> = ({ x, y, onClose, items }) => {
  const [position, setPosition] = useState({ x, y });
  const [submenuOpen, setSubmenuOpen] = useState<string | null>(null);

  useEffect(() => {
    // Adjust position if menu goes off-screen
    const menuWidth = 220;
    const menuHeight = items.length * 36 + 16;
    
    let adjustedX = x;
    let adjustedY = y;

    if (x + menuWidth > window.innerWidth) {
      adjustedX = window.innerWidth - menuWidth - 10;
    }

    if (y + menuHeight > window.innerHeight) {
      adjustedY = window.innerHeight - menuHeight - 10;
    }

    setPosition({ x: adjustedX, y: adjustedY });
  }, [x, y, items.length]);

  useEffect(() => {
    const handleClickOutside = () => onClose();
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    // Small delay to prevent immediate close
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }, 100);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleItemClick = (item: ContextMenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (item.disabled) return;
    
    if (item.submenu) {
      setSubmenuOpen(submenuOpen === item.id ? null : item.id);
    } else if (item.action) {
      item.action();
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="fixed z-[10000] bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 py-2 min-w-[220px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, index) => (
        <React.Fragment key={item.id || index}>
          {item.separator ? (
            <div className="h-px bg-gray-200 dark:bg-gray-700 my-1 mx-2" />
          ) : (
            <button
              onClick={(e) => handleItemClick(item, e)}
              disabled={item.disabled}
              className={`
                w-full flex items-center gap-3 px-4 py-2 text-left text-sm
                transition-colors relative
                ${item.disabled
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-blue-500/10 dark:hover:bg-blue-500/20 hover:text-blue-600 dark:hover:text-blue-400'
                }
              `}
            >
              {item.icon && <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>}
              <span className="flex-1">{item.label}</span>
              {item.submenu && (
                <span className="text-gray-400 dark:text-gray-500">›</span>
              )}

              {/* Submenu */}
              {item.submenu && submenuOpen === item.id && (
                <div
                  className="absolute left-full top-0 ml-1 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 py-2 min-w-[200px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {item.submenu.map((subitem, subindex) => (
                    <button
                      key={subitem.id || subindex}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (subitem.action) {
                          subitem.action();
                          onClose();
                        }
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-500/10 dark:hover:bg-blue-500/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {subitem.icon && <span className="w-4 h-4 flex-shrink-0">{subitem.icon}</span>}
                      <span>{subitem.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </button>
          )}
        </React.Fragment>
      ))}
    </motion.div>
  );
};

// Desktop Context Menu
interface DesktopContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: string) => void;
}

export const DesktopContextMenu: React.FC<DesktopContextMenuProps> = ({ x, y, onClose, onAction }) => {
  const items: ContextMenuItem[] = [
    {
      id: 'refresh',
      label: 'Refresh',
      icon: <RefreshCw className="w-4 h-4" />,
      action: () => onAction('refresh'),
    },
    { id: 'sep1', separator: true },
    {
      id: 'view',
      label: 'View',
      icon: <Monitor className="w-4 h-4" />,
      submenu: [
        {
          id: 'large-icons',
          label: 'Large Icons',
          action: () => onAction('view-large'),
        },
        {
          id: 'medium-icons',
          label: 'Medium Icons',
          action: () => onAction('view-medium'),
        },
        {
          id: 'small-icons',
          label: 'Small Icons',
          action: () => onAction('view-small'),
        },
      ],
    },
    {
      id: 'sort',
      label: 'Sort By',
      icon: <Grid3X3 className="w-4 h-4" />,
      submenu: [
        {
          id: 'sort-name',
          label: 'Name',
          action: () => onAction('sort-name'),
        },
        {
          id: 'sort-type',
          label: 'Type',
          action: () => onAction('sort-type'),
        },
        {
          id: 'sort-date',
          label: 'Date Modified',
          action: () => onAction('sort-date'),
        },
      ],
    },
    { id: 'sep2', separator: true },
    {
      id: 'personalize',
      label: 'Personalize',
      icon: <Palette className="w-4 h-4" />,
      action: () => onAction('personalize'),
    },
    {
      id: 'settings',
      label: 'Display Settings',
      icon: <Settings className="w-4 h-4" />,
      action: () => onAction('settings'),
    },
  ];

  return <CustomContextMenu x={x} y={y} onClose={onClose} items={items} />;
};

// Window Context Menu
interface WindowContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: string) => void;
  windowState: {
    minimized: boolean;
    maximized: boolean;
    focused: boolean;
  };
}

export const WindowContextMenu: React.FC<WindowContextMenuProps> = ({ x, y, onClose, onAction, windowState }) => {
  const items: ContextMenuItem[] = [
    {
      id: 'restore',
      label: windowState.maximized ? 'Restore' : 'Maximize',
      icon: <Maximize2 className="w-4 h-4" />,
      action: () => onAction('maximize'),
    },
    {
      id: 'minimize',
      label: 'Minimize',
      icon: <Monitor className="w-4 h-4" />,
      action: () => onAction('minimize'),
    },
    { id: 'sep1', separator: true },
    {
      id: 'close',
      label: 'Close',
      icon: <Trash2 className="w-4 h-4" />,
      action: () => onAction('close'),
    },
  ];

  return <CustomContextMenu x={x} y={y} onClose={onClose} items={items} />;
};

// Text Selection Context Menu
interface TextContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

export const TextContextMenu: React.FC<TextContextMenuProps> = ({ x, y, onClose }) => {
  const handleCopy = () => {
    document.execCommand('copy');
  };

  const handleCut = () => {
    document.execCommand('cut');
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      document.execCommand('insertText', false, text);
    } catch (err) {
      console.error('Paste failed:', err);
    }
  };

  const items: ContextMenuItem[] = [
    {
      id: 'cut',
      label: 'Cut',
      icon: <Scissors className="w-4 h-4" />,
      action: handleCut,
    },
    {
      id: 'copy',
      label: 'Copy',
      icon: <Copy className="w-4 h-4" />,
      action: handleCopy,
    },
    {
      id: 'paste',
      label: 'Paste',
      icon: <ClipboardPaste className="w-4 h-4" />,
      action: handlePaste,
    },
  ];

  return <CustomContextMenu x={x} y={y} onClose={onClose} items={items} />;
};
