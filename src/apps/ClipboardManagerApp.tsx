import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clipboard,
  Search,
  Pin,
  Copy,
  Trash2,
  Check,
  X,
  Code,
  Link,
  Mail,
  FileText,
  Settings,
  Clock,
} from 'lucide-react';
import { useClipboardStore } from '../store/clipboardStore';
import type { ClipboardItem } from '../store/clipboardStore';
import { clipboardService } from '../services/clipboardService';
import { format } from 'date-fns';

export const ClipboardManagerApp: React.FC = () => {
  const {
    items,
    searchQuery,
    setSearchQuery,
    togglePin,
    removeItem,
    clearAll,
    copyToClipboard,
    getFilteredItems,
  } = useClipboardStore();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | ClipboardItem['type']>('all');
  const [showSettings, setShowSettings] = useState(false);

  const filteredItems = getFilteredItems();
  const typeFilteredItems = selectedType === 'all'
    ? filteredItems
    : filteredItems.filter(item => item.type === selectedType);

  // Start/stop monitoring on mount/unmount
  useEffect(() => {
    if (isMonitoring) {
      clipboardService.startMonitoring();
    } else {
      clipboardService.stopMonitoring();
    }

    return () => {
      clipboardService.stopMonitoring();
    };
  }, [isMonitoring]);

  const handleCopy = async (id: string) => {
    await copyToClipboard(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getTypeIcon = (type: ClipboardItem['type']) => {
    const iconClass = 'w-4 h-4';
    switch (type) {
      case 'code':
        return <Code className={`${iconClass} text-purple-500`} />;
      case 'url':
        return <Link className={`${iconClass} text-blue-500`} />;
      case 'email':
        return <Mail className={`${iconClass} text-green-500`} />;
      default:
        return <FileText className={`${iconClass} text-gray-500`} />;
    }
  };

  const getTypeCount = (type: ClipboardItem['type']) => {
    return filteredItems.filter(item => item.type === type).length;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clipboard className="w-5 h-5 text-blue-500" />
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Clipboard Manager
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Monitoring Toggle */}
            <button
              onClick={() => setIsMonitoring(!isMonitoring)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isMonitoring
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {isMonitoring ? 'Monitoring' : 'Paused'}
            </button>

            {/* Settings */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search clipboard history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          )}
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedType === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All ({filteredItems.length})
          </button>
          <button
            onClick={() => setSelectedType('text')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedType === 'text'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <FileText className="w-3 h-3" />
            Text ({getTypeCount('text')})
          </button>
          <button
            onClick={() => setSelectedType('code')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedType === 'code'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Code className="w-3 h-3" />
            Code ({getTypeCount('code')})
          </button>
          <button
            onClick={() => setSelectedType('url')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedType === 'url'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Link className="w-3 h-3" />
            URLs ({getTypeCount('url')})
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex-shrink-0 p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Tip:</strong> Press <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">Ctrl</kbd> + <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">Shift</kbd> + <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">V</kbd> for quick access
              </div>
              <button
                onClick={clearAll}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Clear All
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clipboard Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {typeFilteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Clipboard className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
              {searchQuery ? 'No matching items' : 'No clipboard history yet'}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              {searchQuery 
                ? 'Try a different search term'
                : 'Start copying to build your history'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {typeFilteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className={`group relative p-3 bg-white dark:bg-gray-800 rounded-lg border transition-colors ${
                    item.pinned
                      ? 'border-blue-500 ring-2 ring-blue-500/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {/* Item Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(item.type)}
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 capitalize">
                        {item.type}
                      </span>
                      {item.pinned && (
                        <Pin className="w-3 h-3 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {format(new Date(item.timestamp), 'MMM d, h:mm a')}
                    </div>
                  </div>

                  {/* Item Content */}
                  <div className={`text-sm mb-3 ${
                    item.type === 'code'
                      ? 'font-mono bg-gray-100 dark:bg-gray-900 p-2 rounded'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {item.type === 'url' ? (
                      <a 
                        href={item.content} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline break-all"
                      >
                        {item.preview}
                      </a>
                    ) : (
                      <div className="break-words whitespace-pre-wrap">{item.preview}</div>
                    )}
                  </div>

                  {/* Item Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(item.id)}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3 h-3" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => togglePin(item.id)}
                      className={`p-1 rounded transition-colors ${
                        item.pinned
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                      title={item.pinned ? 'Unpin' : 'Pin'}
                    >
                      <Pin className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="flex-shrink-0 p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{items.length} total items</span>
          <span>{items.filter(i => i.pinned).length} pinned</span>
          <span>{typeFilteredItems.length} shown</span>
        </div>
      </div>
    </div>
  );
};

export default ClipboardManagerApp;
