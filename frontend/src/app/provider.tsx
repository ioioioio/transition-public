import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { ThemeProvider } from '@/components/theme/theme-provider';
import '@/lib/i18n'; // Sets up i18next

const queryClient = new QueryClient();

type AppProviderProps = {
    children: ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
    return (
        <ThemeProvider>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </ThemeProvider>
    );
};
