import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StartMenuState, AppId } from '../types';
import { searchService } from '../services/searchService';

interface StartMenuActions {
  setIsOpen: (isOpen: boolean) => void;
  toggleStartMenu: () => void;
  setSearchQuery: (query: string) => void;
  performSearch: (query: string) => void;
  clearSearch: () => void;
  setSelectedIndex: (index: number) => void;
  selectNext: () => void;
  selectPrevious: () => void;
  executeSelected: () => void;
  addToPinned: (appId: AppId) => void;
  removeFromPinned: (appId: AppId) => void;
  addToRecent: (appId: AppId) => void;
  clearRecent: () => void;
}

type StartMenuStore = StartMenuState & StartMenuActions;

export const useStartMenuStore = create<StartMenuStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isOpen: false,
      searchQuery: '',
      searchResults: [],
      selectedIndex: -1,
      pinnedApps: ['projects', 'file-explorer', 'terminal', 'about'],
      recentApps: [],

      // Actions
      setIsOpen: (isOpen: boolean) => {
        set({ isOpen });
        if (!isOpen) {
          // Clear search when closing
          set({ searchQuery: '', searchResults: [], selectedIndex: -1 });
        }
      },

      toggleStartMenu: () => {
        const { isOpen } = get();
        get().setIsOpen(!isOpen);
      },

      setSearchQuery: (searchQuery: string) => {
        set({ searchQuery });
        get().performSearch(searchQuery);
      },

      performSearch: (query: string) => {
        if (!query.trim()) {
          set({ searchResults: [], selectedIndex: -1 });
          return;
        }

        const results = searchService.search(query);
        set({ 
          searchResults: results,
          selectedIndex: results.length > 0 ? 0 : -1
        });
      },

      clearSearch: () => {
        set({ searchQuery: '', searchResults: [], selectedIndex: -1 });
      },

      setSelectedIndex: (selectedIndex: number) => {
        const { searchResults } = get();
        if (selectedIndex >= -1 && selectedIndex < searchResults.length) {
          set({ selectedIndex });
        }
      },

      selectNext: () => {
        const { selectedIndex, searchResults } = get();
        const nextIndex = selectedIndex < searchResults.length - 1 ? selectedIndex + 1 : 0;
        set({ selectedIndex: nextIndex });
      },

      selectPrevious: () => {
        const { selectedIndex, searchResults } = get();
        const prevIndex = selectedIndex > 0 ? selectedIndex - 1 : searchResults.length - 1;
        set({ selectedIndex: prevIndex });
      },

      executeSelected: () => {
        const { selectedIndex, searchResults } = get();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          const selectedItem = searchResults[selectedIndex];
          selectedItem.action();
          
          // Add to recent apps if it's an app
          if (selectedItem.category === 'app') {
            get().addToRecent(selectedItem.id as AppId);
          }
          
          // Close start menu
          get().setIsOpen(false);
        }
      },

      addToPinned: (appId: AppId) => {
        const { pinnedApps } = get();
        if (!pinnedApps.includes(appId)) {
          set({ pinnedApps: [...pinnedApps, appId] });
        }
      },

      removeFromPinned: (appId: AppId) => {
        const { pinnedApps } = get();
        set({ pinnedApps: pinnedApps.filter(id => id !== appId) });
      },

      addToRecent: (appId: AppId) => {
        const { recentApps } = get();
        const updatedRecent = [appId, ...recentApps.filter(id => id !== appId)].slice(0, 6);
        set({ recentApps: updatedRecent });
      },

      clearRecent: () => {
        set({ recentApps: [] });
      }
    }),
    {
      name: 'start-menu-storage',
      partialize: (state) => ({
        pinnedApps: state.pinnedApps,
        recentApps: state.recentApps
      })
    }
  )
);