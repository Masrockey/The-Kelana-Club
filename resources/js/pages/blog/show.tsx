import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Bookmark,
    Check,
    Clock,
    Compass,
    Copy,
    Heart,
    Info,
    AlertCircle,
    Linkedin,
    MapPin,
    MessageSquare,
    Rss,
    Send,
    Share2,
    Sparkles,
    Twitter,
} from 'lucide-react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CommentItem {
    id: number;
    author_name: string;
    author_website: string | null;
    content: string;
    created_at: string;
    replies?: CommentItem[];
}

interface PostDetail {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featured_image: string | null;
    published_at: string;
    read_time_minutes: number;
    views_count: number;
    meta_title: string | null;
    meta_description: string | null;
    focus_keyword: string | null;
    canonical_url: string | null;
    og_image: string | null;
    schema_type: string;
    geo_target_country: string;
    geo_region: string | null;
    geo_placename: string | null;
    geo_latitude: number | null;
    geo_longitude: number | null;
    geo_hreflang_code: string;
    category?: {
        name: string;
        slug: string;
        color: string;
    };
    user?: {
        name: string;
        email: string;
    };
    tags?: {
        name: string;
        slug: string;
    }[];
    comments: CommentItem[];
}

interface Props {
    post: PostDetail;
    relatedPosts: any[];
    articleSchema: any;
    breadcrumbSchema: any;
    geoAiSchema?: any;
    visitorGeo: any;
    hcaptchaSiteKey?: string;
}

