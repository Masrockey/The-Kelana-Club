import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    Bookmark,
    Clock,
    Compass,
    Feather,
    Filter,
    Globe,
    LayoutDashboard,
    MapPin,
    Rss,
    Search,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PostItem {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featured_image: string | null;
    is_featured: boolean;
    read_time_minutes: number;
    views_count: number;
    seo_score: number;
    geo_target_country: string;
    geo_placename: string | null;
    published_at: string;
    category?: {
        name: string;
        slug: string;
        color: string;
    };
    user?: {
        name: string;
    };
    tags?: {
        name: string;
        slug: string;
    }[];
}

interface CategoryItem {
    id: number;
    name: string;
    slug: string;
    color: string;
    posts_count: number;
}

interface TagItem {
    id: number;
    name: string;
    slug: string;
    posts_count: number;
}

interface VisitorGeo {
    country_code: string;
    country_name: string;
    city: string;
    region: string;
}

interface Props {
    featuredPost: PostItem | null;
    posts: PostItem[];
    categories: CategoryItem[];
    tags: TagItem[];
    filters: {
        q?: string;
        category?: string;
        tag?: string;
        country?: string;
    };
    visitorGeo: VisitorGeo;
    siteMeta: {
        title: string;
        description: string;
        canonical: string;
    };
}

