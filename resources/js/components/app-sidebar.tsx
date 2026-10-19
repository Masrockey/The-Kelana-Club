import { Link } from '@inertiajs/react';
import {
    Activity,
    Compass,
    FileText,
    FolderTree,
    Globe,
    Image as ImageIcon,
    LayoutGrid,
    MessageSquare,
    PenSquare,
    Search,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

const contentNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'All Posts',
        href: '/admin/posts',
        icon: FileText,
    },
    {
        title: 'Write Post',
        href: '/admin/posts/create',
        icon: PenSquare,
    },
    {
        title: 'Media Library',
        href: '/admin/media',
        icon: ImageIcon,
    },
    {
        title: 'Categories',
        href: '/admin/categories',
        icon: FolderTree,
    },
    {
        title: 'Comments',
        href: '/admin/comments',
        icon: MessageSquare,
    },
];

const analyticsNavItems: NavItem[] = [
    {
        title: 'Traffic & Visitors',
        href: '/admin/analytics/visitors',
        icon: Activity,
    },
    {
        title: 'GEO Analytics',
        href: '/admin/analytics/geo',
        icon: Globe,
    },
    {
        title: 'SEO & Crawlers',
        href: '/admin/analytics/seo',
        icon: Search,
    },
];

const publicNavItems: NavItem[] = [
    {
        title: 'Live Journal',
        href: '/',
        icon: Compass,
    },
];

export function AppSidebar() {
    const { isCurrentUrl } = useCurrentUrl();

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
                <NavMain items={contentNavItems} />

                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>Intelligence & SEO</SidebarGroupLabel>
                    <SidebarMenu>
                        {analyticsNavItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl(item.href)}
                                    tooltip={{ children: item.title }}
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>

                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>Public</SidebarGroupLabel>
                    <SidebarMenu>
                        {publicNavItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={{ children: item.title }}
                                >
                                    <Link href={item.href} target="_blank">
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
