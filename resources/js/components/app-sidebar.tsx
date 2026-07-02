import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { AlarmCheck, Banknote, BookText, CalendarArrowUp, GraduationCap, History, LayoutGrid, Mars, School, Shield, Tags, Users, Venus } from 'lucide-react';
import AppLogo from './app-logo';

interface NavItemWithPermission extends NavItem {
    permission?: string;
    items?: { title: string; url: string; icon: any; permission?: string }[];
}

const mainNavItems: NavItemWithPermission[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
        permission: 'dashboard.view',
    },
    {
        title: 'Transaksi',
        url: '/payment',
        icon: Banknote,
        permission: 'pembayaran.view',
    },
    {
        title: 'Tagihan bulan',
        url: '/tuition-per-month',
        icon: CalendarArrowUp,
        permission: 'spp.view',
    },
    {
        title: 'Data Santri',
        url: '#',
        icon: BookText,
        items: [
            {
                title: 'Santriwan',
                url: '/santriwan',
                icon: Mars,
                permission: 'siswa.view',
            },
            {
                title: 'Santriwati',
                url: '/santriwati',
                icon: Venus,
                permission: 'siswa.view',
            },
        ],
    },
    {
        title: 'Tunggakan',
        url: '/tuition-arrears',
        icon: AlarmCheck,
        permission: 'spp.tunggakan',
    },
    {
        title: 'Riwayat',
        url: '/payment-history',
        icon: History,
        permission: 'pembayaran.view',
    },
    {
        title: 'Masukkan siswa Baru',
        url: '/siswa',
        icon: School,
        permission: 'siswa.view',
    },
    {
        title: 'Data Alumni',
        url: '/alumni',
        icon: GraduationCap,
        permission: 'siswa.view',
    },
    {
        title: 'Kategori',
        url: '/category',
        icon: Tags,
        permission: 'kategori.view',
    },
    {
        title: 'Pengguna',
        url: '/users',
        icon: Users,
        permission: 'users.view',
    },
    {
        title: 'Role & Izin',
        url: '/role',
        icon: Shield,
        permission: 'users.roles',
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const permissions = (usePage().props.auth as { permissions?: string[] } | undefined)?.permissions ?? [];

    const filterNavItems = (items: NavItemWithPermission[]): NavItem[] => {
        return items
            .filter((item) => {
                if (!item.permission) return true;
                return permissions.includes(item.permission);
            })
            .map((item) => ({
                ...item,
                items: item.items
                    ? item.items.filter((sub) => {
                        if (!sub.permission) return true;
                        return permissions.includes(sub.permission);
                    })
                    : undefined,
            }))
            .filter((item) => !item.items || item.items.length > 0);
    };

    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r border-emerald-900/10 shadow-sm dark:border-emerald-900/20">
            <SidebarHeader className="border-b border-emerald-900/10 bg-gradient-to-b from-emerald-50/70 via-emerald-50/30 to-transparent pb-3 pt-3 dark:border-emerald-900/20 dark:from-emerald-950/40">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="rounded-xl border border-transparent p-2 transition-all duration-300 hover:border-emerald-300/50 hover:bg-emerald-500/10 hover:shadow-xs dark:hover:border-emerald-700/50">
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-1 py-2">
                <NavMain items={filterNavItems(mainNavItems)} />
            </SidebarContent>

            <SidebarFooter className="border-t border-emerald-900/10 bg-gradient-to-t from-emerald-50/40 to-transparent p-2 dark:border-emerald-900/20 dark:from-emerald-950/20">
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}