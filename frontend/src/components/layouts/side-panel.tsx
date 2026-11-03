import type { ReactNode } from 'react';

import LanguageToggle from '@/components/language/language-toggle';
import ThemeToggle from '@/components/theme/theme-toggle';
import { cn } from '@/lib/utils';

interface SidePanelProps {
    children?: ReactNode;
}

const SidePanel = ({ children }: SidePanelProps) => {
    return (
        <aside
            className={cn(
                'flex flex-1 flex-col',
                'md:absolute md:top-4 md:left-4 md:z-10 md:max-h-[calc(100dvh-2rem)] md:w-110 md:overflow-y-auto',
                // A border, with a lighter outline around it, and a deep shadow
                'md:rounded-xl md:border md:border-border md:ring-1 md:ring-foreground/15 md:shadow-[0_16px_40px_rgb(0_0_0/0.2)] dark:md:ring-foreground/45 dark:md:shadow-[0_16px_40px_rgb(0_0_0/0.65)]',
                // The map shows faintly through it
                'md:bg-background/94 md:backdrop-blur-sm',
            )}
        >
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {children}
            </div>
            <div className="flex p-2">
                <ThemeToggle />
                <LanguageToggle />
            </div>
        </aside>
    );
};

export default SidePanel;
