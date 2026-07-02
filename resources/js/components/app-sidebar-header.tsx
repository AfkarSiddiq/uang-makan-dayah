import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Sparkles } from 'lucide-react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    return (
        <header className="sticky top-0 z-30 flex flex-col border-b border-emerald-900/10 bg-white/85 shadow-2xs backdrop-blur-md transition-[width,height] ease-linear dark:border-emerald-800/20 dark:bg-zinc-900/85">
            {/* Top decorative green & gold strip */}
            <div className="h-0.5 w-full bg-gradient-to-r from-emerald-700 via-amber-400 to-emerald-700" />
            <div className="flex h-15 shrink-0 items-center justify-between px-6 md:px-4">
                <div className="flex items-center gap-3">
                    <SidebarTrigger className="-ml-1 rounded-lg border border-emerald-200/60 bg-emerald-50/50 text-emerald-800 hover:bg-emerald-100/80 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300" />
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
                <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/70 px-3 py-1 text-xs font-semibold text-emerald-800 shadow-2xs dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                    <span>Sistem Keuangan Dayah</span>
                </div>
            </div>
        </header>
    );
}
