import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { ThemeProvider } from '@/components/theme/ThemeProvider';

const queryClient = new QueryClient();

type AppProviderProps = {
    children: ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
    return (
        <ThemeProvider defaultTheme="dark">
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </ThemeProvider>
    );
};
