import TripComparison from './pages/TripComparison';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <TripComparison />
        </QueryClientProvider>
    );
}

export default App;
