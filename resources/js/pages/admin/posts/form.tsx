import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    CheckCircle2,
    Compass,
    Eye,
    Globe,
    HelpCircle,
    Image,
    Layers,
    MapPin,
    Monitor,
    Save,
    Search,
    Smartphone,
    Sparkles,
    XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import GutenbergEditor from '@/components/gutenberg-editor';
import MediaLibraryModal from '@/components/media-library-modal';

interface CategoryItem {
    id: number;
    name: string;
}

interface TagItem {
    id: number;
    name: string;
}

interface GeoPreset {
    code: string;
    name: string;
    region: string;
    city: string;
    lat: number;
    lng: number;
    hreflang: string;
}

interface PostData {
    id?: number;
    title: string;
    slug: string;
    category_id: number | null;
    excerpt: string;
    content: string;
    featured_image: string;
    status: string;
    is_featured: boolean;
    published_at: string | null;
    meta_title: string;
    meta_description: string;
    focus_keyword: string;
    canonical_url: string;
    og_image: string;
    schema_type: string;
    geo_target_country: string;
    geo_region: string;
    geo_placename: string;
    geo_latitude: number | null;
    geo_longitude: number | null;
    geo_hreflang_code: string;
    tags?: TagItem[];
}

interface Props {
    post: PostData | null;
    categories: CategoryItem[];
    tags: TagItem[];
    geoPresets: GeoPreset[];
    initialSeoAnalysis?: any;
}

