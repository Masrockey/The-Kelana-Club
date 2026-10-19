import { Head, router } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    ChevronDown,
    ChevronUp,
    CornerDownRight,
    ExternalLink,
    FileText,
    FolderTree,
    GripVertical,
    Link as LinkIcon,
    Menu as MenuIcon,
    Plus,
    RefreshCw,
    Save,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConfirmDialog from '@/components/confirm-dialog';

interface MenuItemData {
    id?: number | string;
    title: string;
    url: string;
    target: string;
    type: string;
    type_id?: number | null;
    order: number;
}

interface CategoryOption {
    id: number;
    name: string;
    slug: string;
}

interface PostOption {
    id: number;
    title: string;
    slug: string;
}

interface MenuData {
    id: number;
    name: string;
    location: string;
}

interface Props {
    menu: MenuData;
    items: MenuItemData[];
    categories: CategoryOption[];
    posts: PostOption[];
}

export default function MenusIndex({ menu, items: initialItems, categories, posts }: Props) {
    const [menuName, setMenuName] = useState(menu.name || 'Header Primary Navigation');
    const [menuItems, setMenuItems] = useState<MenuItemData[]>(
        initialItems.length > 0
            ? initialItems
            : [
                  { id: 't1', title: 'Home', url: '/', target: '_self', type: 'custom', order: 1 },
                  { id: 't2', title: 'Destinations', url: '#popular-categories', target: '_self', type: 'custom', order: 2 },
                  { id: 't3', title: 'Route Guides', url: '#articles-feed', target: '_self', type: 'custom', order: 3 },
                  { id: 't4', title: 'Stories', url: '#articles-feed', target: '_self', type: 'custom', order: 4 },
                  { id: 't5', title: 'About Us', url: '#about-club', target: '_self', type: 'custom', order: 5 },
              ]
    );

    // Expand state for each item (by id or index)
    const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

    // Left Panel Form States
    const [customUrl, setCustomUrl] = useState('https://');
    const [customTitle, setCustomTitle] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [selectedPosts, setSelectedPosts] = useState<number[]>([]);

    const [saving, setSaving] = useState(false);
    const [confirmResetOpen, setConfirmResetOpen] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    function toggleExpand(key: string) {
        setExpandedIds((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    }

    // Add Custom Link
    function addCustomLink(e: React.FormEvent) {
        e.preventDefault();
        if (!customTitle.trim() || !customUrl.trim()) return;

        const newItem: MenuItemData = {
            id: `new_${Date.now()}_${Math.random()}`,
            title: customTitle.trim(),
            url: customUrl.trim(),
            target: '_self',
            type: 'custom',
            order: menuItems.length + 1,
        };

        setMenuItems((prev) => [...prev, newItem]);
        setCustomTitle('');
        setCustomUrl('https://');
    }

    // Add Categories to Menu
    function addCategoriesToMenu() {
        if (selectedCategories.length === 0) return;

        const newItems: MenuItemData[] = selectedCategories.map((catId, idx) => {
            const cat = categories.find((c) => c.id === catId);
            return {
                id: `cat_${Date.now()}_${idx}`,
                title: cat ? cat.name : 'Category',
                url: `/category/${cat ? cat.slug : ''}`,
                target: '_self',
                type: 'category',
                type_id: catId,
                order: menuItems.length + idx + 1,
            };
        });

        setMenuItems((prev) => [...prev, ...newItems]);
        setSelectedCategories([]);
    }

    // Add Posts to Menu
    function addPostsToMenu() {
        if (selectedPosts.length === 0) return;

        const newItems: MenuItemData[] = selectedPosts.map((postId, idx) => {
            const post = posts.find((p) => p.id === postId);
            return {
                id: `post_${Date.now()}_${idx}`,
                title: post ? post.title : 'Article',
                url: `/article/${post ? post.slug : ''}`,
                target: '_self',
                type: 'post',
                type_id: postId,
                order: menuItems.length + idx + 1,
            };
        });

        setMenuItems((prev) => [...prev, ...newItems]);
        setSelectedPosts([]);
    }

    // Move Item Up
    function moveUp(index: number) {
        if (index === 0) return;
        const updated = [...menuItems];
        const temp = updated[index - 1];
        updated[index - 1] = updated[index];
        updated[index] = temp;
        // reorder
        updated.forEach((item, i) => (item.order = i + 1));
        setMenuItems(updated);
    }

    // Move Item Down
    function moveDown(index: number) {
        if (index === menuItems.length - 1) return;
        const updated = [...menuItems];
        const temp = updated[index + 1];
        updated[index + 1] = updated[index];
        updated[index] = temp;
        // reorder
        updated.forEach((item, i) => (item.order = i + 1));
        setMenuItems(updated);
    }

    // Update item field
    function updateItem(index: number, field: keyof MenuItemData, value: any) {
        const updated = [...menuItems];
        updated[index] = {
            ...updated[index],
            [field]: value,
        };
        setMenuItems(updated);
    }

    // Remove Item
    function removeItem(index: number) {
        const updated = menuItems.filter((_, i) => i !== index);
        updated.forEach((item, i) => (item.order = i + 1));
        setMenuItems(updated);
    }

    // Save Menu
    function handleSaveMenu() {
        setSaving(true);
        router.post(
            '/admin/menus/save',
            {
                menu_id: menu.id,
                name: menuName,
                items: menuItems.map((item, idx) => ({
                    id: typeof item.id === 'number' ? item.id : null,
                    title: item.title,
                    url: item.url,
                    target: item.target,
                    type: item.type,
                    type_id: item.type_id || null,
                    order: idx + 1,
                })),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSaving(false);
                    setSaveSuccess(true);
                    setTimeout(() => setSaveSuccess(false), 3000);
                },
                onError: () => {
                    setSaving(false);
                },
            }
        );
    }

    // Reset Menu
    function handleResetMenu() {
        router.post(
            '/admin/menus/reset',
            {},
            {
                onSuccess: () => {
                    setConfirmResetOpen(false);
                },
            }
        );
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Navigation Menus', href: '/admin/menus' },
            ]}
        >
            <Head title="Menus Editor — WordPress Style" />

            <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto">
                {/* Page Title & WordPress Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <MenuIcon className="h-6 w-6 text-[#9B1C1C] dark:text-[#EF4444]" />
                            <h1 className="text-2xl font-serif font-bold tracking-tight text-foreground">
                                Navigation Menus
                            </h1>
                            <Badge variant="outline" className="font-mono text-xs">
                                WordPress Style
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Customize and manage navigation links displayed in your website header. Add custom links, categories, or specific dispatches.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setConfirmResetOpen(true)}
                            className="text-muted-foreground hover:text-foreground text-xs"
                        >
                            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                            Reset Defaults
                        </Button>
                        <Button
                            onClick={handleSaveMenu}
                            disabled={saving}
                            className="bg-[#7d1017] hover:bg-[#9e2a2b] text-white shadow-sm text-xs font-semibold"
                        >
                            <Save className="mr-1.5 h-3.5 w-3.5" />
                            {saving ? 'Saving Menu...' : 'Save Menu'}
                        </Button>
                    </div>
                </div>

                {saveSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-lg text-sm font-medium animate-in fade-in">
                        ✓ Menu structure saved successfully and live on the frontend!
                    </div>
                )}

                {/* 2-Column WordPress Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* LEFT COLUMN: Add Menu Items (Accordion / Tabs) */}
                    <div className="lg:col-span-4 space-y-4">
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-base font-semibold">Add Menu Items</CardTitle>
                                <CardDescription className="text-xs">
                                    Choose items from the categories or enter custom links to add to this menu.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Tabs defaultValue="custom" className="w-full">
                                    <TabsList className="w-full grid grid-cols-3 rounded-none border-b bg-muted/40 p-0 h-10">
                                        <TabsTrigger value="custom" className="rounded-none text-xs data-[state=active]:bg-background">
                                            Custom Link
                                        </TabsTrigger>
                                        <TabsTrigger value="categories" className="rounded-none text-xs data-[state=active]:bg-background">
                                            Categories
                                        </TabsTrigger>
                                        <TabsTrigger value="posts" className="rounded-none text-xs data-[state=active]:bg-background">
                                            Dispatches
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* 1. Custom Links Tab */}
                                    <TabsContent value="custom" className="p-4 space-y-4 m-0">
                                        <form onSubmit={addCustomLink} className="space-y-3">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="c_url" className="text-xs">URL</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="c_url"
                                                        value={customUrl}
                                                        onChange={(e) => setCustomUrl(e.target.value)}
                                                        placeholder="https://..."
                                                        className="text-xs"
                                                        required
                                                    />
                                                </div>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Use <code className="text-primary font-mono font-semibold">/</code> for Home, or <code className="text-primary font-mono font-semibold">#articles-feed</code> for on-page sections.
                                                </p>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="c_title" className="text-xs">Link Text</Label>
                                                <Input
                                                    id="c_title"
                                                    value={customTitle}
                                                    onChange={(e) => setCustomTitle(e.target.value)}
                                                    placeholder="e.g. Field Notes or Route Atlas"
                                                    className="text-xs"
                                                    required
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                variant="outline"
                                                size="sm"
                                                className="w-full text-xs font-semibold"
                                            >
                                                <Plus className="mr-1.5 h-3.5 w-3.5" />
                                                Add to Menu
                                            </Button>
                                        </form>
                                    </TabsContent>

                                    {/* 2. Categories Tab */}
                                    <TabsContent value="categories" className="p-4 space-y-3 m-0">
                                        <div className="max-h-56 overflow-y-auto space-y-2 border rounded-md p-2.5 bg-muted/20">
                                            {categories.length === 0 ? (
                                                <p className="text-xs text-muted-foreground">No categories found.</p>
                                            ) : (
                                                categories.map((cat) => (
                                                    <label
                                                        key={cat.id}
                                                        className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/50 p-1 rounded"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCategories.includes(cat.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedCategories((prev) => [...prev, cat.id]);
                                                                } else {
                                                                    setSelectedCategories((prev) => prev.filter((id) => id !== cat.id));
                                                                }
                                                            }}
                                                            className="rounded border-gray-300 text-primary focus:ring-primary size-3.5"
                                                        />
                                                        <span className="font-medium">{cat.name}</span>
                                                    </label>
                                                ))
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between pt-1">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (selectedCategories.length === categories.length) {
                                                        setSelectedCategories([]);
                                                    } else {
                                                        setSelectedCategories(categories.map((c) => c.id));
                                                    }
                                                }}
                                                className="text-[11px] text-muted-foreground hover:underline"
                                            >
                                                {selectedCategories.length === categories.length ? 'Deselect All' : 'Select All'}
                                            </button>

                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                disabled={selectedCategories.length === 0}
                                                onClick={addCategoriesToMenu}
                                                className="text-xs font-semibold"
                                            >
                                                <Plus className="mr-1.5 h-3.5 w-3.5" />
                                                Add to Menu
                                            </Button>
                                        </div>
                                    </TabsContent>

                                    {/* 3. Dispatches / Posts Tab */}
                                    <TabsContent value="posts" className="p-4 space-y-3 m-0">
                                        <div className="max-h-56 overflow-y-auto space-y-2 border rounded-md p-2.5 bg-muted/20">
                                            {posts.length === 0 ? (
                                                <p className="text-xs text-muted-foreground">No published posts found.</p>
                                            ) : (
                                                posts.map((post) => (
                                                    <label
                                                        key={post.id}
                                                        className="flex items-start gap-2 text-xs cursor-pointer hover:bg-muted/50 p-1 rounded"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedPosts.includes(post.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedPosts((prev) => [...prev, post.id]);
                                                                } else {
                                                                    setSelectedPosts((prev) => prev.filter((id) => id !== post.id));
                                                                }
                                                            }}
                                                            className="rounded border-gray-300 text-primary focus:ring-primary size-3.5 mt-0.5"
                                                        />
                                                        <span className="font-medium line-clamp-1">{post.title}</span>
                                                    </label>
                                                ))
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between pt-1">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (selectedPosts.length === posts.length) {
                                                        setSelectedPosts([]);
                                                    } else {
                                                        setSelectedPosts(posts.map((p) => p.id));
                                                    }
                                                }}
                                                className="text-[11px] text-muted-foreground hover:underline"
                                            >
                                                {selectedPosts.length === posts.length ? 'Deselect All' : 'Select All'}
                                            </button>

                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                disabled={selectedPosts.length === 0}
                                                onClick={addPostsToMenu}
                                                className="text-xs font-semibold"
                                            >
                                                <Plus className="mr-1.5 h-3.5 w-3.5" />
                                                Add to Menu
                                            </Button>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: Menu Structure (WordPress Work Area) */}
                    <div className="lg:col-span-8 space-y-4">
                        <Card className="shadow-sm">
                            <CardHeader className="border-b pb-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base font-semibold">Menu Structure</CardTitle>
                                        <CardDescription className="text-xs">
                                            Reorder items with the Up/Down buttons, edit link titles, or expand each item to customize target options.
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="m_name" className="text-xs text-muted-foreground whitespace-nowrap">Menu Name:</Label>
                                        <Input
                                            id="m_name"
                                            value={menuName}
                                            onChange={(e) => setMenuName(e.target.value)}
                                            className="h-8 text-xs font-medium w-48"
                                        />
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-4 sm:p-6 space-y-4">
                                {menuItems.length === 0 ? (
                                    <div className="border border-dashed rounded-xl p-8 text-center text-muted-foreground text-sm">
                                        <p className="font-semibold text-foreground mb-1">Your menu is currently empty</p>
                                        <p className="text-xs">Add items from the column on the left (Custom Link, Categories, or Dispatches).</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2.5">
                                        {menuItems.map((item, index) => {
                                            const itemKey = String(item.id || index);
                                            const isExpanded = !!expandedIds[itemKey];

                                            return (
                                                <div
                                                    key={itemKey}
                                                    className="border rounded-lg bg-card shadow-xs transition-colors overflow-hidden"
                                                >
                                                    {/* Header bar of menu item */}
                                                    <div className="flex items-center justify-between p-3 bg-muted/20 hover:bg-muted/30">
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <GripVertical className="size-4 text-muted-foreground/60 shrink-0 cursor-grab" />
                                                            <span className="font-semibold text-sm text-foreground truncate">
                                                                {item.title}
                                                            </span>
                                                            <Badge
                                                                variant="outline"
                                                                className="text-[10px] font-mono capitalize px-1.5 py-0 h-4 shrink-0"
                                                            >
                                                                {item.type === 'category' ? 'Category' : item.type === 'post' ? 'Dispatch' : 'Custom Link'}
                                                            </Badge>
                                                        </div>

                                                        <div className="flex items-center gap-1 shrink-0">
                                                            {/* Reorder Buttons */}
                                                            <button
                                                                type="button"
                                                                disabled={index === 0}
                                                                onClick={() => moveUp(index)}
                                                                title="Move Up"
                                                                className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none rounded hover:bg-muted"
                                                            >
                                                                <ArrowUp className="size-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={index === menuItems.length - 1}
                                                                onClick={() => moveDown(index)}
                                                                title="Move Down"
                                                                className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none rounded hover:bg-muted"
                                                            >
                                                                <ArrowDown className="size-3.5" />
                                                            </button>

                                                            {/* Expand/Collapse Chevron */}
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleExpand(itemKey)}
                                                                className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted ml-1"
                                                            >
                                                                {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Expanded Options (WordPress Sub-panel) */}
                                                    {isExpanded && (
                                                        <div className="p-4 border-t bg-background space-y-3.5 text-xs animate-in fade-in duration-150">
                                                            <div className="space-y-1.5">
                                                                <Label className="text-xs">Navigation Label</Label>
                                                                <Input
                                                                    value={item.title}
                                                                    onChange={(e) => updateItem(index, 'title', e.target.value)}
                                                                    className="text-xs"
                                                                />
                                                            </div>

                                                            <div className="space-y-1.5">
                                                                <Label className="text-xs">URL</Label>
                                                                <Input
                                                                    value={item.url}
                                                                    onChange={(e) => updateItem(index, 'url', e.target.value)}
                                                                    className="text-xs font-mono"
                                                                />
                                                            </div>

                                                            <div className="flex items-center gap-2 pt-1">
                                                                <input
                                                                    id={`target_${itemKey}`}
                                                                    type="checkbox"
                                                                    checked={item.target === '_blank'}
                                                                    onChange={(e) => updateItem(index, 'target', e.target.checked ? '_blank' : '_self')}
                                                                    className="rounded border-gray-300 text-primary focus:ring-primary size-3.5"
                                                                />
                                                                <Label htmlFor={`target_${itemKey}`} className="text-xs cursor-pointer font-normal">
                                                                    Open link in a new tab (<code className="font-mono text-[11px]">_blank</code>)
                                                                </Label>
                                                            </div>

                                                            <div className="pt-2 border-t flex items-center justify-between text-xs">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeItem(index)}
                                                                    className="text-red-500 hover:text-red-700 font-medium hover:underline flex items-center gap-1"
                                                                >
                                                                    <Trash2 className="size-3.5" />
                                                                    <span>Remove</span>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleExpand(itemKey)}
                                                                    className="text-muted-foreground hover:underline"
                                                                >
                                                                    Done
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Menu Settings Location */}
                                <div className="mt-8 pt-5 border-t space-y-3">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Menu Settings
                                    </h4>
                                    <div className="flex items-start gap-2.5 text-xs">
                                        <input
                                            type="checkbox"
                                            checked
                                            readOnly
                                            className="rounded border-gray-300 text-primary focus:ring-primary size-4 mt-0.5"
                                        />
                                        <div>
                                            <p className="font-semibold text-foreground">Header Primary Navigation</p>
                                            <p className="text-muted-foreground text-[11px]">
                                                Displays horizontally at the top navigation bar of every page on the live website.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>

                            {/* Card Footer Save Actions */}
                            <div className="p-4 bg-muted/20 border-t flex items-center justify-between">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setConfirmResetOpen(true)}
                                    className="text-muted-foreground hover:text-red-600 text-xs"
                                >
                                    Reset to Default
                                </Button>
                                <Button
                                    onClick={handleSaveMenu}
                                    disabled={saving}
                                    className="bg-[#7d1017] hover:bg-[#9e2a2b] text-white shadow-sm text-xs font-semibold"
                                >
                                    <Save className="mr-1.5 h-3.5 w-3.5" />
                                    {saving ? 'Saving...' : 'Save Menu'}
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Confirm Reset Dialog */}
            <ConfirmDialog
                open={confirmResetOpen}
                onOpenChange={setConfirmResetOpen}
                title="Reset Navigation Menu?"
                description="This will restore the original 5 default menu items (Home, Destinations, Route Guides, Stories, About Us). All custom links and arrangements will be replaced."
                confirmText="Reset to Defaults"
                onConfirm={handleResetMenu}
            />
        </AppLayout>
    );
}
