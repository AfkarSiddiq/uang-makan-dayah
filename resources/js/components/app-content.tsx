import { SidebarInset } from '@/components/ui/sidebar';
import * as React from 'react';

interface AppContentProps extends React.ComponentProps<'div'> {
    variant?: 'header' | 'sidebar';
}

export function AppContent({ variant = 'header', children, ...props }: AppContentProps) {
    if (variant === 'sidebar') {
        return (
            <SidebarInset className="min-h-screen bg-gradient-to-br from-slate-50/80 via-emerald-50/20 to-amber-50/15 dark:from-zinc-950 dark:via-emerald-950/15 dark:to-zinc-950" {...props}>
                {children}
            </SidebarInset>
        );
    }

    return (
        <main className="mx-auto flex h-full min-h-screen w-full max-w-7xl flex-1 flex-col gap-4 rounded-xl bg-gradient-to-br from-slate-50/80 via-emerald-50/20 to-amber-50/15 dark:from-zinc-950 dark:via-emerald-950/15 dark:to-zinc-950 p-4 md:p-6" {...props}>
            {children}
        </main>
    );
}
