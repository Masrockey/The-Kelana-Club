import { Head, router } from '@inertiajs/react';
import {
    Image as ImageIcon,
    UploadCloud,
    Link as LinkIcon,
    Search,
    Trash2,
    Copy,
    Check,
    ExternalLink,
    Plus,
    Filter,
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import ConfirmDialog from '@/components/confirm-dialog';
import MediaLibraryModal, { MediaItem } from '@/components/media-library-modal';

interface Props {
    media: {
        data: MediaItem[];
        total: number;
        current_page: number;
        last_page: number;
    };
    filters: {
        search: string;
    };
}

export default function MediaIndex({ media, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [selectedDetail, setSelectedDetail] = useState<MediaItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
    const [deleting, setDeleting] = useState(false);

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/admin/media', { search }, { preserveState: true });
    }

    function copyUrl(id: number, url: string) {
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(`/admin/media/${deleteTarget.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setDeleteTarget(null);
            },
        });
    }

    const totalStorageBytes = media.data.reduce((acc, m) => acc + (m.size_bytes || 0), 0);
    const totalStorageMb = (totalStorageBytes / (1024 * 1024)).toFixed(1);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Media Library', href: '#' },
            ]}
        >
            <Head title="Media Library — The Kelana Club" />

            <div className="flex flex-1 flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
                {/* Header Action Bar */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b pb-4">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                            <ImageIcon className="h-5 w-5 text-[#C2410C]" />
                            <span>Media Library</span>
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            WordPress-grade digital asset manager for authentic travel photography and route dispatches.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => setModalOpen(true)}
                            className="bg-[#1C1917] text-white hover:bg-[#292524] dark:bg-white dark:text-[#1C1917]"
                        >
                            <Plus className="mr-1.5 h-4 w-4" />
                            Add New Media
                        </Button>
                    </div>
                </div>

                {/* Storage & Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-mono uppercase text-muted-foreground">
                                Total Media Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-bold font-serif">{media.total} files</div>
                            <p className="text-[11px] text-muted-foreground">
                                Curated overland and route photography
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-mono uppercase text-muted-foreground">
                                Storage Utilization
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-bold font-serif">{totalStorageMb} MB</div>
                            <p className="text-[11px] text-muted-foreground">Local media drive storage</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-mono uppercase text-muted-foreground">
                                Integration Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 font-mono text-xs">
                                    ● Gutenberg Connected
                                </Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1">
                                Direct picker available in Article Body & Featured Image
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search & Filter Bar */}
                <form onSubmit={handleSearch} className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search photography by title, alt text, or caption..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 text-xs"
                        />
                    </div>
                    <Button type="submit" variant="secondary" size="sm" className="text-xs">
                        Search
                    </Button>
                    {filters.search && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearch('');
                                router.get('/admin/media');
                            }}
                            className="text-xs"
                        >
                            Reset
                        </Button>
                    )}
                </form>

                {/* Media Grid */}
                {media.data.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-12 text-center space-y-3 bg-muted/10">
                        <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground opacity-40" />
                        <h3 className="font-semibold text-sm">No media files in library</h3>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                            Upload high-resolution photography from your computer or import travel imagery directly from web URLs.
                        </p>
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => setModalOpen(true)}
                            className="bg-[#C2410C] hover:bg-[#9A3412] text-white"
                        >
                            Upload or Import Image
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {media.data.map((item) => (
                            <div
                                key={item.id}
                                className="group relative rounded-xl overflow-hidden border bg-card shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                            >
                                <div className="aspect-square bg-muted/30 overflow-hidden relative">
                                    <img
                                        src={item.url}
                                        alt={item.alt_text || item.name}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    <Badge
                                        variant="outline"
                                        className="absolute top-2 left-2 text-[10px] font-mono uppercase bg-background/80 backdrop-blur"
                                    >
                                        {item.source_type}
                                    </Badge>
                                </div>

                                <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-semibold text-xs truncate" title={item.name}>
                                            {item.name}
                                        </h4>
                                        <p className="text-[11px] text-muted-foreground line-clamp-1 italic font-serif">
                                            {item.caption || item.alt_text || 'No caption'}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t text-[11px] text-muted-foreground">
                                        <button
                                            type="button"
                                            onClick={() => copyUrl(item.id, item.url)}
                                            className="hover:text-foreground flex items-center gap-1 transition-colors"
                                            title="Copy direct URL"
                                        >
                                            {copiedId === item.id ? (
                                                <>
                                                    <Check className="h-3 w-3 text-emerald-600" />
                                                    <span className="text-emerald-600 font-medium">Copied!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-3 w-3" />
                                                    <span>Copy URL</span>
                                                </>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setDeleteTarget(item)}
                                            className="text-red-500 hover:text-red-700 transition-colors p-1"
                                            title="Delete image"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Confirm Delete Modal */}
            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title="Delete Media File?"
                description={
                    deleteTarget ? (
                        <div className="space-y-2">
                            <p>
                                Are you sure you want to permanently delete{' '}
                                <strong className="text-foreground font-semibold">"{deleteTarget.name}"</strong>?
                            </p>
                            <p className="text-xs text-muted-foreground">
                                This image will be permanently removed from disk and cannot be recovered.
                            </p>
                        </div>
                    ) : null
                }
                confirmText="Delete File"
                loading={deleting}
                onConfirm={confirmDelete}
            />

            {/* WordPress Media Library Dialog */}
            <MediaLibraryModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                onSelect={(selected) => {
                    router.reload({ preserveScroll: true });
                }}
                title="Select or Upload Travel Photography"
                selectButtonText="Done"
            />
        </AppLayout>
    );
}