export default function BlogIndex({
    featuredPost,
    posts,
    categories,
    tags,
    filters,
    visitorGeo,
    siteMeta,
}: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.q || '');
    const [emailSub, setEmailSub] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/', { ...filters, q: searchQuery }, { preserveState: true });
    }

    function selectCategory(catSlug: string | null) {
        router.get('/', { ...filters, category: catSlug || undefined }, { preserveState: true });
    }

    function selectCountry(countryCode: string | null) {
        router.get('/', { ...filters, country: countryCode || undefined }, { preserveState: true });
    }

    function handleSubscribe(e: React.FormEvent) {
        e.preventDefault();
        if (emailSub) {
            setSubscribed(true);
            setEmailSub('');
        }
    }

    const todayDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#121110] text-[#1C1917] dark:text-[#E7E5E4] antialiased selection:bg-[#C2410C] selection:text-white font-sans transition-colors duration-200">
            <Head>
                <title>{siteMeta.title}</title>
                <meta name="description" content={siteMeta.description} />
                <link rel="canonical" href={siteMeta.canonical} />
                <meta property="og:title" content={siteMeta.title} />
                <meta property="og:description" content={siteMeta.description} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={siteMeta.canonical} />
                <link rel="alternate" type="application/rss+xml" title="The Kelana Club Feed" href="/feed.xml" />
            </Head>

            {/* Editorial Top Gazette Header */}
            <header className="border-b border-[#E7E5E4] dark:border-[#262422]">
                {/* Micro Gazette Top Bar */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 text-[11px] font-mono tracking-wide flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#E7E5E4]/60 dark:border-[#262422]/60 text-[#78716C] dark:text-[#A8A29E]">
                    <div className="flex items-center gap-3">
                        <span className="uppercase">Vol. XXIV • No. 04</span>
                        <span>•</span>
                        <span>{todayDate}</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-[#B45309] dark:text-[#F59E0B]">
                            <MapPin className="h-3 w-3" />
                            Dispatch for reader in {visitorGeo.city || 'Jakarta'}, {visitorGeo.country_name || 'Indonesia'}
                        </span>
                        <span className="hidden md:inline">•</span>
                        <Link
                            href="/dashboard"
                            className="hover:text-[#1C1917] dark:hover:text-white flex items-center gap-1 font-sans font-medium"
                        >
                            <LayoutDashboard className="h-3 w-3" />
                            Editor Desk
                        </Link>
                    </div>
                </div>

                {/* Monumental Masthead Title with Official Logo */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-center space-y-4">
                    <Link href="/" className="inline-flex flex-col items-center group">
                        <img
                            src="/logo.png"
                            alt="The Kelana Club"
                            className="size-16 sm:size-20 rounded-xl shadow-md border border-red-900/30 object-cover mb-4 transition-transform group-hover:scale-105 duration-300"
                        />
                        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#1C1917] dark:text-white transition-opacity group-hover:opacity-90">
                            THE KELANA CLUB
                        </h1>
                    </Link>

                    {/* Official Tagline Badge */}
                    <div className="flex items-center justify-center gap-3">
                        <span className="h-[1px] w-8 sm:w-16 bg-[#9B1C1C]/40" />
                        <span className="font-mono text-xs sm:text-sm font-bold tracking-[0.22em] uppercase text-[#9B1C1C] dark:text-[#EF4444]">
                            REAL ROUTES BY REAL TRAVELERS
                        </span>
                        <span className="h-[1px] w-8 sm:w-16 bg-[#9B1C1C]/40" />
                    </div>

                    <p className="font-serif italic text-xs sm:text-sm text-[#78716C] dark:text-[#A8A29E] max-w-xl mx-auto leading-relaxed">
                        A worldwide travel journal documenting authentic overland routes, alpine mountain passes, remote trails & traveler field intelligence.
                    </p>
                </div>

                {/* Primary Nav Menu */}
                <nav className="border-t border-[#E7E5E4] dark:border-[#262422] bg-[#FAF7F2] dark:bg-[#181716]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-12 text-xs">
                        <div className="flex items-center space-x-6 overflow-x-auto py-2 no-scrollbar font-medium">
                            <button
                                onClick={() => selectCategory(null)}
                                className={`whitespace-nowrap transition-colors pb-0.5 ${
                                    !filters.category
                                        ? 'text-[#C2410C] font-semibold border-b-2 border-[#C2410C]'
                                        : 'text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-white'
                                }`}
                            >
                                All Dispatches
                            </button>
                            {categories.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => selectCategory(c.slug)}
                                    className={`whitespace-nowrap transition-colors pb-0.5 flex items-center gap-1.5 ${
                                        filters.category === c.slug
                                            ? 'text-[#C2410C] font-semibold border-b-2 border-[#C2410C]'
                                            : 'text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-white'
                                    }`}
                                >
                                    <span>{c.name}</span>
                                    <span className="font-mono text-[10px] text-[#A8A29E]">({c.posts_count})</span>
                                </button>
                            ))}
                        </div>

                        <div className="hidden sm:flex items-center gap-3 shrink-0">
                            <a
                                href="/feed.xml"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#78716C] hover:text-[#C2410C] transition-colors"
                                title="RSS Feed"
                            >
                                <Rss className="h-4 w-4" />
                            </a>
                        </div>
                    </div>
                </nav>
            </header>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
                {/* Secondary Search & Country Filter Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E7E5E4] dark:border-[#262422]">
                    <form onSubmit={handleSearch} className="relative max-w-md w-full">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#A8A29E]" />
                        <input
                            type="text"
                            placeholder="Search essays, keywords, or philosophies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#FAF7F2] dark:bg-[#181716] border border-[#E7E5E4] dark:border-[#262422] rounded-full pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#C2410C] transition-colors"
                        />
                    </form>

                    {/* Quick Regional Dispatch Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
                        <span className="text-[#A8A29E] text-[11px] font-mono mr-1">📍 REGION:</span>
                        {['ALL', 'ID', 'JP', 'US', 'NL'].map((code) => (
                            <button
                                key={code}
                                onClick={() => selectCountry(code === 'ALL' ? null : code)}
                                className={`px-2.5 py-1 rounded-full font-mono text-[11px] transition-all ${
                                    (filters.country === code || (!filters.country && code === 'ALL'))
                                        ? 'bg-[#1C1917] dark:bg-white text-white dark:text-[#1C1917] font-semibold'
                                        : 'bg-[#FAF7F2] dark:bg-[#181716] border border-[#E7E5E4] dark:border-[#262422] text-[#78716C] hover:border-[#C2410C]'
                                }`}
                            >
                                {code === 'ALL' ? 'Worldwide' : code}
                            </button>
                        ))}
                    </div>
                </div>

                {/* LEAD FEATURED ESSAY (Classic Editorial Split) */}
                {featuredPost && !filters.q && !filters.category && !filters.tag && !filters.country && (
                    <section className="border-b border-[#E7E5E4] dark:border-[#262422] pb-12">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                            {/* Visual Photography Column */}
                            <div className="lg:col-span-7">
                                <Link href={`/article/${featuredPost.slug}`} className="block group overflow-hidden rounded-lg aspect-[16/10] bg-[#E7E5E4] dark:bg-[#262422]">
                                    {featuredPost.featured_image ? (
                                        <img
                                            src={featuredPost.featured_image}
                                            alt={featuredPost.title}
                                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground font-serif italic">
                                            The Kelana Archive
                                        </div>
                                    )}
                                </Link>
                            </div>

                            {/* Text Story Column */}
                            <div className="lg:col-span-5 space-y-4">
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className="text-[11px] font-mono uppercase rounded-full border-[#C2410C]/40 text-[#C2410C]"
                                    >
                                        Lead Story
                                    </Badge>
                                    {featuredPost.category && (
                                        <span className="text-xs font-serif italic text-[#78716C] dark:text-[#A8A29E]">
                                            in {featuredPost.category.name}
                                        </span>
                                    )}
                                    <span className="text-xs font-mono text-[#A8A29E] ml-auto">
                                        📍 {featuredPost.geo_placename || featuredPost.geo_target_country}
                                    </span>
                                </div>

                                <Link href={`/article/${featuredPost.slug}`} className="block group">
                                    <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-[#1C1917] dark:text-white group-hover:text-[#C2410C] transition-colors">
                                        {featuredPost.title}
                                    </h2>
                                </Link>

                                <p className="text-sm leading-relaxed text-[#57534E] dark:text-[#A8A29E] line-clamp-4 font-serif">
                                    {featuredPost.excerpt}
                                </p>

                                <div className="pt-2 flex items-center justify-between text-xs text-[#78716C] dark:text-[#A8A29E]">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-[#1C1917] dark:text-white">
                                            {featuredPost.user?.name || 'Raden Kelana'}
                                        </span>
                                        <span>•</span>
                                        <span>{featuredPost.read_time_minutes} min read</span>
                                    </div>

                                    <Link
                                        href={`/article/${featuredPost.slug}`}
                                        className="font-medium text-[#C2410C] hover:underline flex items-center gap-1 group"
                                    >
                                        <span>Read Dispatch</span>
                                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* CURATED ARTICLES GRID */}
                <section className="space-y-8">
                    <div className="flex items-center justify-between border-b border-[#E7E5E4] dark:border-[#262422] pb-3">
                        <div className="flex items-center gap-2">
                            <Feather className="h-4 w-4 text-[#C2410C]" />
                            <h3 className="font-serif text-xl font-bold tracking-tight">
                                {filters.q
                                    ? `Search Results for "${filters.q}"`
                                    : filters.category
                                    ? `Dispatches in ${categories.find((c) => c.slug === filters.category)?.name || filters.category}`
                                    : 'Recent Dispatches & Reflections'}
                            </h3>
                        </div>
                        <span className="font-mono text-xs text-[#A8A29E]">
                            {posts.length} {posts.length === 1 ? 'Essay' : 'Essays'}
                        </span>
                    </div>

                    {posts.length === 0 ? (
                        <div className="py-16 text-center space-y-3">
                            <p className="font-serif italic text-lg text-[#78716C] dark:text-[#A8A29E]">
                                No dispatches found matching your inquiry.
                            </p>
                            <Button variant="outline" size="sm" onClick={() => router.get('/')}>
                                View All Stories
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.map((post) => (
                                <article
                                    key={post.id}
                                    className="flex flex-col justify-between border border-[#E7E5E4] dark:border-[#262422] rounded-xl overflow-hidden bg-[#FAF7F2] dark:bg-[#181716] transition-all hover:shadow-md hover:border-[#C2410C]/40 group"
                                >
                                    <div>
                                        {/* Card Banner Image */}
                                        <Link href={`/article/${post.slug}`} className="block aspect-[16/10] overflow-hidden bg-[#E7E5E4] dark:bg-[#262422]">
                                            {post.featured_image ? (
                                                <img
                                                    src={post.featured_image}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-serif italic text-muted-foreground text-xs">
                                                    The Kelana Club
                                                </div>
                                            )}
                                        </Link>

                                        {/* Card Body */}
                                        <div className="p-5 space-y-2.5">
                                            <div className="flex items-center justify-between text-[11px] font-mono text-[#78716C] dark:text-[#A8A29E]">
                                                {post.category && (
                                                    <span
                                                        className="font-semibold uppercase tracking-wider"
                                                        style={{ color: post.category.color }}
                                                    >
                                                        {post.category.name}
                                                    </span>
                                                )}
                                                <span>📍 {post.geo_placename || post.geo_target_country}</span>
                                            </div>

                                            <Link href={`/article/${post.slug}`} className="block">
                                                <h4 className="font-serif text-lg font-bold leading-snug text-[#1C1917] dark:text-white group-hover:text-[#C2410C] transition-colors line-clamp-2">
                                                    {post.title}
                                                </h4>
                                            </Link>

                                            <p className="text-xs font-serif leading-relaxed text-[#57534E] dark:text-[#A8A29E] line-clamp-3">
                                                {post.excerpt}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="p-5 pt-0 border-t border-[#E7E5E4]/60 dark:border-[#262422]/60 mt-4 flex items-center justify-between text-[11px] text-[#78716C] dark:text-[#A8A29E]">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-3 w-3" />
                                            <span>{post.read_time_minutes} min read</span>
                                        </div>

                                        <Link
                                            href={`/article/${post.slug}`}
                                            className="font-medium text-[#C2410C] hover:underline flex items-center gap-0.5"
                                        >
                                            Read <ArrowRight className="h-3 w-3" />
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                {/* Newsletter & Substack-style Dispatch Section */}
                <section className="rounded-2xl border border-[#E7E5E4] dark:border-[#262422] p-8 sm:p-12 bg-[#FAF7F2] dark:bg-[#181716] text-center max-w-3xl mx-auto space-y-4">
                    <span className="font-mono text-xs uppercase tracking-widest text-[#C2410C]">
                        The Kelana Dispatch
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1917] dark:text-white">
                        Curated Letters on Slow Travel, Architecture & Philosophy
                    </h3>
                    <p className="text-xs sm:text-sm text-[#78716C] dark:text-[#A8A29E] font-serif max-w-lg mx-auto leading-relaxed">
                        Every Sunday dawn, we send a solitary dispatch examining forgotten streets, thoughtful code, and quiet books. No noise, no marketing tracking.
                    </p>

                    {subscribed ? (
                        <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-lg text-xs font-medium max-w-md mx-auto">
                            Thank you for joining our circle. Your first dispatch will arrive at Sunday dawn.
                        </div>
                    ) : (
                        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
                            <input
                                type="email"
                                placeholder="Your personal email address..."
                                value={emailSub}
                                onChange={(e) => setEmailSub(e.target.value)}
                                required
                                className="flex-1 bg-white dark:bg-[#121110] border border-[#E7E5E4] dark:border-[#262422] rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:border-[#C2410C]"
                            />
                            <Button type="submit" size="sm" className="bg-[#1C1917] dark:bg-white text-white dark:text-[#1C1917] hover:bg-[#C2410C] dark:hover:bg-[#C2410C] dark:hover:text-white">
                                Subscribe
                            </Button>
                        </form>
                    )}
                </section>
            </main>

            {/* Editorial Footer */}
            <footer className="border-t border-[#E7E5E4] dark:border-[#262422] bg-[#FAF7F2] dark:bg-[#181716] py-12 text-xs text-[#78716C] dark:text-[#A8A29E]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                        <div className="flex items-center gap-3">
                            <img
                                src="/logo.png"
                                alt="The Kelana Club"
                                className="size-10 rounded-lg shadow-sm border border-red-900/20 object-cover"
                            />
                            <div>
                                <div className="font-serif text-lg font-bold text-[#1C1917] dark:text-white">
                                    THE KELANA CLUB
                                </div>
                                <p className="font-mono text-[10px] tracking-wider text-[#9B1C1C] dark:text-[#EF4444] uppercase font-semibold">
                                    REAL ROUTES BY REAL TRAVELERS
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-6 font-mono text-[11px]">
                            <Link href="/sitemap.xml" target="_blank" className="hover:text-[#1C1917] dark:hover:text-white">
                                Sitemap.xml
                            </Link>
                            <Link href="/robots.txt" target="_blank" className="hover:text-[#1C1917] dark:hover:text-white">
                                Robots.txt
                            </Link>
                            <Link href="/feed.xml" target="_blank" className="hover:text-[#1C1917] dark:hover:text-white">
                                RSS Feed
                            </Link>
                            <Link href="/dashboard" className="hover:text-[#C2410C] font-semibold">
                                Editorial Desk
                            </Link>
                        </div>
                    </div>

                    <div className="border-t border-[#E7E5E4]/60 dark:border-[#262422]/60 pt-6 text-center font-serif italic text-[11px] text-[#A8A29E]">
                        "To wander is not to be lost; it is to encounter the world on its own unhurried terms." — Kelana Colophon © {new Date().getFullYear()}
                    </div>
                </div>
            </footer>
        </div>
    );
}
