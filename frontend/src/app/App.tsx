import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AppRouter } from '@/app/router';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

const queryClient = new QueryClient();

function App() {
    return (
        <ThemeProvider defaultTheme="dark">
            <QueryClientProvider client={queryClient}>
                <AppRouter />
            </QueryClientProvider>
        </ThemeProvider>
    );
}

export default App;
