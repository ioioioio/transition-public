import type { ReactNode } from 'react';

type SidePanelProps = {
    children?: ReactNode;
};

const SidePanel = ({ children }: SidePanelProps) => {
    return (
        <aside className="flex-1 border-border p-4 md:w-110 md:flex-none md:overflow-y-auto md:border-r-2 md:p-6">
            {children}
        </aside>
    );
};

export default SidePanel;
