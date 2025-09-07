import { Suspense, type ComponentType } from 'react';
import { AppLoadingSpinner } from './ui/AppLoadingSpinner';
import type { AppProps } from '../types';

interface AppLoaderProps extends AppProps {
  appName: string;
  component: ComponentType<AppProps>;
}

/**
 * Higher-order component that wraps lazy-loaded apps with loading states
 * and error boundaries for better user experience
 */
export function AppLoader({ appName, component: Component, ...props }: AppLoaderProps) {
  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center h-full min-h-[200px]">
          <AppLoadingSpinner appName={appName} size="md" />
        </div>
      }
    >
      <Component {...props} />
    </Suspense>
  );
}

export default AppLoader;