export default function BlogShow({
    post,
    relatedPosts,
    articleSchema,
    breadcrumbSchema,
    geoAiSchema,
    visitorGeo,
    hcaptchaSiteKey,
}: Props) {
    const [scrollProgress, setScrollProgress] = useState(0);
    const [copied, setCopied] = useState(false);
    const [replyToId, setReplyToId] = useState<number | null>(null);
    const hcaptchaRef = useRef<HCaptcha | null>(null);

    // Reading scroll progress tracker
    useEffect(() => {
        function handleScroll() {
            const totalScroll = document.documentElement.scrollTop;
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scroll = `${(totalScroll / windowHeight) * 100}%`;
            setScrollProgress(Math.min(100, Math.max(0, (totalScroll / windowHeight) * 100)));
        }

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Comment form
    const { data, setData, post: submitComment, processing, reset, errors, wasSuccessful } = useForm({
        author_name: '',
        author_email: '',
        author_website: '',
        content: '',
        parent_id: '' as string | number,
        'h-captcha-response': '',
    });

    function handleCommentSubmit(e: React.FormEvent) {
        e.preventDefault();
        submitComment(`/article/${post.slug}/comment`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                hcaptchaRef.current?.resetCaptcha();
                setData('h-captcha-response', '');
                setReplyToId(null);
            },
        });
    }

    function copyArticleLink() {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareTitle = post.meta_title || post.title;

    // Format content with drop cap on first letter
    const cleanContent = post.content || '';
    const formattedDate = new Date(post.published_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#121110] text-[#1C1917] dark:text-[#E7E5E4] antialiased selection:bg-[#C2410C] selection:text-white font-sans transition-colors duration-200">
            {/* Real-time SEO and GEO <Head> Injection */}
            <Head>
                <title>{`${post.meta_title || post.title} — The Kelana Club`}</title>
                <meta name="description" content={post.meta_description || post.excerpt} />
                {post.focus_keyword && <meta name="keywords" content={post.focus_keyword} />}
                <link rel="canonical" href={post.canonical_url || `${typeof window !== 'undefined' ? window.location.origin : ''}/article/${post.slug}`} />

                {/* OpenGraph Protocol */}
                <meta property="og:title" content={post.meta_title || post.title} />
                <meta property="og:description" content={post.meta_description || post.excerpt} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={`${typeof window !== 'undefined' ? window.location.origin : ''}/article/${post.slug}`} />
                {post.og_image || post.featured_image ? (
                    <meta property="og:image" content={post.og_image || post.featured_image || ''} />
                ) : null}

                {/* Twitter Cards */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={post.meta_title || post.title} />
                <meta name="twitter:description" content={post.meta_description || post.excerpt} />
                {post.og_image || post.featured_image ? (
                    <meta name="twitter:image" content={post.og_image || post.featured_image || ''} />
                ) : null}

                {/* GEO Optimizer Meta Tags */}
                {post.geo_region && <meta name="geo.region" content={post.geo_region} />}
                {post.geo_placename && <meta name="geo.placename" content={post.geo_placename} />}
                {post.geo_latitude && post.geo_longitude && (
                    <>
                        <meta name="geo.position" content={`${post.geo_latitude};${post.geo_longitude}`} />
                        <meta name="ICBM" content={`${post.geo_latitude}, ${post.geo_longitude}`} />
                    </>
                )}
                {post.geo_hreflang_code && (
                    <link rel="alternate" hrefLang={post.geo_hreflang_code} href={`${typeof window !== 'undefined' ? window.location.origin : ''}/article/${post.slug}`} />
                )}

                {/* Schema.org Article & Breadcrumbs JSON-LD */}
                <script type="application/ld+json">
                    {JSON.stringify(articleSchema)}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify(breadcrumbSchema)}
                </script>
                {geoAiSchema && (
                    <script type="application/ld+json">
                        {JSON.stringify(geoAiSchema)}
                    </script>
                )}
            </Head>

            {/* Reading Scroll Progress Sticky Bar */}
            <div
                className="fixed top-0 left-0 h-1 bg-[#C2410C] z-50 transition-all duration-75 ease-out"
                style={{ width: `${scrollProgress}%` }}
            />

            {/* Top Navigation */}
            <header className="border-b border-[#E7E5E4] dark:border-[#262422] sticky top-0 bg-[#FDFBF7]/90 dark:bg-[#121110]/90 backdrop-blur z-40">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between text-xs">
                    <Link
                        href="/"
                        className="flex items-center gap-2.5 text-[#78716C] hover:text-[#1C1917] dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <img
                            src="/logo.png"
                            alt="The Kelana Club"
                            className="size-6 rounded object-cover shadow-sm border border-red-900/20"
                        />
                        <span className="font-serif font-bold text-xs uppercase tracking-tight text-[#1C1917] dark:text-white">
                            The Kelana Club
                        </span>
                        <span className="hidden md:inline font-mono text-[9px] uppercase tracking-wider text-[#9B1C1C] dark:text-[#EF4444] font-semibold">
                            • Real Routes
                        </span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <span className="hidden sm:inline font-mono text-[11px] text-[#A8A29E]">
                            ~{post.read_time_minutes} min read
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={copyArticleLink}
                            className="h-7 text-xs font-mono"
                        >
                            {copied ? <Check className="h-3 w-3 mr-1 text-emerald-500" /> : <Copy className="h-3 w-3 mr-1" />}
                            {copied ? 'Copied' : 'Share'}
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Article Container */}
            <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
                {/* Meta Breadcrumb & GEO dispatch tag */}
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#78716C] dark:text-[#A8A29E]">
                        <Link href="/" className="hover:underline">Archive</Link>
                        <span>›</span>
                        {post.category && (
                            <>
                                <Link
                                    href={`/category/${post.category.slug}`}
                                    className="font-semibold uppercase tracking-wider hover:underline"
                                    style={{ color: post.category.color }}
                                >
                                    {post.category.name}
                                </Link>
                                <span>›</span>
                            </>
                        )}
                        <span className="truncate max-w-[200px]">{post.title}</span>
                    </div>

                    {/* GEO Dispatch Location Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#E7E5E4] dark:border-[#262422] bg-[#FAF7F2] dark:bg-[#181716] text-[11px] font-mono text-[#B45309] dark:text-[#F59E0B]">
                        <MapPin className="h-3 w-3" />
                        <span>
                            Dispatched from {post.geo_placename || 'Lombok'}, {post.geo_target_country}
                            {post.geo_latitude && ` • [${post.geo_latitude.toFixed(2)}°, ${post.geo_longitude?.toFixed(2)}°]`}
                        </span>
                    </div>
                </div>

                {/* Monumental Article Headline */}
                <h1 className="font-serif text-3xl sm:text-5xl md:text-5xl font-bold tracking-tight text-[#1C1917] dark:text-white leading-[1.15]">
                    {post.title}
                </h1>

                {/* Subtitle / Excerpt */}
                {post.excerpt && (
                    <p className="font-serif italic text-lg sm:text-xl text-[#57534E] dark:text-[#A8A29E] leading-relaxed border-l-2 border-[#C2410C] pl-4">
                        {post.excerpt}
                    </p>
                )}

                {/* Byline and Author Bar */}
                <div className="flex items-center justify-between border-y border-[#E7E5E4] dark:border-[#262422] py-4 text-xs">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#1C1917] dark:bg-white text-white dark:text-[#1C1917] font-serif font-bold text-sm flex items-center justify-center">
                            {post.user?.name ? post.user.name.charAt(0) : 'K'}
                        </div>
                        <div>
                            <div className="font-semibold text-foreground">{post.user?.name || 'Raden Kelana'}</div>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                                <span>{formattedDate}</span>
                                <span>•</span>
                                <span>{post.read_time_minutes} min read</span>
                                <span>•</span>
                                <span>{post.views_count.toLocaleString()} reads</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg border hover:bg-muted/40 transition-colors"
                            title="Share to X"
                        >
                            <Twitter className="h-3.5 w-3.5" />
                        </a>
                        <a
                            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg border hover:bg-muted/40 transition-colors"
                            title="Share to LinkedIn"
                        >
                            <Linkedin className="h-3.5 w-3.5" />
                        </a>
                    </div>
                </div>

                {/* Featured Photography Banner */}
                {post.featured_image && (
                    <div className="rounded-xl overflow-hidden border border-[#E7E5E4] dark:border-[#262422] aspect-[16/10] bg-[#E7E5E4] dark:bg-[#262422]">
                        <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Generative Engine Optimization (GEO) Key Direct Answer / Field Executive Summary */}
                {post.excerpt && (
                    <div className="geo-ai-summary ai-direct-answer rounded-xl border border-amber-600/20 bg-amber-500/5 p-4 sm:p-5 space-y-2.5">
                        <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-400">
                            <span className="uppercase tracking-wider font-mono text-[11px]">Field Intelligence</span>
                        </div>
                        <p className="font-serif italic text-sm leading-relaxed text-[#58413f] dark:text-[#d6c7b2]">
                            {post.excerpt}
                        </p>
                    </div>
                )}

                {/* Article Prose Body with Gutenberg Blocks & Drop Cap Styling */}
                <div className="pt-4 font-serif text-base sm:text-lg leading-[1.8] text-[#292524] dark:text-[#D6D3D1] space-y-6">
                    {cleanContent.split(/\n{2,}/).map((block, idx) => {
                        const trimmed = block.trim();
                        if (!trimmed) return null;

                        // 1. ROUTE PASSPORT BLOCK: :::route ... :::
                        if (trimmed.startsWith(':::route') && trimmed.includes(':::')) {
                            const lines = trimmed
                                .replace(/^:::route\s*/i, '')
                                .replace(/:::$/, '')
                                .split('\n')
                                .map((l) => l.trim())
                                .filter(Boolean);

                            const routeData: Record<string, string> = {};
                            lines.forEach((l) => {
                                const [k, ...v] = l.split(':');
                                if (k && v.length) routeData[k.trim().toLowerCase()] = v.join(':').trim();
                            });

                            return (
                                <aside
                                    key={idx}
                                    className="my-8 rounded-xl border border-[#C2410C]/30 bg-[#FAF7F2] dark:bg-[#181716] p-6 shadow-sm not-prose"
                                >
                                    <div className="flex items-center gap-2.5 pb-4 border-b border-[#E7E5E4] dark:border-[#262422]">
                                        <div className="p-2 rounded-lg bg-[#C2410C]/10 text-[#C2410C]">
                                            <Compass className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <span className="font-mono text-[10px] uppercase tracking-wider text-[#C2410C] font-semibold block">
                                                Overland Route Waypoint
                                            </span>
                                            <h4 className="font-serif text-lg font-bold text-[#1C1917] dark:text-white leading-tight">
                                                {routeData.route || routeData.name || 'Expedition Route Log'}
                                            </h4>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-[#E7E5E4] dark:border-[#262422] text-xs">
                                        {routeData.distance && (
                                            <div>
                                                <span className="font-mono text-[10px] uppercase text-[#78716C] dark:text-[#A8A29E] block">
                                                    Distance
                                                </span>
                                                <span className="font-semibold text-sm text-[#1C1917] dark:text-white font-mono">
                                                    {routeData.distance}
                                                </span>
                                            </div>
                                        )}
                                        {routeData.elevation && (
                                            <div>
                                                <span className="font-mono text-[10px] uppercase text-[#78716C] dark:text-[#A8A29E] block">
                                                    Max Elevation
                                                </span>
                                                <span className="font-semibold text-sm text-[#1C1917] dark:text-white font-mono">
                                                    {routeData.elevation}
                                                </span>
                                            </div>
                                        )}
                                        {routeData.terrain && (
                                            <div>
                                                <span className="font-mono text-[10px] uppercase text-[#78716C] dark:text-[#A8A29E] block">
                                                    Surface Terrain
                                                </span>
                                                <span className="font-semibold text-xs text-[#1C1917] dark:text-white">
                                                    {routeData.terrain}
                                                </span>
                                            </div>
                                        )}
                                        {routeData.season && (
                                            <div>
                                                <span className="font-mono text-[10px] uppercase text-[#78716C] dark:text-[#A8A29E] block">
                                                    Best Season
                                                </span>
                                                <span className="font-semibold text-xs text-[#1C1917] dark:text-white">
                                                    {routeData.season}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {routeData.highlights && (
                                        <div className="pt-3 text-xs">
                                            <span className="font-mono text-[10px] uppercase text-[#78716C] dark:text-[#A8A29E] block mb-0.5">
                                                Key Waypoints & Field Stops:
                                            </span>
                                            <p className="font-serif italic text-sm text-[#44403C] dark:text-[#D6D3D1]">
                                                {routeData.highlights}
                                            </p>
                                        </div>
                                    )}
                                </aside>
                            );
                        }

                        // 2. CALLOUT / FIELD NOTE: :::callout[type]{title="..."} ... :::
                        if (trimmed.startsWith(':::callout') && trimmed.includes(':::')) {
                            const headerMatch = trimmed.match(/^:::callout(?:\[(info|tip|warning)\])?(?:\s*\{title="([^"]*)"\})?/i);
                            const calloutType = headerMatch?.[1]?.toLowerCase() || 'info';
                            const title = headerMatch?.[2] || (calloutType === 'warning' ? 'Travel Advisory' : 'Field Note');
                            const body = trimmed
                                .replace(/^:::callout[^\n]*\n?/, '')
                                .replace(/:::\s*$/, '')
                                .trim();

                            const isWarning = calloutType === 'warning';
                            const isTip = calloutType === 'tip';

                            return (
                                <div
                                    key={idx}
                                    className={`my-6 rounded-xl border p-5 text-sm not-prose ${isWarning
                                            ? 'border-amber-500/40 bg-amber-500/5 text-amber-950 dark:text-amber-100'
                                            : isTip
                                                ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-950 dark:text-emerald-100'
                                                : 'border-sky-500/40 bg-sky-500/5 text-sky-950 dark:text-sky-100'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 font-bold mb-1.5 text-xs font-mono uppercase tracking-wider">
                                        {isWarning ? (
                                            <AlertCircle className="h-4 w-4 text-amber-600" />
                                        ) : isTip ? (
                                            <Compass className="h-4 w-4 text-emerald-600" />
                                        ) : (
                                            <Info className="h-4 w-4 text-sky-600" />
                                        )}
                                        <span>{title}</span>
                                    </div>
                                    <p className="font-serif text-sm leading-relaxed">{body}</p>
                                </div>
                            );
                        }

                        // 3. SEPARATOR: ---
                        if (/^(?:---|___|\*\*\*)$/.test(trimmed)) {
                            return (
                                <div key={idx} className="my-10 flex items-center justify-center gap-3">
                                    <div className="h-px bg-[#E7E5E4] dark:bg-[#262422] flex-1 max-w-xs" />
                                    <span className="font-serif text-xs text-[#C2410C]">✦</span>
                                    <div className="h-px bg-[#E7E5E4] dark:bg-[#262422] flex-1 max-w-xs" />
                                </div>
                            );
                        }

                        // 4. INLINE IMAGE: ![alt](url "caption") or ![alt](url)
                        const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)$/s);
                        if (imgMatch) {
                            const alt = imgMatch[1];
                            const url = imgMatch[2];
                            const caption = imgMatch[3] || alt;
                            return (
                                <figure key={idx} className="my-8 rounded-xl overflow-hidden border border-[#E7E5E4] dark:border-[#262422] bg-[#FAF7F2] dark:bg-[#181716] not-prose">
                                    <img
                                        src={url}
                                        alt={alt}
                                        className="w-full max-h-[540px] object-cover"
                                        loading="lazy"
                                    />
                                    {caption && (
                                        <figcaption className="p-3 text-center font-serif italic text-xs text-[#78716C] dark:text-[#A8A29E] border-t border-[#E7E5E4] dark:border-[#262422]">
                                            {caption}
                                        </figcaption>
                                    )}
                                </figure>
                            );
                        }

                        // 5. HEADINGS H2, H3, H4
                        if (trimmed.startsWith('## ')) {
                            return (
                                <h2
                                    key={idx}
                                    className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1917] dark:text-white pt-8 pb-2"
                                >
                                    {trimmed.replace(/^##\s+/, '')}
                                </h2>
                            );
                        }
                        if (trimmed.startsWith('### ')) {
                            return (
                                <h3
                                    key={idx}
                                    className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-[#1C1917] dark:text-white pt-6 pb-1"
                                >
                                    {trimmed.replace(/^###\s+/, '')}
                                </h3>
                            );
                        }
                        if (trimmed.startsWith('#### ')) {
                            return (
                                <h4
                                    key={idx}
                                    className="font-serif text-lg sm:text-xl font-semibold tracking-tight text-[#1C1917] dark:text-white pt-4 pb-1"
                                >
                                    {trimmed.replace(/^####\s+/, '')}
                                </h4>
                            );
                        }

                        // 6. BLOCKQUOTE
                        if (trimmed.startsWith('> ')) {
                            const quoteLines = trimmed
                                .split('\n')
                                .map((l) => l.replace(/^>\s*/, '').trim())
                                .filter(Boolean);

                            let citation = '';
                            const quoteBody: string[] = [];
                            quoteLines.forEach((l) => {
                                if (l.startsWith('— ') || l.startsWith('-- ')) {
                                    citation = l.replace(/^[—-]\s*/, '').trim();
                                } else {
                                    quoteBody.push(l);
                                }
                            });

                            return (
                                <blockquote
                                    key={idx}
                                    className="border-l-4 border-[#C2410C] pl-6 my-8 italic font-serif text-lg text-[#57534E] dark:text-[#A8A29E] bg-[#FAF7F2] dark:bg-[#181716] p-5 rounded-r-xl"
                                >
                                    <p className="leading-relaxed">&ldquo;{quoteBody.join(' ')}&rdquo;</p>
                                    {citation && (
                                        <cite className="block text-xs font-serif not-italic font-bold text-[#1C1917] dark:text-white mt-2">
                                            — {citation}
                                        </cite>
                                    )}
                                </blockquote>
                            );
                        }

                        // 7. LISTS (Bullet / Numbered)
                        const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
                        if (lines.length > 0 && lines.every((l) => /^[-*+]\s/.test(l))) {
                            return (
                                <ul key={idx} className="my-6 space-y-2 pl-6 list-disc marker:text-[#C2410C] font-serif text-base">
                                    {lines.map((item, itemIdx) => (
                                        <li key={itemIdx}>{item.replace(/^[-*+]\s+/, '')}</li>
                                    ))}
                                </ul>
                            );
                        }
                        if (lines.length > 0 && lines.every((l) => /^\d+\.\s/.test(l))) {
                            return (
                                <ol key={idx} className="my-6 space-y-2 pl-6 list-decimal marker:font-mono marker:text-xs marker:text-[#C2410C] font-serif text-base">
                                    {lines.map((item, itemIdx) => (
                                        <li key={itemIdx}>{item.replace(/^\d+\.\s+/, '')}</li>
                                    ))}
                                </ol>
                            );
                        }

                        // 8. FIRST PARAGRAPH DROP CAP
                        if (idx === 0) {
                            return (
                                <p
                                    key={idx}
                                    className="first-letter:font-serif first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:leading-none first-letter:text-[#C2410C]"
                                >
                                    {trimmed}
                                </p>
                            );
                        }

                        return <p key={idx}>{trimmed}</p>;
                    })}
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-[#E7E5E4] dark:border-[#262422]">
                        <span className="text-xs font-mono text-[#A8A29E] mr-1">Filed Under:</span>
                        {post.tags.map((t) => (
                            <Link
                                key={t.slug}
                                href={`/tag/${t.slug}`}
                                className="px-2.5 py-1 rounded-full border border-[#E7E5E4] dark:border-[#262422] text-xs font-mono text-[#78716C] hover:border-[#C2410C] hover:text-[#C2410C] transition-colors"
                            >
                                #{t.name}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Colophon & Author Card */}
                <div className="rounded-xl border border-[#E7E5E4] dark:border-[#262422] p-6 bg-[#FAF7F2] dark:bg-[#181716] flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-[#1C1917] dark:bg-white text-white dark:text-[#1C1917] font-serif font-bold text-lg flex items-center justify-center shrink-0">
                        {post.user?.name ? post.user.name.charAt(0) : 'K'}
                    </div>
                    <div className="space-y-1 text-xs">
                        <div className="font-semibold text-sm text-foreground">{post.user?.name || 'Raden Kelana'}</div>
                        <p className="text-muted-foreground font-serif leading-relaxed">
                            Editor-in-chief of The Kelana Club. Writing on the intersections of urban topography, silent software, archipelagic history, and slow living.
                        </p>
                    </div>
                </div>

                {/* Related Dispatches */}
                {relatedPosts.length > 0 && (
                    <div className="space-y-6 pt-10 border-t border-[#E7E5E4] dark:border-[#262422]">
                        <h3 className="font-serif text-2xl font-bold tracking-tight">Related Dispatches</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {relatedPosts.map((rp) => (
                                <Link
                                    key={rp.id}
                                    href={`/article/${rp.slug}`}
                                    className="p-4 rounded-xl border border-[#E7E5E4] dark:border-[#262422] bg-[#FAF7F2] dark:bg-[#181716] hover:border-[#C2410C]/40 transition-colors group space-y-2 block"
                                >
                                    {rp.category && (
                                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#C2410C]">
                                            {rp.category.name}
                                        </span>
                                    )}
                                    <h4 className="font-serif text-sm font-bold line-clamp-2 text-foreground group-hover:text-[#C2410C] transition-colors">
                                        {rp.title}
                                    </h4>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Reader Commentary Section */}
                <div className="pt-12 border-t border-[#E7E5E4] dark:border-[#262422] space-y-8" id="comments">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-[#C2410C]" />
                            <h3 className="font-serif text-2xl font-bold tracking-tight">
                                Reader Commentary ({post.comments.length})
                            </h3>
                        </div>
                        <span className="text-xs font-mono text-[#A8A29E]">Moderated for Civil Discourse</span>
                    </div>

                    {/* Existing Comments */}
                    <div className="space-y-4">
                        {post.comments.length === 0 ? (
                            <p className="text-xs font-serif italic text-muted-foreground py-4">
                                No reader commentary yet. Be the first to share your thoughts.
                            </p>
                        ) : (
                            post.comments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className="p-5 rounded-xl border border-[#E7E5E4] dark:border-[#262422] bg-[#FAF7F2] dark:bg-[#181716] space-y-3"
                                >
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-foreground">{comment.author_name}</span>
                                            {comment.author_website && (
                                                <a
                                                    href={comment.author_website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-muted-foreground hover:underline font-mono text-[10px]"
                                                >
                                                    [website]
                                                </a>
                                            )}
                                        </div>
                                        <span className="font-mono text-[10px] text-muted-foreground">
                                            {new Date(comment.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <p className="text-sm font-serif leading-relaxed text-[#57534E] dark:text-[#D6D3D1]">
                                        {comment.content}
                                    </p>

                                    {/* Nested replies */}
                                    {comment.replies && comment.replies.length > 0 && (
                                        <div className="pl-4 border-l-2 border-[#E7E5E4] dark:border-[#262422] mt-3 space-y-2">
                                            {comment.replies.map((reply) => (
                                                <div key={reply.id} className="text-xs space-y-1">
                                                    <div className="font-semibold text-foreground">{reply.author_name}</div>
                                                    <p className="text-muted-foreground font-serif">{reply.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Submit Comment Form */}
                    <div className="rounded-xl border border-[#E7E5E4] dark:border-[#262422] p-6 bg-[#FAF7F2] dark:bg-[#181716] space-y-4">
                        <div className="space-y-1">
                            <h4 className="font-serif text-lg font-bold">Leave a Thoughtful Commentary</h4>
                            <p className="text-xs text-muted-foreground font-serif">
                                We welcome reflections, constructive critiques, and personal dispatches.
                            </p>
                        </div>

                        {wasSuccessful && (
                            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-lg text-xs font-medium">
                                Your commentary has been received and published to this article.
                            </div>
                        )}

                        <form onSubmit={handleCommentSubmit} className="space-y-4 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="c_name">Your Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="c_name"
                                        value={data.author_name}
                                        onChange={(e) => setData('author_name', e.target.value)}
                                        placeholder="e.g. Maya Sastro"
                                        required
                                    />
                                    {errors.author_name && <p className="text-red-500 text-[11px]">{errors.author_name}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="c_email">Email Address <span className="text-red-500">* (private)</span></Label>
                                    <Input
                                        id="c_email"
                                        type="email"
                                        value={data.author_email}
                                        onChange={(e) => setData('author_email', e.target.value)}
                                        placeholder="maya@example.com"
                                        required
                                    />
                                    {errors.author_email && <p className="text-red-500 text-[11px]">{errors.author_email}</p>}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="c_web">Website or Profile (Optional)</Label>
                                <Input
                                    id="c_web"
                                    type="url"
                                    value={data.author_website}
                                    onChange={(e) => setData('author_website', e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="c_content">Commentary <span className="text-red-500">*</span></Label>
                                <Textarea
                                    id="c_content"
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    placeholder="Share your perspective on this essay..."
                                    className="min-h-[100px] text-xs font-serif"
                                    required
                                />
                                {errors.content && <p className="text-red-500 text-[11px]">{errors.content}</p>}
                            </div>

                            {/* hCaptcha Verification */}
                            <div className="pt-1">
                                <HCaptcha
                                    ref={hcaptchaRef}
                                    sitekey={hcaptchaSiteKey || '10000000-ffff-ffff-ffff-000000000001'}
                                    onVerify={(token) => setData('h-captcha-response', token)}
                                    onExpire={() => setData('h-captcha-response', '')}
                                />
                                {errors['h-captcha-response'] && (
                                    <p className="text-red-500 text-[11px] mt-1.5">{errors['h-captcha-response']}</p>
                                )}
                            </div>

                            <Button type="submit" disabled={processing} size="sm" className="bg-[#1C1917] dark:bg-white text-white dark:text-[#1C1917] hover:bg-[#C2410C] dark:hover:bg-[#C2410C] dark:hover:text-white">
                                <Send className="mr-2 h-3.5 w-3.5" />
                                {processing ? 'Submitting...' : 'Post Commentary'}
                            </Button>
                        </form>
                    </div>
                </div>
            </article>

            {/* Simple Footer */}
            <footer className="border-t border-[#E7E5E4] dark:border-[#262422] py-8 text-center text-xs text-[#78716C] dark:text-[#A8A29E] font-serif italic">
                The Kelana Club Journal • Dispatches on Wandering Thought & Architecture
            </footer>
        </div>
    );
}
