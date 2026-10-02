import type { ReactNode } from 'react';

import LanguageToggle from '@/components/language/language-toggle';
import ThemeToggle from '@/components/theme/theme-toggle';

type SidePanelProps = {
    children?: ReactNode;
};

const SidePanel = ({ children }: SidePanelProps) => {
    return (
        <aside className="flex flex-1 flex-col border-border md:w-110 md:flex-none md:overflow-y-auto md:border-r-2">
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
