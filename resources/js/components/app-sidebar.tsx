import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { AlarmCheck, Banknote, BanknoteIcon, BookCheck, BookOpen, BookText, Folder, History, LayoutGrid, Mars, Venus } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Pembayaran',
        url: '/payment',
        icon: Banknote,
    },
    {
        title: 'Data Uang makan',
        url: '#', // Gunakan '#' karena ini akan bertindak sebagai tombol pembuka dropdown
        icon: BookText, // Contoh mengganti icon
        isActive: false, // (Opsional) jika true, menu akan terbuka secara default
        items: [
            {
                title: 'Santriwan',
                url: '/santriwan',
                icon: Mars,
            },
            {
                title: 'Santriwati',
                url: '/santriwati',
                icon: Venus,
            },
        ],
    },
    {
        title: 'Tunggakan',
        url: '/tuition-arrears',
        icon: AlarmCheck,
    },
    {
        title: 'Riwayat Pembayaran',
        url: '/payment-history',
        icon: History,
    },
];

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     url: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
    // {
    //     title: 'Documentation',
    //     url: 'https://laravel.com/docs/starter-kits',
    //     icon: BookOpen,
    // },
];

export function AppSidebar() {
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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
