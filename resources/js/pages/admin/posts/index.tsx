import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowUpRight,
    Edit,
    ExternalLink,
    Eye,
    FilePlus,
    Filter,
    MoreHorizontal,
    Plus,
    Search,
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import ConfirmDialog from '@/components/confirm-dialog';

interface PostItem {
    id: number;
    title: string;
    slug: string;
    status: string;
    is_featured: boolean;
    views_count: number;
    seo_score: number;
    geo_target_country: string;
    read_time_minutes: number;
    published_at: string | null;
    created_at: string;
    featured_image: string | null;
    category?: {
        name: string;
        color: string;
    };
    user?: {
        name: string;
    };
}

interface CategoryItem {
    id: number;
    name: string;
}

interface Props {
    posts: {
        data: PostItem[];
        current_page: number;
        last_page: number;
        total: number;
    };
    categories: CategoryItem[];
    filters: {
        q?: string;
        status?: string;
        category_id?: string;
    };
}

export default function PostsIndex({ posts, categories, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.q || '');
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);
    const [deleting, setDeleting] = useState(false);

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/admin/posts', { ...filters, q: searchTerm }, { preserveState: true });
    }

    function handleStatusFilter(status: string | null) {
        router.get('/admin/posts', { ...filters, status: status || undefined }, { preserveState: true });
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(`/admin/posts/${deleteTarget.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setDeleteTarget(null);
            },
        });
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Posts', href: '/admin/posts' }]}>
            <Head title="Posts Management — The Kelana Club" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dispatches & Articles</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage published stories, drafts, real-time SEO health, and GEO distributions.
                        </p>
                    </div>

                    <Button asChild>
                        <Link href="/admin/posts/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Compose New Dispatch
                        </Link>
                    </Button>
                </div>

                {/* Filter and Search Bar */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by title, keyword, or slug..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </form>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant={!filters.status ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleStatusFilter(null)}
                                >
                                    All ({posts.total})
                                </Button>
                                <Button
                                    variant={filters.status === 'published' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleStatusFilter('published')}
                                >
                                    Published
                                </Button>
                                <Button
                                    variant={filters.status === 'draft' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleStatusFilter('draft')}
                                >
                                    Drafts
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Posts Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-muted/40 text-xs text-muted-foreground uppercase">
                                    <tr>
                                        <th className="py-3 px-4">Article</th>
                                        <th className="py-3 px-4">Category</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4">SEO Health</th>
                                        <th className="py-3 px-4">GEO Target</th>
                                        <th className="py-3 px-4 text-right">Impressions</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {posts.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-8 text-center text-muted-foreground">
                                                No dispatches found matching your search.
                                            </td>
                                        </tr>
                                    ) : (
                                        posts.data.map((post) => (
                                            <tr key={post.id} className="hover:bg-muted/40 transition-colors">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        {post.featured_image ? (
                                                            <img
                                                                src={post.featured_image}
                                                                alt=""
                                                                className="h-10 w-14 rounded object-cover shrink-0 border"
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-14 rounded bg-muted flex items-center justify-center shrink-0 text-muted-foreground text-xs">
                                                                No Img
                                                            </div>
                                                        )}
                                                        <div className="space-y-0.5 min-w-0">
                                                            <Link
                                                                href={`/admin/posts/${post.id}/edit`}
                                                                className="font-medium text-foreground hover:underline line-clamp-1"
                                                            >
                                                                {post.title}
                                                            </Link>
                                                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                                <span>{post.user?.name || 'Staff'}</span>
                                                                <span>•</span>
                                                                <span>{post.read_time_minutes} min read</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="py-3 px-4">
                                                    {post.category ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                            style={{ borderLeft: `3px solid ${post.category.color}` }}
                                                        >
                                                            {post.category.name}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">—</span>
                                                    )}
                                                </td>

                                                <td className="py-3 px-4">
                                                    <Badge
                                                        variant={post.status === 'published' ? 'default' : 'secondary'}
                                                        className={
                                                            post.status === 'published'
                                                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                                                : 'bg-muted text-muted-foreground'
                                                        }
                                                    >
                                                        {post.status}
                                                    </Badge>
                                                </td>

                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className={`h-2.5 w-2.5 rounded-full ${
                                                                post.seo_score >= 80
                                                                    ? 'bg-emerald-500'
                                                                    : post.seo_score >= 55
                                                                    ? 'bg-amber-500'
                                                                    : 'bg-red-500'
                                                            }`}
                                                        />
                                                        <span className="font-semibold text-xs">{post.seo_score}/100</span>
                                                    </div>
                                                </td>

                                                <td className="py-3 px-4">
                                                    <Badge variant="outline" className="font-mono text-xs">
                                                        📍 {post.geo_target_country || 'ALL'}
                                                    </Badge>
                                                </td>

                                                <td className="py-3 px-4 text-right font-medium">
                                                    {post.views_count.toLocaleString()}
                                                </td>

                                                <td className="py-3 px-4 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/admin/posts/${post.id}/edit`}>
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit Article
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            {post.status === 'published' && (
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/article/${post.slug}`} target="_blank">
                                                                        <ExternalLink className="mr-2 h-4 w-4" />
                                                                        View Live Story
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => setDeleteTarget({ id: post.id, title: post.title })}
                                                                className="text-red-600 focus:text-red-600"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Confirm Delete Modal */}
            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title="Delete Dispatch Article?"
                description={
                    deleteTarget ? (
                        <div className="space-y-2">
                            <p>
                                Are you sure you want to permanently delete{' '}
                                <strong className="text-foreground font-semibold">"{deleteTarget.title}"</strong>?
                            </p>
                            <p className="text-xs text-muted-foreground">
                                This will remove the article, its visitor records, and associated commentary.
                            </p>
                        </div>
                    ) : null
                }
                confirmText="Delete Article"
                loading={deleting}
                onConfirm={confirmDelete}
            />
        </AppLayout>
    );
}
