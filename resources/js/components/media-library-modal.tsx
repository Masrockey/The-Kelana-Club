import React, { useState, useEffect, useRef } from 'react';
import {
    Image as ImageIcon,
    UploadCloud,
    Link as LinkIcon,
    Search,
    Check,
    Trash2,
    Loader2,
    RefreshCw,
    X,
    FileText,
    ExternalLink,
    AlertCircle,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ConfirmDialog from '@/components/confirm-dialog';

export interface MediaItem {
    id: number;
    name: string;
    url: string;
    file_path: string | null;
    mime_type: string | null;
    size_bytes: number;
    formatted_size?: string;
    alt_text: string | null;
    caption: string | null;
    source_type: 'upload' | 'url';
    created_at: string;
}

interface MediaLibraryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (media: { url: string; alt_text?: string; caption?: string; name?: string }) => void;
    title?: string;
    selectButtonText?: string;
}

function getCsrfToken(): string {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
        return metaTag.getAttribute('content') || '';
    }
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

export default function MediaLibraryModal({
    open,
    onOpenChange,
    onSelect,
    title = 'Media Library',
    selectButtonText = 'Select Media',
}: MediaLibraryModalProps) {
    const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'url'>('library');
    const [mediaList, setMediaList] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

    // Upload state
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // URL Import state
    const [importUrl, setImportUrl] = useState('');
    const [importName, setImportName] = useState('');
    const [importAlt, setImportAlt] = useState('');
    const [importCaption, setImportCaption] = useState('');
    const [importing, setImporting] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const [urlPreviewValid, setUrlPreviewValid] = useState<boolean | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deletingMedia, setDeletingMedia] = useState(false);

    // Fetch media library items
    async function fetchMedia(search = '') {
        setLoading(true);
        try {
            const url = new URL('/admin/media/items', window.location.origin);
            if (search) url.searchParams.set('search', search);
            url.searchParams.set('per_page', '40');

            const res = await fetch(url.toString(), {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (res.ok) {
                const data = await res.json();
                const items: MediaItem[] = data.data || [];
                setMediaList(items);

                // If currently selected media is not in list or null, auto-select first
                if (items.length > 0 && !selectedMedia) {
                    setSelectedMedia(items[0]);
                }
            }
        } catch (err) {
            console.error('Failed to load media library:', err);
        } finally {
            setLoading(false);
        }
    }

    // Reload media when modal opens
    useEffect(() => {
        if (open) {
            fetchMedia(searchQuery);
            setUploadError(null);
            setImportError(null);
        }
    }, [open]);

    // Handle search debounce
    useEffect(() => {
        if (!open) return;
        const timer = setTimeout(() => {
            fetchMedia(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Handle file upload
    async function handleFileUpload(files: FileList | null) {
        if (!files || files.length === 0) return;
        const file = files[0];

        setUploading(true);
        setUploadError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('alt_text', file.name.replace(/\.[^/.]+$/, ''));

        try {
            const res = await fetch('/admin/media/upload', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
                body: formData,
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // Add to list and select it
                const newMedia: MediaItem = data.media;
                setMediaList((prev) => [newMedia, ...prev]);
                setSelectedMedia(newMedia);
                setActiveTab('library');
            } else {
                setUploadError(data.message || 'Upload failed. Please ensure the file is an image under 12MB.');
            }
        } catch (err: any) {
            setUploadError(err.message || 'Error occurred while uploading');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }

    // Handle import from URL
    async function handleImportUrl(e: React.FormEvent) {
        e.preventDefault();
        if (!importUrl) return;

        setImporting(true);
        setImportError(null);

        try {
            const res = await fetch('/admin/media/import-url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    url: importUrl,
                    name: importName || undefined,
                    alt_text: importAlt || undefined,
                    caption: importCaption || undefined,
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                const newMedia: MediaItem = data.media;
                setMediaList((prev) => [newMedia, ...prev]);
                setSelectedMedia(newMedia);
                // Reset form
                setImportUrl('');
                setImportName('');
                setImportAlt('');
                setImportCaption('');
                setUrlPreviewValid(null);
                setActiveTab('library');
            } else {
                setImportError(data.message || 'Could not import image from URL.');
            }
        } catch (err: any) {
            setImportError(err.message || 'Failed to import image');
        } finally {
            setImporting(false);
        }
    }

    // Delete media item
    async function executeDeleteMedia() {
        if (!selectedMedia) return;
        setDeletingMedia(true);

        try {
            const res = await fetch(`/admin/media/${selectedMedia.id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
            });

            if (res.ok) {
                setMediaList((prev) => prev.filter((m) => m.id !== selectedMedia.id));
                setSelectedMedia(null);
            }
        } catch (err) {
            console.error('Delete failed:', err);
        } finally {
            setDeletingMedia(false);
            setDeleteConfirmOpen(false);
        }
    }

    // Update details (alt_text, caption)
    async function handleUpdateMetadata(field: 'alt_text' | 'caption' | 'name', value: string) {
        if (!selectedMedia) return;

        setSelectedMedia((prev) => (prev ? { ...prev, [field]: value } : null));
        setMediaList((prev) =>
            prev.map((m) => (m.id === selectedMedia.id ? { ...m, [field]: value } : m))
        );

        try {
            await fetch(`/admin/media/${selectedMedia.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ [field]: value }),
            });
        } catch (err) {
            console.error('Update metadata failed:', err);
        }
    }

    // Final insert / select
    function handleConfirmSelect() {
        if (!selectedMedia) return;
        onSelect({
            url: selectedMedia.url,
            alt_text: selectedMedia.alt_text || selectedMedia.name || 'Travel Photograph',
            caption: selectedMedia.caption || '',
            name: selectedMedia.name,
        });
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl w-[95vw] h-[85vh] p-0 flex flex-col gap-0 rounded-2xl overflow-hidden bg-background">
                {/* 1. MODAL HEADER & TAB BAR */}
                <DialogHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between shrink-0">
                    <DialogTitle className="text-base font-semibold flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-[#C2410C]" />
                        <span>{title}</span>
                    </DialogTitle>
                </DialogHeader>

                <Tabs
                    value={activeTab}
                    onValueChange={(val) => setActiveTab(val as any)}
                    className="flex-1 flex flex-col min-h-0"
                >
                    <div className="px-4 border-b bg-muted/20">
                        <TabsList className="bg-transparent h-10 p-0 space-x-2">
                            <TabsTrigger
                                value="library"
                                className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-3 text-xs"
                            >
                                <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
                                Media Library ({mediaList.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="upload"
                                className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-3 text-xs"
                            >
                                <UploadCloud className="h-3.5 w-3.5 mr-1.5" />
                                Upload Files
                            </TabsTrigger>
                            <TabsTrigger
                                value="url"
                                className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-3 text-xs"
                            >
                                <LinkIcon className="h-3.5 w-3.5 mr-1.5" />
                                Insert from URL
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* TAB 1: MEDIA LIBRARY (WordPress Style Grid + Inspector) */}
                    <TabsContent value="library" className="flex-1 flex flex-col min-h-0 p-0 m-0">
                        {/* Search Toolbar */}
                        <div className="p-3 border-b flex items-center justify-between bg-background gap-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    placeholder="Search media by title or alt text..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-8 pl-8 text-xs"
                                />
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fetchMedia(searchQuery)}
                                disabled={loading}
                                className="h-8 text-xs"
                            >
                                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>

                        {/* Split Body: Left Grid + Right Inspector */}
                        <div className="flex-1 flex min-h-0 overflow-hidden">
                            {/* Grid of Images */}
                            <div className="flex-1 overflow-y-auto p-4 bg-muted/10">
                                {loading && mediaList.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                                        <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                        <span className="text-xs">Loading media collection...</span>
                                    </div>
                                ) : mediaList.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-12">
                                        <ImageIcon className="h-12 w-12 opacity-30 mb-3" />
                                        <p className="text-sm font-medium">No media files found</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Upload an image file or import from a web link.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                        {mediaList.map((item) => {
                                            const isSelected = selectedMedia?.id === item.id;
                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={() => setSelectedMedia(item)}
                                                    className={`group relative rounded-lg overflow-hidden border cursor-pointer aspect-square bg-muted/40 transition-all ${
                                                        isSelected
                                                            ? 'ring-2 ring-[#C2410C] border-transparent shadow-md'
                                                            : 'hover:border-foreground/40'
                                                    }`}
                                                >
                                                    <img
                                                        src={item.url}
                                                        alt={item.alt_text || item.name}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=400&q=80';
                                                        }}
                                                    />

                                                    {/* Selected Checkmark Badge */}
                                                    {isSelected && (
                                                        <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-[#C2410C] text-white flex items-center justify-center shadow">
                                                            <Check className="h-3 w-3 stroke-[3]" />
                                                        </div>
                                                    )}

                                                    {/* Title bar on hover */}
                                                    <div className="absolute inset-x-0 bottom-0 bg-black/70 p-1.5 text-white text-[10px] truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {item.name}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Right Inspector Details Panel (WordPress Style) */}
                            {selectedMedia ? (
                                <div className="w-80 border-l bg-background p-4 overflow-y-auto space-y-4 shrink-0 text-xs">
                                    <div className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                        Attachment Details
                                    </div>

                                    {/* Thumbnail Preview (16:9 - 1200x675) */}
                                    <div className="rounded-lg overflow-hidden border aspect-video bg-muted/40 relative">
                                        <img
                                            src={selectedMedia.url}
                                            alt={selectedMedia.alt_text || selectedMedia.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80';
                                            }}
                                        />
                                    </div>

                                    {/* Meta specs */}
                                    <div className="space-y-1 font-mono text-[11px] text-muted-foreground border-b pb-3">
                                        <div className="font-sans font-semibold text-foreground truncate">
                                            {selectedMedia.name}
                                        </div>
                                        <div>Uploaded: {new Date(selectedMedia.created_at).toLocaleDateString()}</div>
                                        <div>
                                            Source:{' '}
                                            <span className="capitalize font-semibold text-foreground">
                                                {selectedMedia.source_type}
                                            </span>
                                        </div>
                                        {selectedMedia.size_bytes > 0 && (
                                            <div>
                                                Size: {(selectedMedia.size_bytes / 1024 / 1024).toFixed(2)} MB
                                            </div>
                                        )}
                                        <a
                                            href={selectedMedia.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-[#C2410C] hover:underline pt-1"
                                        >
                                            <span>View full size</span>
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>

                                    {/* Editable Alt Text & Caption */}
                                    <div className="space-y-3 pt-1">
                                        <div className="space-y-1">
                                            <Label className="text-[11px]">Alt Text (Alternative Description)</Label>
                                            <Input
                                                value={selectedMedia.alt_text || ''}
                                                onChange={(e) => handleUpdateMetadata('alt_text', e.target.value)}
                                                placeholder="Describe for accessibility & SEO..."
                                                className="h-8 text-xs"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-[11px]">Caption / Travel Note</Label>
                                            <Input
                                                value={selectedMedia.caption || ''}
                                                onChange={(e) => handleUpdateMetadata('caption', e.target.value)}
                                                placeholder="Caption displayed under the image..."
                                                className="h-8 text-xs"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-[11px]">Title</Label>
                                            <Input
                                                value={selectedMedia.name || ''}
                                                onChange={(e) => handleUpdateMetadata('name', e.target.value)}
                                                className="h-8 text-xs"
                                            />
                                        </div>

                                        <div className="pt-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setDeleteConfirmOpen(true)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs h-7 px-2"
                                            >
                                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                                Delete permanently
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-80 border-l bg-background p-6 flex flex-col items-center justify-center text-center text-muted-foreground text-xs shrink-0">
                                    <p>Select an image to view details and edit alt text / caption.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* TAB 2: UPLOAD FILES */}
                    <TabsContent value="upload" className="flex-1 flex flex-col items-center justify-center p-8 m-0">
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                handleFileUpload(e.dataTransfer.files);
                            }}
                            className="w-full max-w-xl border-2 border-dashed border-[#E7E5E4] dark:border-[#262422] rounded-2xl p-12 flex flex-col items-center justify-center text-center hover:border-[#C2410C]/60 transition-colors bg-muted/10 space-y-4"
                        >
                            <div className="p-4 rounded-full bg-muted text-[#C2410C]">
                                {uploading ? (
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                ) : (
                                    <UploadCloud className="h-8 w-8" />
                                )}
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-base font-semibold">Drop travel photos here to upload</h3>
                                <p className="text-xs text-muted-foreground">
                                    Supports JPEG, PNG, WebP, AVIF, and GIF up to 12 MB
                                </p>
                                <p className="text-[11px] font-mono text-amber-600 dark:text-amber-400">
                                    Resolusi Banner Rekomendasi: 1200 × 675 px (16:9) atau 1920 × 1080 px
                                </p>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e.target.files)}
                                className="hidden"
                            />

                            <Button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                size="sm"
                                className="bg-[#1C1917] text-white hover:bg-[#292524] dark:bg-white dark:text-[#1C1917]"
                            >
                                {uploading ? 'Uploading...' : 'Select Files from Device'}
                            </Button>

                            {uploadError && (
                                <div className="flex items-center gap-1.5 text-xs text-red-500 bg-red-500/10 p-2.5 rounded-lg">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <span>{uploadError}</span>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* TAB 3: INSERT FROM URL */}
                    <TabsContent value="url" className="flex-1 p-6 m-0 overflow-y-auto">
                        <form onSubmit={handleImportUrl} className="max-w-xl mx-auto space-y-4 pt-4">
                            <div className="space-y-1">
                                <h3 className="text-base font-semibold flex items-center gap-2">
                                    <LinkIcon className="h-4 w-4 text-[#C2410C]" />
                                    Import Image via URL
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Paste any web image URL (Unsplash, Pexels, Cloudflare, etc.). It will be fetched and registered in your Media Library.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="import-url" className="text-xs">
                                    Image Web URL *
                                </Label>
                                <Input
                                    id="import-url"
                                    type="url"
                                    placeholder="https://images.unsplash.com/photo-..."
                                    value={importUrl}
                                    onChange={(e) => {
                                        setImportUrl(e.target.value);
                                        setUrlPreviewValid(null);
                                    }}
                                    required
                                    className="text-xs font-mono"
                                />
                            </div>

                            {/* Live URL Preview */}
                            {importUrl && (
                                <div className="rounded-xl overflow-hidden border bg-muted/20 aspect-[16/9] max-h-60 flex items-center justify-center relative">
                                    <img
                                        src={importUrl}
                                        alt="Preview"
                                        onLoad={() => setUrlPreviewValid(true)}
                                        onError={() => setUrlPreviewValid(false)}
                                        className="w-full h-full object-cover"
                                    />
                                    {urlPreviewValid === false && (
                                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center text-xs text-red-500 font-medium">
                                            Unable to load image from this URL. Check link or permissions.
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div className="space-y-1">
                                    <Label className="text-[11px]">Photo Title (Optional)</Label>
                                    <Input
                                        placeholder="e.g. Karakoram Mountain Pass"
                                        value={importName}
                                        onChange={(e) => setImportName(e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[11px]">Alt Text (SEO)</Label>
                                    <Input
                                        placeholder="e.g. Karakoram highway road"
                                        value={importAlt}
                                        onChange={(e) => setImportAlt(e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-[11px]">Caption</Label>
                                <Input
                                    placeholder="e.g. Sunset over the Passu Cones, Gilgit-Baltistan."
                                    value={importCaption}
                                    onChange={(e) => setImportCaption(e.target.value)}
                                    className="h-8 text-xs font-serif italic"
                                />
                            </div>

                            {importError && (
                                <div className="flex items-center gap-1.5 text-xs text-red-500 bg-red-500/10 p-2.5 rounded-lg">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <span>{importError}</span>
                                </div>
                            )}

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    disabled={importing || !importUrl}
                                    size="sm"
                                    className="bg-[#1C1917] text-white hover:bg-[#292524] dark:bg-white dark:text-[#1C1917]"
                                >
                                    {importing ? (
                                        <>
                                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                                            Fetching & Storing...
                                        </>
                                    ) : (
                                        'Fetch & Save to Media Library'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </TabsContent>
                </Tabs>

                {/* 3. MODAL FOOTER */}
                <DialogFooter className="p-4 border-t bg-muted/20 flex flex-row items-center justify-between shrink-0">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground truncate max-w-md">
                        {selectedMedia ? (
                            <>
                                <img
                                    src={selectedMedia.url}
                                    alt="Selected thumbnail"
                                    className="h-8 w-8 rounded object-cover border"
                                />
                                <div className="truncate">
                                    <span className="font-semibold text-foreground block truncate">
                                        {selectedMedia.name}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                        Ready to insert
                                    </span>
                                </div>
                            </>
                        ) : (
                            <span>No media item selected</span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            disabled={!selectedMedia}
                            size="sm"
                            onClick={handleConfirmSelect}
                            className="bg-[#C2410C] hover:bg-[#9A3412] text-white font-medium"
                        >
                            {selectButtonText}
                        </Button>
                    </div>
                </DialogFooter>

                {/* Sub-modal: Confirm Delete */}
                <ConfirmDialog
                    open={deleteConfirmOpen}
                    onOpenChange={setDeleteConfirmOpen}
                    title="Delete Media File?"
                    description={
                        selectedMedia ? (
                            <div className="space-y-2">
                                <p>
                                    Are you sure you want to permanently delete{' '}
                                    <strong className="text-foreground font-semibold">"{selectedMedia.name}"</strong>?
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    This image will be permanently removed from disk and cannot be recovered.
                                </p>
                            </div>
                        ) : null
                    }
                    confirmText="Delete File"
                    loading={deletingMedia}
                    onConfirm={executeDeleteMedia}
                />
            </DialogContent>
        </Dialog>
    );
}
