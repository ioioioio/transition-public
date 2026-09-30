import { createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from '@/app/routeTree.gen';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

export const AppRouter = () => {
    return <RouterProvider router={router} />;
};
