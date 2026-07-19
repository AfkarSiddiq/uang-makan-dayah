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

export function NavMain({ items = [], title = "Menu Utama" }: { items: NavItem[], title?: string }) {
    const page = usePage();
    return (
        <SidebarGroup className="px-2 py-1">
            <SidebarGroupLabel className="text-xs font-semibold tracking-wider text-sidebar-foreground/70 uppercase">{title}</SidebarGroupLabel>
            <SidebarMenu className="space-y-1">
                {items.map((item) => {
                    const isMainActive = item.url !== '#' && (page.url === item.url || page.url.startsWith(item.url + '/'));
                    const isSubActiveGroup = item.items?.some(sub => sub.url !== '#' && (page.url === sub.url || page.url.startsWith(sub.url + '/')));

                    return item.items && item.items.length > 0 ? (
                        // JIKA ADA SUB-MENU (Contoh: Data Santri -> Santriwan / Santriwati)
                        <Collapsible key={item.title} asChild defaultOpen={item.isActive || isSubActiveGroup} className="group/collapsible">
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        isActive={false}
                                        className={isSubActiveGroup
                                            ? 'bg-sidebar-primary/20 font-medium text-sidebar-primary-foreground shadow-xs'
                                            : 'transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}
                                    >
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub className="border-l border-sidebar-border/30 pl-3 mt-1 space-y-0.5">
                                        {item.items?.map((subItem) => {
                                            const isSubActive = subItem.url !== '#' && (page.url === subItem.url || page.url.startsWith(subItem.url + '/'));
                                            return (
                                                <SidebarMenuSubItem key={subItem.title}>
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={isSubActive}
                                                        className={isSubActive
                                                            ? 'bg-sidebar-primary/30 font-semibold text-sidebar-primary-foreground shadow-xs rounded-lg'
                                                            : 'transition-all duration-200 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}
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
                        // JIKA TIDAK ADA SUB-MENU (Contoh: Dashboard, Transaksi, Tagihan bulan)
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                isActive={isMainActive}
                                className={isMainActive
                                    ? 'bg-sidebar-primary font-bold text-sidebar-primary-foreground shadow-md hover:bg-sidebar-primary/90'
                                    : 'transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-0.5'}
                            >
                                <Link href={item.url}>
                                    {item.icon && <item.icon />}
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
