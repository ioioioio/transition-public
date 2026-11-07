import type { ReactNode } from 'react';

import LanguageToggle from '@/components/language/language-toggle';
import ThemeToggle from '@/components/theme/theme-toggle';

interface SidePanelProps {
    children?: ReactNode;
}

const SidePanel = ({ children }: SidePanelProps) => {
    return (
        <aside
            className="
                flex flex-1 flex-col
                md:absolute md:top-3 md:left-3 md:z-10
                md:max-h-[calc(100dvh-1.5rem)] md:w-110 md:overflow-y-auto
                md:rounded-xl md:border md:border-border md:bg-background/94
                md:shadow-[0_16px_40px_rgb(0_0_0/0.2)] md:ring-1
                md:ring-foreground/15 md:backdrop-blur-sm
                dark:md:shadow-[0_16px_40px_rgb(0_0_0/0.65)]
                dark:md:ring-foreground/45
            "
        >
            <div
                className="
                    flex flex-1 flex-col gap-6 p-4
                    md:gap-4
                "
            >
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
