import { SidebarInset } from '@/components/ui/sidebar';
import * as React from 'react';

interface AppContentProps extends React.ComponentProps<'div'> {
    variant?: 'header' | 'sidebar';
}

export function AppContent({ variant = 'header', children, ...props }: AppContentProps) {
    if (variant === 'sidebar') {
        return (
            <SidebarInset className="min-h-screen bg-background dark:bg-background" {...props}>
                {children}
            </SidebarInset>
        );
    }

    return (
        <main className="mx-auto flex h-full min-h-screen w-full max-w-7xl flex-1 flex-col gap-4 rounded-xl bg-background dark:bg-background p-4 md:p-6" {...props}>
            {children}
        </main>
    );
}
