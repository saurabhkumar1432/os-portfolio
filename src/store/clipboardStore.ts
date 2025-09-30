import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ClipboardItem {
  id: string;
  content: string;
  type: 'text' | 'code' | 'url' | 'email';
  timestamp: Date;
  pinned: boolean;
  preview: string;
  tags?: string[];
}

interface ClipboardStore {
  items: ClipboardItem[];
  maxItems: number;
  searchQuery: string;
  
  // Actions
  addItem: (content: string, type?: ClipboardItem['type']) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
  togglePin: (id: string) => void;
  copyToClipboard: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  getFilteredItems: () => ClipboardItem[];
}

export const useClipboardStore = create<ClipboardStore>()(
  persist(
    (set, get) => ({
      items: [],
      maxItems: 50,
      searchQuery: '',

      addItem: (content, type = 'text') => {
        const id = `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const timestamp = new Date();
        
        // Detect content type if not specified
        let detectedType = type;
        if (type === 'text') {
          if (content.match(/^https?:\/\//)) {
            detectedType = 'url';
          } else if (content.match(/^[\w.-]+@[\w.-]+\.\w+$/)) {
            detectedType = 'email';
          } else if (content.match(/^(const|let|var|function|class|import|export|if|for|while)/)) {
            detectedType = 'code';
          }
        }

        // Create preview (first 100 chars)
        const preview = content.length > 100 
          ? content.substring(0, 100) + '...' 
          : content;

        const newItem: ClipboardItem = {
          id,
          content,
          type: detectedType,
          timestamp,
          pinned: false,
          preview,
        };

        set((state) => {
          // Remove duplicates
          const filteredItems = state.items.filter(item => item.content !== content);
          
          // Add new item at the beginning
          const updatedItems = [newItem, ...filteredItems];
          
          // Keep only max items (but keep all pinned items)
          const pinnedItems = updatedItems.filter(item => item.pinned);
          const unpinnedItems = updatedItems.filter(item => !item.pinned);
          const limitedUnpinned = unpinnedItems.slice(0, state.maxItems - pinnedItems.length);
          
          return {
            items: [...pinnedItems, ...limitedUnpinned],
          };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== id),
        }));
      },

      clearAll: () => {
        set((state) => ({
          // Keep only pinned items
          items: state.items.filter(item => item.pinned),
        }));
      },

      togglePin: (id) => {
        set((state) => ({
          items: state.items.map(item =>
            item.id === id ? { ...item, pinned: !item.pinned } : item
          ),
        }));
      },

      copyToClipboard: async (id) => {
        const item = get().items.find(i => i.id === id);
        if (item && navigator.clipboard) {
          try {
            await navigator.clipboard.writeText(item.content);
            // Move item to top
            set((state) => ({
              items: [
                item,
                ...state.items.filter(i => i.id !== id),
              ],
            }));
          } catch (error) {
            console.error('Failed to copy to clipboard:', error);
          }
        }
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      getFilteredItems: () => {
        const { items, searchQuery } = get();
        if (!searchQuery) return items;
        
        const query = searchQuery.toLowerCase();
        return items.filter(item =>
          item.content.toLowerCase().includes(query) ||
          item.type.toLowerCase().includes(query) ||
          item.tags?.some(tag => tag.toLowerCase().includes(query))
        );
      },
    }),
    {
      name: 'clipboard-storage',
      partialize: (state) => ({
        items: state.items,
        maxItems: state.maxItems,
      }),
    }
  )
);
