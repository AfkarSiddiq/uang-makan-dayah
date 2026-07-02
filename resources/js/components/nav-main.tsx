import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from "lucide-react"

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    return (
        <SidebarGroup className="px-2 py-1">
            <SidebarGroupLabel className="text-xs font-semibold tracking-wider text-emerald-800/70 uppercase dark:text-emerald-400/70">Menu Utama</SidebarGroupLabel>
            <SidebarMenu className="space-y-1">
                {items.map((item) => {
                    const isMainActive = item.url !== '#' && (page.url === item.url || page.url.startsWith(item.url + '/'));
                    const isSubActiveGroup = item.items?.some(sub => sub.url !== '#' && (page.url === sub.url || page.url.startsWith(sub.url + '/')));

                    return item.items && item.items.length > 0 ? (
                        // JIKA ADA SUB-MENU (Contoh: Data Santri)
                        <Collapsible key={item.title} asChild defaultOpen={item.isActive || isSubActiveGroup} className="group/collapsible">
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton 
                                        tooltip={item.title}
                                        isActive={isSubActiveGroup}
                                        className={isSubActiveGroup
                                            ? 'bg-emerald-100/70 font-semibold text-emerald-900 border-l-4 border-amber-500 shadow-xs dark:bg-emerald-950/80 dark:text-emerald-200'
                                            : 'transition-all duration-200 hover:bg-emerald-500/10 hover:text-emerald-900 dark:hover:text-emerald-300'}
                                    >
                                        {item.icon && <item.icon className={isSubActiveGroup ? 'text-emerald-700 dark:text-emerald-400' : ''} />}
                                        <span>{item.title}</span>
                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub className="border-l border-emerald-900/15 pl-3 mt-1 space-y-0.5 dark:border-emerald-800/30">
                                        {item.items?.map((subItem) => {
                                            const isSubActive = subItem.url !== '#' && (page.url === subItem.url || page.url.startsWith(subItem.url + '/'));
                                            return (
                                                <SidebarMenuSubItem key={subItem.title}>
                                                    <SidebarMenuSubButton 
                                                        asChild 
                                                        isActive={isSubActive}
                                                        className={isSubActive
                                                            ? 'bg-emerald-600 font-semibold text-white shadow-xs rounded-lg hover:bg-emerald-700 hover:text-white dark:bg-emerald-700'
                                                            : 'transition-all duration-200 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-900 dark:hover:text-emerald-300'}
                                                    >
                                                        <Link href={subItem.url}>
                                                            <span>{subItem.title}</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            );
                                        })}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    ) : (
                        // JIKA TIDAK ADA SUB-MENU (Contoh: Dashboard, Transaksi)
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton 
                                asChild 
                                tooltip={item.title} 
                                isActive={isMainActive}
                                className={isMainActive
                                    ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 font-bold text-white shadow-md shadow-emerald-900/20 hover:bg-emerald-800 hover:text-white dark:from-emerald-700 dark:to-emerald-600'
                                    : 'transition-all duration-200 hover:bg-emerald-500/10 hover:text-emerald-900 hover:translate-x-0.5 dark:hover:text-emerald-300'}
                            >
                                <Link href={item.url}>
                                    {item.icon && <item.icon className={isMainActive ? 'text-amber-300' : ''} />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
