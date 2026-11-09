import { CaretLeftIcon } from '@phosphor-icons/react';
import { useId, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import LanguageToggle from '@/components/language/language-toggle';
import ThemeToggle from '@/components/theme/theme-toggle';
import { useIsPhone } from '@/hooks/use-is-phone';
import { cn } from '@/lib/utils';

interface SidePanelProps {
    children?: ReactNode;
}

const SidePanel = (props: SidePanelProps) => {
    const { children } = props;
    const { t } = useTranslation();
    const panelId = useId();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const isPhone = useIsPhone();
    const isHidden = isCollapsed && !isPhone;

    return (
        <div
            className={cn(
                `
                    flex flex-1 flex-col
                    motion-reduce:transition-none
                    md:absolute md:top-3 md:left-3 md:z-10
                    md:transition-transform md:duration-200
                    md:ease-[cubic-bezier(0.2,0,0,1)]
                `,
                isHidden && 'md:-translate-x-[calc(100%+0.75rem+1px)]',
            )}
        >
            <aside
                id={panelId}
                inert={isHidden}
                className="
                    relative z-10 flex flex-1 flex-col
                    md:max-h-[calc(100dvh-1.5rem)] md:w-110 md:overflow-y-auto
                    md:rounded-xl md:border md:border-floating-border
                    md:bg-background/94 md:ring-1 md:ring-floating-outline
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
            <button
                type="button"
                aria-controls={panelId}
                aria-expanded={!isHidden}
                aria-label={
                    isHidden ? t('sidePanel.show') : t('sidePanel.hide')
                }
                onClick={() => {
                    setIsCollapsed(!isCollapsed);
                }}
                className="
                    absolute top-3 left-[calc(100%-0.5rem)] hidden h-12 w-8
                    cursor-pointer items-center justify-center rounded-e-lg
                    border border-floating-border bg-card ps-2 text-primary
                    ring-1 ring-floating-outline outline-none
                    hover:bg-muted
                    focus-visible:ring-3 focus-visible:ring-ring/50
                    md:flex
                "
            >
                <CaretLeftIcon
                    aria-hidden
                    className={cn(
                        `
                            size-4 transition-transform duration-200
                            motion-reduce:transition-none
                        `,
                        isHidden && 'rotate-180',
                    )}
                />
            </button>
        </div>
    );
};

export default SidePanel;
