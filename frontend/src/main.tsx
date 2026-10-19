import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@/index.css';
import App from '@/app/app';

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error('Missing #root element in the HTML document.');
}

createRoot(rootElement).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
