import type { ReactNode } from 'react';

import ThemeToggle from '@/components/inputs/ThemeToggle';

type SidePanelProps = {
    children?: ReactNode;
};

const SidePanel = ({ children }: SidePanelProps) => {
    return (
        <aside className="flex flex-1 flex-col border-border md:w-110 md:flex-none md:overflow-y-auto md:border-r-2">
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {children}
            </div>
            <div className="p-2">
                <ThemeToggle />
            </div>
        </aside>
    );
};

export default SidePanel;
