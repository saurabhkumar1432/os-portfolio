import { createRouter, createRootRoute, createRoute, createMemoryHistory } from '@tanstack/react-router';
import type { AppId } from '../types';
import App from '../App';

// Create the root route with App component
const rootRoute = createRootRoute({
  component: App,
});

// Desktop route (default)
const desktopRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => null, // The DesktopOS component handles rendering
});

// App route for opening specific applications
const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/apps/$appId',
  component: () => null, // Window manager handles app rendering
  validateSearch: (search: Record<string, unknown>) => ({
    windowId: search.windowId as string | undefined,
    x: search.x ? Number(search.x) : undefined,
    y: search.y ? Number(search.y) : undefined,
    w: search.w ? Number(search.w) : undefined,
    h: search.h ? Number(search.h) : undefined,
    maximized: search.maximized === 'true',
    minimized: search.minimized === 'true',
  }),
});

// Project detail route for deep linking to specific projects
const projectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects/$slug',
  component: () => null, // Projects app handles project rendering
  validateSearch: (search: Record<string, unknown>) => ({
    windowId: search.windowId as string | undefined,
    x: search.x ? Number(search.x) : undefined,
    y: search.y ? Number(search.y) : undefined,
    w: search.w ? Number(search.w) : undefined,
    h: search.h ? Number(search.h) : undefined,
  }),
});

// File explorer route for deep linking to specific paths
const fileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/files',
  component: () => null,
  validateSearch: (search: Record<string, unknown>) => ({
    path: search.path as string | undefined,
    windowId: search.windowId as string | undefined,
    x: search.x ? Number(search.x) : undefined,
    y: search.y ? Number(search.y) : undefined,
    w: search.w ? Number(search.w) : undefined,
    h: search.h ? Number(search.h) : undefined,
  }),
});

// Create the route tree
const routeTree = rootRoute.addChildren([
  desktopRoute,
  appRoute,
  projectRoute,
  fileRoute,
]);

// Create memory history for SSR compatibility
const memoryHistory = createMemoryHistory({
  initialEntries: ['/'],
});

// Create and export the router
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  history: memoryHistory,
});

// Infer the type of our router for TypeScript
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Route parameter types for type safety
export interface AppRouteParams {
  appId: AppId;
}

export interface ProjectRouteParams {
  slug: string;
}

export interface AppRouteSearch {
  windowId?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  maximized?: boolean;
  minimized?: boolean;
}

export interface ProjectRouteSearch {
  windowId?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}

export interface FileRouteSearch {
  path?: string;
  windowId?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}