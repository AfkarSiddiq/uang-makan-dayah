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
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filterNavItems(mainNavItems)} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}