export default function PostForm({ post, categories, tags, geoPresets }: Props) {
    const isEdit = !!post?.id;

    const { data, setData, post: submitPost, put: submitPut, processing, errors } = useForm({
        title: post?.title || '',
        slug: post?.slug || '',
        category_id: post?.category_id ? String(post.category_id) : '',
        excerpt: post?.excerpt || '',
        content: post?.content || '',
        featured_image: post?.featured_image || '',
        status: post?.status || 'draft',
        is_featured: post?.is_featured || false,
        published_at: post?.published_at || '',

        // SEO Fields
        meta_title: post?.meta_title || '',
        meta_description: post?.meta_description || '',
        focus_keyword: post?.focus_keyword || '',
        canonical_url: post?.canonical_url || '',
        og_image: post?.og_image || '',
        schema_type: post?.schema_type || 'Article',

        // GEO Fields
        geo_target_country: post?.geo_target_country || 'ID',
        geo_region: post?.geo_region || 'ID-JK',
        geo_placename: post?.geo_placename || 'Jakarta',
        geo_latitude: post?.geo_latitude ? String(post.geo_latitude) : '-6.2088',
        geo_longitude: post?.geo_longitude ? String(post.geo_longitude) : '106.8456',
        geo_hreflang_code: post?.geo_hreflang_code || 'id-ID',

        tag_ids: post?.tags?.map((t) => t.id) || ([] as number[]),
    });

    const [serpDevice, setSerpDevice] = useState<'desktop' | 'mobile'>('desktop');
    const [previewContent, setPreviewContent] = useState(false);
    const [featuredMediaModalOpen, setFeaturedMediaModalOpen] = useState(false);

    const [isSlugCustomized, setIsSlugCustomized] = useState(isEdit && !!post?.slug);

    function slugify(text: string): string {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/[\s_]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    function handleFeaturedMediaSelect(media: { url: string; alt_text?: string; caption?: string; name?: string }) {
        setData((prev) => ({
            ...prev,
            featured_image: media.url,
            og_image: prev.og_image || media.url,
        }));
    }

    // Auto-generate slug when title changes (unless manually edited by user)
    function handleTitleChange(val: string) {
        setData((prev) => {
            const shouldUpdateSlug = !isSlugCustomized || !prev.slug;
            const newSlug = shouldUpdateSlug ? slugify(val) : prev.slug;
            const shouldUpdateMetaTitle = !prev.meta_title || prev.meta_title === prev.title;
            const newMetaTitle = shouldUpdateMetaTitle ? val : prev.meta_title;

            return {
                ...prev,
                title: val,
                slug: newSlug,
                meta_title: newMetaTitle,
            };
        });
    }

    function handleSlugChange(val: string) {
        setIsSlugCustomized(true);
        setData('slug', slugify(val));
    }

    // Client-side instant SEO Analysis evaluation
    const seoAudit = useMemo(() => {
        const title = data.meta_title || data.title;
        const desc = data.meta_description || data.excerpt;
        const kw = data.focus_keyword.toLowerCase().trim();
        const content = data.content.toLowerCase();
        const words = content.trim().split(/\s+/).filter(Boolean).length;

        let score = 0;
        const checks = [];

        // 1. Keyword Defined
        const hasKw = kw.length > 0;
        if (hasKw) score += 10;
        checks.push({
            label: 'Focus Keyword Defined',
            passed: hasKw,
            detail: hasKw ? `Target: "${data.focus_keyword}"` : 'Please define a target focus keyword',
        });

        // 2. Keyword in Title
        const kwInTitle = hasKw && title.toLowerCase().includes(kw);
        if (kwInTitle) score += 15;
        checks.push({
            label: 'Keyword in SEO Title',
            passed: kwInTitle,
            detail: kwInTitle ? 'Keyword present in title' : 'Include focus keyword in SEO title',
        });

        // 3. Keyword in Description
        const kwInDesc = hasKw && desc.toLowerCase().includes(kw);
        if (kwInDesc) score += 15;
        checks.push({
            label: 'Keyword in Meta Description',
            passed: kwInDesc,
            detail: kwInDesc ? 'Keyword present in description' : 'Include focus keyword in meta description',
        });

        // 4. Title Length (30-65 chars)
        const tLen = title.length;
        const titleLenOk = tLen >= 30 && tLen <= 65;
        if (titleLenOk) score += 15;
        checks.push({
            label: 'SEO Title Length',
            passed: titleLenOk,
            detail: `${tLen}/65 characters (ideal: 30-65)`,
        });

        // 5. Meta Description Length (110-160 chars)
        const dLen = desc.length;
        const descLenOk = dLen >= 110 && dLen <= 165;
        if (descLenOk) score += 15;
        checks.push({
            label: 'Meta Description Length',
            passed: descLenOk,
            detail: `${dLen}/160 characters (ideal: 110-160)`,
        });

        // 6. Content Length (300+ words)
        const contentLenOk = words >= 300;
        if (contentLenOk) score += 15;
        else if (words >= 150) score += 7;
        checks.push({
            label: 'Article Word Count',
            passed: contentLenOk,
            detail: `${words} words (recommended 300+ words)`,
        });

        // 7. Subheadings check (h2 / h3 / ##)
        const hasHeadings = /<h[2-4]/i.test(data.content) || /(^|\n)#{2,4}\s/m.test(data.content);
        if (hasHeadings) score += 15;
        checks.push({
            label: 'Structured Subheadings (H2/H3)',
            passed: hasHeadings,
            detail: hasHeadings ? 'Article has subheadings' : 'Add H2/H3 to organize topic depth',
        });

        const finalScore = Math.min(100, Math.max(10, score));
        return {
            score: finalScore,
            status: finalScore >= 80 ? 'Good' : finalScore >= 55 ? 'Needs Improvement' : 'Poor',
            checks,
            wordCount: words,
        };
    }, [data.title, data.meta_title, data.meta_description, data.excerpt, data.focus_keyword, data.content]);

    // Handle Quick Geo Preset selection
    function applyGeoPreset(preset: GeoPreset) {
        setData((prev) => ({
            ...prev,
            geo_target_country: preset.code,
            geo_region: preset.region,
            geo_placename: preset.city,
            geo_latitude: String(preset.lat),
            geo_longitude: String(preset.lng),
            geo_hreflang_code: preset.hreflang,
        }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (isEdit) {
            submitPut(`/admin/posts/${post.id}`);
        } else {
            submitPost('/admin/posts');
        }
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Posts', href: '/admin/posts' },
                { title: isEdit ? 'Edit Dispatch' : 'New Dispatch', href: '#' },
            ]}
        >
            <Head title={`${isEdit ? 'Edit' : 'Compose'} Dispatch — The Kelana Club`} />

            <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
                {/* Header Action Bar */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b pb-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/admin/posts">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight">
                                {isEdit ? `Editing: ${post.title}` : 'Compose New Journal Dispatch'}
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                Powered by The Kelana Club SEO & GEO Optimization Engines
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Instant SEO Score Badge */}
                        <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5 shadow-sm">
                            <span className="text-xs font-medium text-muted-foreground">SEO Health:</span>
                            <span
                                className={`text-xs font-bold px-1.5 py-0.5 rounded ${seoAudit.score >= 80
                                        ? 'bg-emerald-500/10 text-emerald-600'
                                        : seoAudit.score >= 55
                                            ? 'bg-amber-500/10 text-amber-600'
                                            : 'bg-red-500/10 text-red-600'
                                    }`}
                            >
                                {seoAudit.score}/100
                            </span>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setData('status', data.status === 'published' ? 'draft' : 'published');
                            }}
                        >
                            Status: <span className="font-semibold ml-1 capitalize">{data.status}</span>
                        </Button>

                        <Button type="submit" disabled={processing} size="sm">
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Saving...' : isEdit ? 'Update Article' : 'Publish Article'}
                        </Button>
                    </div>
                </div>

                {/* Main 3-Tab Workspace: Article Body, SEO Optimizer, GEO Optimizer */}
                <Tabs defaultValue="content" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 max-w-md mb-6">
                        <TabsTrigger value="content" className="flex items-center gap-2">
                            <Layers className="h-4 w-4" />
                            <span>Article Body</span>
                        </TabsTrigger>
                        <TabsTrigger value="seo" className="flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            <span>SEO Optimizer</span>
                            <Badge
                                variant="secondary"
                                className={`text-[10px] ml-1 px-1 py-0 ${seoAudit.score >= 80 ? 'text-emerald-600' : 'text-amber-600'
                                    }`}
                            >
                                {seoAudit.score}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="geo" className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            <span>GEO Optimizer</span>
                            <span className="text-[10px] font-mono uppercase bg-muted px-1 rounded ml-1">
                                {data.geo_target_country}
                            </span>
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB 1: ARTICLE CONTENT */}
                    <TabsContent value="content" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column: Title, Excerpt, Content */}
                            <div className="lg:col-span-2 space-y-6">
                                <Card>
                                    <CardContent className="p-6 space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="title" className="text-sm font-medium">
                                                Article Headline / Title <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="title"
                                                value={data.title}
                                                onChange={(e) => handleTitleChange(e.target.value)}
                                                placeholder="e.g. The Architecture of Slow Living in Kyoto..."
                                                className="text-base font-medium"
                                                required
                                            />
                                            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="slug" className="text-xs text-muted-foreground flex items-center gap-2">
                                                    <span>Permalink URL Slug</span>
                                                    {isSlugCustomized && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setIsSlugCustomized(false);
                                                                setData('slug', slugify(data.title));
                                                            }}
                                                            className="text-[10px] text-[#C2410C] hover:underline font-normal"
                                                        >
                                                            (Reset to match title)
                                                        </button>
                                                    )}
                                                </Label>
                                                <span className="font-mono text-[11px] text-muted-foreground">
                                                    /article/{data.slug || 'your-slug'}
                                                </span>
                                            </div>
                                            <Input
                                                id="slug"
                                                value={data.slug}
                                                onChange={(e) => handleSlugChange(e.target.value)}
                                                placeholder="article-url-slug"
                                                className="font-mono text-xs"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="excerpt" className="text-sm font-medium">
                                                Editorial Excerpt (Subhead)
                                            </Label>
                                            <Textarea
                                                id="excerpt"
                                                value={data.excerpt}
                                                onChange={(e) => setData('excerpt', e.target.value)}
                                                placeholder="A brief 1-2 sentence lead paragraph that introduces the article's core thesis..."
                                                className="h-20"
                                            />
                                        </div>

                                        {/* WordPress-Grade Gutenberg Block Editor */}
                                        <div className="space-y-2 pt-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="content" className="text-sm font-medium flex items-center gap-2">
                                                    <span>Article Body</span>
                                                </Label>
                                                <span className="text-xs text-muted-foreground">
                                                    Estimated Read Time: ~{Math.max(1, Math.ceil(seoAudit.wordCount / 200))} min
                                                </span>
                                            </div>

                                            <GutenbergEditor
                                                value={data.content}
                                                onChange={(val) => setData('content', val)}
                                                placeholder="Start writing or press '/' to insert a block (Heading, Photography, Route, Quote)..."
                                            />
                                            {errors.content && <p className="text-xs text-red-500">{errors.content}</p>}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column: Taxonomy, Media & Publishing Settings */}
                            <div className="space-y-6">
                                {/* Featured Image */}
                                <Card>
                                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                        <CardTitle className="text-sm font-medium flex items-center gap-1.5">
                                            <Image className="h-4 w-4" />
                                            Featured Image
                                        </CardTitle>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setFeaturedMediaModalOpen(true)}
                                            className="h-7 text-xs text-[#C2410C] hover:text-[#9A3412]"
                                        >
                                            Media Library
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {data.featured_image ? (
                                            <div className="space-y-2">
                                                <div className="relative aspect-video rounded-lg overflow-hidden border group/feat">
                                                    <img
                                                        src={data.featured_image}
                                                        alt="Featured preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/feat:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="secondary"
                                                            onClick={() => setFeaturedMediaModalOpen(true)}
                                                            className="h-7 text-xs"
                                                        >
                                                            Replace
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => setData('featured_image', '')}
                                                            className="h-7 text-xs"
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                </div>
                                                <Input
                                                    value={data.featured_image}
                                                    onChange={(e) => setData('featured_image', e.target.value)}
                                                    placeholder="Image URL..."
                                                    className="text-xs font-mono"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-video rounded-xl border-2 border-dashed border-[#E7E5E4] dark:border-[#262422] flex flex-col items-center justify-center text-xs text-muted-foreground p-4 text-center bg-muted/10 space-y-2">
                                                <div className="p-2.5 rounded-full bg-muted text-[#C2410C]">
                                                    <Image className="h-5 w-5" />
                                                </div>
                                                <span className="font-semibold text-foreground text-xs">
                                                    No featured banner set
                                                </span>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={() => setFeaturedMediaModalOpen(true)}
                                                    className="h-8 text-xs bg-[#1C1917] hover:bg-[#292524] text-white dark:bg-white dark:text-[#1C1917]"
                                                >
                                                    Choose from Media Library
                                                </Button>
                                                <div className="pt-1 w-full">
                                                    <Input
                                                        value={data.featured_image}
                                                        onChange={(e) => setData('featured_image', e.target.value)}
                                                        placeholder="Or paste image URL here..."
                                                        className="text-[11px] h-7 font-mono text-center"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Category & Publishing */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium">Categorization & Placement</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs">Category</Label>
                                            <Select
                                                value={data.category_id}
                                                onValueChange={(val) => setData('category_id', val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((c) => (
                                                        <SelectItem key={c.id} value={String(c.id)}>
                                                            {c.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="flex items-center justify-between border-t pt-3">
                                            <div className="space-y-0.5">
                                                <Label className="text-xs font-medium">Lead Story (Featured)</Label>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Displays in large hero section on home page
                                                </p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={data.is_featured}
                                                onChange={(e) => setData('is_featured', e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                        </div>

                                        <div className="space-y-2 border-t pt-3">
                                            <Label className="text-xs">Publish Status</Label>
                                            <Select
                                                value={data.status}
                                                onValueChange={(val) => setData('status', val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="draft">Draft (Private)</SelectItem>
                                                    <SelectItem value="published">Published (Public)</SelectItem>
                                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* TAB 2: SEO OPTIMIZER (WordPress / Yoast / RankMath Style) */}
                    <TabsContent value="seo" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left 2 Cols: Google SERP Preview & Meta Settings */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Live Google Search SERP Snippet Preview */}
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                                        <div>
                                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                                <Search className="h-4 w-4 text-blue-500" />
                                                Google Search Snippet Preview
                                            </CardTitle>
                                            <CardDescription>
                                                How your article will appear to readers on Google & Bing search result pages
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center rounded-lg border p-1 bg-muted/40">
                                            <Button
                                                type="button"
                                                variant={serpDevice === 'desktop' ? 'secondary' : 'ghost'}
                                                size="sm"
                                                onClick={() => setSerpDevice('desktop')}
                                                className="h-7 px-2 text-xs"
                                            >
                                                <Monitor className="h-3.5 w-3.5 mr-1" /> Desktop
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={serpDevice === 'mobile' ? 'secondary' : 'ghost'}
                                                size="sm"
                                                onClick={() => setSerpDevice('mobile')}
                                                className="h-7 px-2 text-xs"
                                            >
                                                <Smartphone className="h-3.5 w-3.5 mr-1" /> Mobile
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-2">
                                        {/* Mock Google Result Card */}
                                        <div
                                            className={`rounded-xl border bg-white dark:bg-zinc-900 p-4 transition-all shadow-sm ${serpDevice === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                                                <div className="h-5 w-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-serif text-[10px] font-bold">
                                                    K
                                                </div>
                                                <div className="truncate">
                                                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">The Kelana Club</span>
                                                    <span className="text-zinc-400 mx-1">›</span>
                                                    <span className="font-mono text-[11px]">
                                                        article › {data.slug || 'your-slug'}
                                                    </span>
                                                </div>
                                            </div>

                                            <h3 className="text-base font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer line-clamp-1 mb-1">
                                                {data.meta_title || data.title || 'Untitled Article Headline — The Kelana Club'}
                                            </h3>

                                            <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                                                <span className="text-zinc-400 font-mono text-[10px] mr-1">
                                                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} —
                                                </span>
                                                {data.meta_description ||
                                                    data.excerpt ||
                                                    'Please enter an optimized meta description to provide search engines with an informative overview of this essay.'}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Meta Tag Inputs */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-semibold">Search Engine Metadata</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="focus_keyword" className="text-xs font-semibold">
                                                    Focus Target Keyword <span className="text-blue-500 font-normal">(Primary search term)</span>
                                                </Label>
                                            </div>
                                            <Input
                                                id="focus_keyword"
                                                value={data.focus_keyword}
                                                onChange={(e) => setData('focus_keyword', e.target.value)}
                                                placeholder="e.g. Quiet Software Philosophy"
                                                className="text-sm"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="meta_title" className="text-xs font-semibold">
                                                    SEO Meta Title
                                                </Label>
                                                <span className={`text-[11px] font-mono ${data.meta_title.length >= 30 && data.meta_title.length <= 65
                                                        ? 'text-emerald-600'
                                                        : 'text-amber-600'
                                                    }`}>
                                                    {data.meta_title.length}/65 chars
                                                </span>
                                            </div>
                                            <Input
                                                id="meta_title"
                                                value={data.meta_title}
                                                onChange={(e) => setData('meta_title', e.target.value)}
                                                placeholder="Custom title tag for search engines..."
                                                className="text-sm"
                                            />
                                            {/* Progress bar */}
                                            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all ${data.meta_title.length >= 30 && data.meta_title.length <= 65
                                                            ? 'bg-emerald-500'
                                                            : 'bg-amber-500'
                                                        }`}
                                                    style={{ width: `${Math.min(100, (data.meta_title.length / 65) * 100)}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="meta_description" className="text-xs font-semibold">
                                                    SEO Meta Description
                                                </Label>
                                                <span className={`text-[11px] font-mono ${data.meta_description.length >= 110 && data.meta_description.length <= 165
                                                        ? 'text-emerald-600'
                                                        : 'text-amber-600'
                                                    }`}>
                                                    {data.meta_description.length}/160 chars
                                                </span>
                                            </div>
                                            <Textarea
                                                id="meta_description"
                                                value={data.meta_description}
                                                onChange={(e) => setData('meta_description', e.target.value)}
                                                placeholder="Provide an enticing summary for Google search result snippets..."
                                                className="h-20 text-xs"
                                            />
                                            {/* Progress bar */}
                                            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all ${data.meta_description.length >= 110 && data.meta_description.length <= 165
                                                            ? 'bg-emerald-500'
                                                            : 'bg-amber-500'
                                                        }`}
                                                    style={{ width: `${Math.min(100, (data.meta_description.length / 160) * 100)}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs">Schema.org Structured Type</Label>
                                                <Select
                                                    value={data.schema_type}
                                                    onValueChange={(val) => setData('schema_type', val)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Article">Article (Standard)</SelectItem>
                                                        <SelectItem value="NewsArticle">NewsArticle (Google News)</SelectItem>
                                                        <SelectItem value="BlogPosting">BlogPosting</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="canonical_url" className="text-xs">Canonical URL (Optional)</Label>
                                                <Input
                                                    id="canonical_url"
                                                    value={data.canonical_url}
                                                    onChange={(e) => setData('canonical_url', e.target.value)}
                                                    placeholder="https://..."
                                                    className="text-xs"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Col: Live SEO Health Checklist */}
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-semibold flex items-center justify-between">
                                            <span>Real-time SEO Audit</span>
                                            <Badge
                                                className={
                                                    seoAudit.score >= 80
                                                        ? 'bg-emerald-500/10 text-emerald-600'
                                                        : seoAudit.score >= 55
                                                            ? 'bg-amber-500/10 text-amber-600'
                                                            : 'bg-red-500/10 text-red-600'
                                                }
                                            >
                                                {seoAudit.status} ({seoAudit.score}/100)
                                            </Badge>
                                        </CardTitle>
                                        <CardDescription>
                                            Real-time checklist based on search engine ranking algorithms
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {seoAudit.checks.map((c, i) => (
                                            <div
                                                key={i}
                                                className="flex items-start gap-2.5 p-2 rounded-lg border bg-muted/20 text-xs"
                                            >
                                                {c.passed ? (
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                                )}
                                                <div className="space-y-0.5 min-w-0">
                                                    <div className="font-medium text-foreground">{c.label}</div>
                                                    <div className="text-muted-foreground text-[11px]">{c.detail}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* TAB 3: GEO OPTIMIZER */}
                    <TabsContent value="geo" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left 2 Cols: Geographic Targeting Settings */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Quick Country Presets Bar */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-amber-500" />
                                            Quick Regional Presets
                                        </CardTitle>
                                        <CardDescription>
                                            Click any preset to automatically configure target country, coordinates, and hreflang codes
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {geoPresets.map((preset) => (
                                                <Button
                                                    key={preset.code}
                                                    type="button"
                                                    variant={data.geo_target_country === preset.code ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => applyGeoPreset(preset)}
                                                    className="text-xs"
                                                >
                                                    <span className="font-mono mr-1">[{preset.code}]</span>
                                                    {preset.name}
                                                </Button>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-semibold">Geographic Coordinates & Targeting</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="geo_target_country" className="text-xs">
                                                    Target Country (ISO-3166-1 alpha-2)
                                                </Label>
                                                <Input
                                                    id="geo_target_country"
                                                    value={data.geo_target_country}
                                                    onChange={(e) => setData('geo_target_country', e.target.value.toUpperCase())}
                                                    placeholder="e.g. ID, US, JP, ALL"
                                                    className="font-mono text-xs uppercase"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="geo_region" className="text-xs">
                                                    Region Code (ISO-3166-2)
                                                </Label>
                                                <Input
                                                    id="geo_region"
                                                    value={data.geo_region}
                                                    onChange={(e) => setData('geo_region', e.target.value)}
                                                    placeholder="e.g. ID-JK, US-NY"
                                                    className="font-mono text-xs"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="geo_placename" className="text-xs">
                                                    City / Placename
                                                </Label>
                                                <Input
                                                    id="geo_placename"
                                                    value={data.geo_placename}
                                                    onChange={(e) => setData('geo_placename', e.target.value)}
                                                    placeholder="e.g. Jakarta, Kyoto, New York"
                                                    className="text-xs"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="geo_hreflang_code" className="text-xs">
                                                    Hreflang Locale Code
                                                </Label>
                                                <Input
                                                    id="geo_hreflang_code"
                                                    value={data.geo_hreflang_code}
                                                    onChange={(e) => setData('geo_hreflang_code', e.target.value)}
                                                    placeholder="e.g. id-ID, en-US, ja-JP"
                                                    className="font-mono text-xs"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="geo_latitude" className="text-xs">
                                                    Latitude Coordinate
                                                </Label>
                                                <Input
                                                    id="geo_latitude"
                                                    value={data.geo_latitude || ''}
                                                    onChange={(e) => setData('geo_latitude', e.target.value)}
                                                    placeholder="-6.2088"
                                                    className="font-mono text-xs"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="geo_longitude" className="text-xs">
                                                    Longitude Coordinate
                                                </Label>
                                                <Input
                                                    id="geo_longitude"
                                                    value={data.geo_longitude || ''}
                                                    onChange={(e) => setData('geo_longitude', e.target.value)}
                                                    placeholder="106.8456"
                                                    className="font-mono text-xs"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Col: Live Generated GEO Meta Tags Preview */}
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-semibold">Generated GEO Meta Tags</CardTitle>
                                        <CardDescription>
                                            Injected automatically into the HTML &lt;head&gt; for geo-location search engines
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="rounded-lg bg-zinc-950 p-3 text-[11px] font-mono text-zinc-300 space-y-1.5 overflow-x-auto border border-zinc-800">
                                            <p className="text-zinc-500">// Geotagging Meta Specifications</p>
                                            <p>
                                                &lt;<span className="text-blue-400">meta</span>{' '}
                                                <span className="text-amber-400">name</span>="geo.region"{' '}
                                                <span className="text-amber-400">content</span>="
                                                <span className="text-emerald-400">{data.geo_region || 'N/A'}</span>" /&gt;
                                            </p>
                                            <p>
                                                &lt;<span className="text-blue-400">meta</span>{' '}
                                                <span className="text-amber-400">name</span>="geo.placename"{' '}
                                                <span className="text-amber-400">content</span>="
                                                <span className="text-emerald-400">{data.geo_placename || 'N/A'}</span>" /&gt;
                                            </p>
                                            <p>
                                                &lt;<span className="text-blue-400">meta</span>{' '}
                                                <span className="text-amber-400">name</span>="geo.position"{' '}
                                                <span className="text-amber-400">content</span>="
                                                <span className="text-emerald-400">
                                                    {data.geo_latitude};{data.geo_longitude}
                                                </span>" /&gt;
                                            </p>
                                            <p>
                                                &lt;<span className="text-blue-400">meta</span>{' '}
                                                <span className="text-amber-400">name</span>="ICBM"{' '}
                                                <span className="text-amber-400">content</span>="
                                                <span className="text-emerald-400">
                                                    {data.geo_latitude}, {data.geo_longitude}
                                                </span>" /&gt;
                                            </p>
                                            <p>
                                                &lt;<span className="text-blue-400">link</span>{' '}
                                                <span className="text-amber-400">rel</span>="alternate"{' '}
                                                <span className="text-amber-400">hreflang</span>="
                                                <span className="text-emerald-400">{data.geo_hreflang_code}</span>" /&gt;
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </form>

            {/* Featured Image Media Library Picker Modal */}
            <MediaLibraryModal
                open={featuredMediaModalOpen}
                onOpenChange={setFeaturedMediaModalOpen}
                onSelect={handleFeaturedMediaSelect}
                title="Select Featured Article Banner"
                selectButtonText="Set as Featured Image"
            />
        </AppLayout>
    );
}
