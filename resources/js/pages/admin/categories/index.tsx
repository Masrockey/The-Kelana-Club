import { Head, useForm } from '@inertiajs/react';
import { Edit2, FolderTree, Plus, Trash2 } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';

interface CategoryItem {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    color: string;
    posts_count: number;
}

interface Props {
    categories: CategoryItem[];
}

export default function CategoriesIndex({ categories }: Props) {
    const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

    const { data, setData, post, put, delete: destroy, reset, processing, errors } = useForm({
        name: '',
        slug: '',
        description: '',
        color: '#C2410C',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (editingCategory) {
            put(`/admin/categories/${editingCategory.id}`, {
                onSuccess: () => {
                    setEditingCategory(null);
                    reset();
                },
            });
        } else {
            post('/admin/categories', {
                onSuccess: () => reset(),
            });
        }
    }

    function startEdit(cat: CategoryItem) {
        setEditingCategory(cat);
        setData({
            name: cat.name,
            slug: cat.slug,
            description: cat.description || '',
            color: cat.color || '#C2410C',
        });
    }

    function cancelEdit() {
        setEditingCategory(null);
        reset();
    }

    function handleDelete(id: number, name: string) {
        if (confirm(`Delete category "${name}"?`)) {
            destroy(`/admin/categories/${id}`);
        }
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Categories', href: '/admin/categories' },
            ]}
        >
            <Head title="Categories Management — The Kelana Club" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        Categories & Taxonomies
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Organize your dispatches into curated editorial pillars and themes.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Add / Edit Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">
                                {editingCategory ? `Edit: ${editingCategory.name}` : 'Create New Category'}
                            </CardTitle>
                            <CardDescription>
                                {editingCategory
                                    ? 'Update category attributes and theme color'
                                    : 'Add a new editorial section to the journal'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="cat_name" className="text-xs">Category Name</Label>
                                    <Input
                                        id="cat_name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g. Urban Philosophy"
                                        required
                                    />
                                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="cat_slug" className="text-xs">Slug (Optional)</Label>
                                    <Input
                                        id="cat_slug"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                        placeholder="urban-philosophy"
                                        className="font-mono text-xs"
                                    />
                                    {errors.slug && <p className="text-xs text-red-500">{errors.slug}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="cat_desc" className="text-xs">Description</Label>
                                    <Textarea
                                        id="cat_desc"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="A brief summary of what essays belong here..."
                                        className="h-20 text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="cat_color" className="text-xs">Badge Accent Color</Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            id="cat_color"
                                            value={data.color}
                                            onChange={(e) => setData('color', e.target.value)}
                                            className="h-8 w-12 rounded border p-0.5 cursor-pointer"
                                        />
                                        <Input
                                            value={data.color}
                                            onChange={(e) => setData('color', e.target.value)}
                                            className="font-mono text-xs uppercase"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <Button type="submit" disabled={processing} size="sm" className="flex-1">
                                        <Plus className="mr-1.5 h-4 w-4" />
                                        {editingCategory ? 'Update Category' : 'Create Category'}
                                    </Button>
                                    {editingCategory && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={cancelEdit}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Categories List */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">Active Categories</CardTitle>
                                <CardDescription>All registered editorial pillars and their active articles</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="border-b bg-muted/40 uppercase text-muted-foreground">
                                            <tr>
                                                <th className="py-2.5 px-4">Name & Description</th>
                                                <th className="py-2.5 px-4">Slug</th>
                                                <th className="py-2.5 px-4 text-center">Dispatches</th>
                                                <th className="py-2.5 px-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {categories.map((c) => (
                                                <tr key={c.id} className="hover:bg-muted/30">
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className="h-3 w-3 rounded-full shrink-0"
                                                                style={{ backgroundColor: c.color }}
                                                            />
                                                            <div>
                                                                <div className="font-semibold text-foreground text-sm">
                                                                    {c.name}
                                                                </div>
                                                                {c.description && (
                                                                    <div className="text-muted-foreground text-[11px] line-clamp-1">
                                                                        {c.description}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 font-mono text-muted-foreground">
                                                        {c.slug}
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <Badge variant="secondary" className="font-mono">
                                                            {c.posts_count}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7"
                                                                onClick={() => startEdit(c)}
                                                            >
                                                                <Edit2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-red-600 hover:text-red-700"
                                                                onClick={() => handleDelete(c.id, c.name)}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
