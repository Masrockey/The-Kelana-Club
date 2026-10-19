import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    Camera,
    ChevronRight,
    Compass,
    Feather,
    Globe,
    Instagram,
    Mail,
    MapPin,
    Quote,
    Rss,
    Search,
    Send,
    Sparkles,
    Twitter,
    Youtube,
} from 'lucide-react';
import { useMemo, useState } from 'react';

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
        color?: string;
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
    color?: string;
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

interface NavMenuItem {
    id: number | string;
    title: string;
    url: string;
    target?: string;
    type?: string;
    order?: number;
}

interface Props {
    featuredPost: PostItem | null;
    posts: PostItem[];
    popularPosts?: PostItem[];
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
    headerMenuItems?: NavMenuItem[];
}

const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=80',
];

const ITEMS_PER_PAGE = 5;

export default function BlogIndex({
    featuredPost,
    posts,
    popularPosts = [],
    categories,
    tags,
    filters,
    visitorGeo,
    siteMeta,
    headerMenuItems,
}: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.q || '');
    const [emailSub, setEmailSub] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [aboutModalOpen, setAboutModalOpen] = useState(false);

    const displayNavItems = useMemo(() => {
        if (headerMenuItems && headerMenuItems.length > 0) {
            return headerMenuItems;
        }
        return [
            { id: 'd1', title: 'Home', url: '/', target: '_self' },
            { id: 'd2', title: 'Destinations', url: '#popular-categories', target: '_self' },
            { id: 'd3', title: 'Route Guides', url: '#articles-feed', target: '_self' },
            { id: 'd4', title: 'Stories', url: '#articles-feed', target: '_self' },
            { id: 'd5', title: 'About Us', url: '#about-club', target: '_self' },
        ];
    }, [headerMenuItems]);

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/', { ...filters, q: searchQuery || undefined }, { preserveState: true });
        setCurrentPage(1);
    }

    function selectCategory(catSlug: string | null) {
        router.get('/', { ...filters, category: catSlug || undefined }, { preserveState: true });
        setCurrentPage(1);
    }

    function clearFilter() {
        setSearchQuery('');
        router.get('/', {}, { preserveState: true });
        setCurrentPage(1);
    }

    function handleSubscribe(e: React.FormEvent) {
        e.preventDefault();
        if (emailSub.trim()) {
            setSubscribed(true);
            setEmailSub('');
        }
    }

    // Pagination calculations
    const totalPosts = posts.length;
    const totalPages = Math.max(1, Math.ceil(totalPosts / ITEMS_PER_PAGE));
    const paginatedPosts = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return posts.slice(start, start + ITEMS_PER_PAGE);
    }, [posts, currentPage]);

    function changePage(page: number) {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        const feedElem = document.getElementById('articles-feed');
        if (feedElem) {
            feedElem.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Fallback popular posts if backend popularPosts is empty
    const displayPopular = useMemo(() => {
        if (popularPosts && popularPosts.length > 0) {
            return popularPosts.slice(0, 5);
        }
        return [...posts]
            .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
            .slice(0, 5);
    }, [popularPosts, posts]);

    function formatDate(dateStr: string) {
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    }

    function formatReadersCount(views: number) {
        if (!views) return '3.2k readers';
        if (views >= 1000) {
            return `${(views / 1000).toFixed(1)}k readers`;
        }
        return `${views} readers`;
    }

    return (
        <div className="min-h-screen bg-[#fff8f3] dark:bg-[#191614] text-[#1d1b18] dark:text-[#f6f0ea] antialiased selection:bg-[#7d1017] selection:text-white font-sans transition-colors duration-200">
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

            {/* 1. Header Blog Standar & Bersih (Stitch Spec) */}
            <header className="sticky top-0 z-50 bg-[#fff8f3]/95 dark:bg-[#191614]/95 backdrop-blur-md border-b border-[#dfbfbc]/30 dark:border-stone-800">
                {/* Top Notice / Social Bar */}
                <div className="border-b border-[#dfbfbc]/15 dark:border-stone-800/60 text-xs text-[#58413f]/80 dark:text-[#bba8a4]/80 py-2 hidden md:block">
                    <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span>Independent Field Notes &amp; Travel Journal by Kelana Club • Real Routes by Real Travelers</span>
                            <span className="inline-flex items-center gap-1 text-[#7d1017] dark:text-[#ffb3ae] font-medium ml-2">
                                <MapPin className="size-3" />
                                <span>Lombok, Indonesia</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span>Follow Us:</span>
                            <a className="hover:text-[#7d1017] dark:hover:text-[#ffb3ae] transition-colors" href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
                            <span>•</span>
                            <a className="hover:text-[#7d1017] dark:hover:text-[#ffb3ae] transition-colors" href="https://youtube.com" target="_blank" rel="noreferrer">YouTube</a>
                            <span>•</span>
                            <a className="hover:text-[#7d1017] dark:hover:text-[#ffb3ae] transition-colors" href="https://twitter.com" target="_blank" rel="noreferrer">Twitter/X</a>
                            <span>•</span>
                            <Link href="/dashboard" className="text-[#7d1017] dark:text-[#ffb3ae] font-semibold hover:underline">
                                Editor Desk
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Main Brand & Nav Bar */}
                <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between gap-6">
                    {/* Logo */}
                    <Link className="flex items-center gap-3 shrink-0 group" href="/">
                        <img
                            alt="Kelana Club Logo"
                            className="h-10 w-auto object-contain rounded-md transition-transform group-hover:scale-105 duration-300"
                            src="/logo.png"
                        />
                        <div className="flex flex-col">
                            <span className="font-serif text-2xl font-bold text-[#7d1017] dark:text-[#ffb3ae] tracking-tight group-hover:text-[#9e2a2b] transition-colors">
                                The Kelana Club
                            </span>
                            <span className="text-[11px] text-[#58413f] dark:text-[#bba8a4] tracking-wider uppercase font-medium">
                                Real Routes by Real Travelers
                            </span>
                        </div>
                    </Link>

                    {/* Navigasi Dinamis dari Menu Editor (WordPress Style) */}
                    <nav className="hidden lg:flex items-center gap-7 text-[15px] font-medium text-[#58413f] dark:text-[#bba8a4]">
                        {displayNavItems.map((item) => {
                            const isHome = item.url === '/' && !filters.category && !filters.q;
                            const isAnchor = item.url.startsWith('#');

                            if (isAnchor) {
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            if (item.url === '#about-club') {
                                                setAboutModalOpen(true);
                                            } else {
                                                const elemId = item.url.replace(/^#/, '');
                                                const target = document.getElementById(elemId);
                                                if (target) {
                                                    target.scrollIntoView({ behavior: 'smooth' });
                                                }
                                            }
                                        }}
                                        className="hover:text-[#7d1017] dark:hover:text-[#ffb3ae] transition-colors py-1 cursor-pointer"
                                    >
                                        {item.title}
                                    </button>
                                );
                            }

                            return (
                                <Link
                                    key={item.id}
                                    className={`py-1 transition-colors ${
                                        isHome
                                            ? 'text-[#7d1017] dark:text-[#ffb3ae] font-semibold border-b-2 border-[#7d1017] dark:border-[#ffb3ae]'
                                            : 'hover:text-[#7d1017] dark:hover:text-[#ffb3ae]'
                                    }`}
                                    href={item.url}
                                    target={item.target || '_self'}
                                >
                                    {item.title}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Search Box */}
                    <div className="flex items-center">
                        <form onSubmit={handleSearch} className="relative hidden sm:block w-52 sm:w-64">
                            <input
                                className="w-full pl-9 pr-3 py-1.5 rounded-full bg-[#f3ede7] dark:bg-[#282421] text-sm text-[#1d1b18] dark:text-[#f6f0ea] placeholder:text-[#58413f]/70 dark:placeholder:text-[#bba8a4]/70 focus:outline-none focus:ring-2 focus:ring-[#7d1017]/25 border border-transparent focus:border-[#dfbfbc] transition-all"
                                placeholder="Search articles, routes..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute left-3 top-2 size-[18px] text-[#58413f] dark:text-[#bba8a4]" />
                        </form>
                    </div>
                </div>
            </header>

            {/* Main Page Body */}
            <main className="w-full bg-[#fff8f3] dark:bg-[#191614] py-10">
                <div className="max-w-6xl mx-auto px-6">
                    {/* Active Filter Notification if searched or filtered */}
                    {(filters.q || filters.category || filters.tag) && (
                        <div className="mb-8 p-4 rounded-xl bg-[#f3ede7] dark:bg-[#282421] border border-[#dfbfbc]/30 dark:border-stone-800 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-semibold text-[#7d1017] dark:text-[#ffb3ae]">Filtered results:</span>
                                {filters.q && <span className="bg-white dark:bg-stone-800 px-2 py-0.5 rounded text-xs">Query: &quot;{filters.q}&quot;</span>}
                                {filters.category && <span className="bg-white dark:bg-stone-800 px-2 py-0.5 rounded text-xs">Category: {filters.category}</span>}
                                {filters.tag && <span className="bg-white dark:bg-stone-800 px-2 py-0.5 rounded text-xs">Tag: {filters.tag}</span>}
                            </div>
                            <button
                                onClick={clearFilter}
                                className="text-xs font-semibold text-[#7d1017] dark:text-[#ffb3ae] hover:underline cursor-pointer"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}

                    {/* 2. Featured Post (Artikel Pilihan Teratas) */}
                    {featuredPost && !filters.q && !filters.category && (
                        <section className="mb-14">
                            <article className="bg-white dark:bg-[#211d1a] rounded-2xl overflow-hidden border border-[#dfbfbc]/30 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                                    {/* Featured Image */}
                                    <div className="lg:col-span-7 relative overflow-hidden aspect-[16/10] lg:aspect-auto min-h-[320px] lg:min-h-[440px]">
                                        <Link href={`/article/${featuredPost.slug}`} className="block w-full h-full group">
                                            <img
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                alt={featuredPost.title}
                                                src={featuredPost.featured_image || FALLBACK_IMAGES[0]}
                                            />
                                        </Link>
                                        <div className="absolute top-4 left-4 pointer-events-none">
                                            <span className="px-3.5 py-1.5 rounded-full bg-[#fff8f3]/95 dark:bg-[#191614]/95 backdrop-blur-md text-[#7d1017] dark:text-[#ffb3ae] font-bold text-xs uppercase tracking-wider shadow-sm">
                                                Featured Story
                                            </span>
                                        </div>
                                    </div>

                                    {/* Featured Content */}
                                    <div className="lg:col-span-5 p-8 lg:p-10 flex flex-col justify-between bg-white dark:bg-[#211d1a]">
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-xs font-semibold uppercase tracking-wider text-[#45664e] dark:text-[#a2c8ab]">
                                                    {featuredPost.category?.name || 'Travel Dispatch'}
                                                </span>
                                                <span className="text-[#58413f]/40 dark:text-[#bba8a4]/40">•</span>
                                                <span className="text-xs text-[#58413f] dark:text-[#bba8a4]">
                                                    {featuredPost.geo_placename || 'South Sulawesi'}
                                                </span>
                                            </div>

                                            <h1 className="font-serif text-2xl lg:text-3xl font-bold text-[#1d1b18] dark:text-[#f6f0ea] leading-snug mb-4 hover:text-[#7d1017] dark:hover:text-[#ffb3ae] transition-colors">
                                                <Link href={`/article/${featuredPost.slug}`}>
                                                    {featuredPost.title}
                                                </Link>
                                            </h1>

                                            <p className="font-sans text-[#58413f] dark:text-[#bba8a4] text-[15px] leading-relaxed mb-6 line-clamp-4">
                                                {featuredPost.excerpt}
                                            </p>
                                        </div>

                                        <div className="pt-6 border-t border-[#dfbfbc]/20 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-[#f3ede7] dark:bg-stone-800 shrink-0">
                                                    <img
                                                        className="w-full h-full object-cover"
                                                        alt="Author avatar"
                                                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                                                    />
                                                </div>
                                                <div className="text-xs">
                                                    <p className="font-semibold text-[#1d1b18] dark:text-[#f6f0ea]">
                                                        By {featuredPost.user?.name || 'Kelana Contributor'}
                                                    </p>
                                                    <p className="text-[#58413f] dark:text-[#bba8a4]">
                                                        {formatDate(featuredPost.published_at)} • {featuredPost.read_time_minutes || 6} min read
                                                    </p>
                                                </div>
                                            </div>

                                            <Link
                                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#7d1017] text-white font-semibold text-xs hover:bg-[#9e2a2b] transition-all self-start sm:self-auto shadow-sm"
                                                href={`/article/${featuredPost.slug}`}
                                            >
                                                <span>Read Story</span>
                                                <ArrowRight className="size-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </section>
                    )}

                    {/* 3. Layout Klasik 2-Kolom (Main Content + Sidebar) */}
                    <div id="articles-feed" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                        {/* Kolom Utama (Kiri, ~68%) */}
                        <div className="lg:col-span-8 flex flex-col gap-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#dfbfbc]/30 dark:border-stone-800 pb-4 gap-2">
                                <div>
                                    <h2 className="font-serif text-2xl font-bold text-[#1d1b18] dark:text-[#f6f0ea]">
                                        Latest Articles
                                    </h2>
                                    <p className="text-xs text-[#58413f] dark:text-[#bba8a4] mt-0.5">
                                        Field notes, culinary finds, and independent road guides
                                    </p>
                                </div>
                                <span className="text-xs text-[#58413f] dark:text-[#bba8a4]">
                                    Showing {paginatedPosts.length} of {totalPosts} articles
                                </span>
                            </div>

                            {/* Category Filter Pills (Interactive navigation) */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
                                <button
                                    onClick={() => selectCategory(null)}
                                    className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${!filters.category
                                        ? 'bg-[#7d1017] text-white shadow-sm'
                                        : 'bg-white dark:bg-[#211d1a] border border-[#dfbfbc]/30 dark:border-stone-800 text-[#58413f] dark:text-[#bba8a4] hover:border-[#7d1017]'
                                        }`}
                                >
                                    All Stories
                                </button>
                                {categories.map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => selectCategory(c.slug)}
                                        className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${filters.category === c.slug
                                            ? 'bg-[#7d1017] text-white shadow-sm'
                                            : 'bg-white dark:bg-[#211d1a] border border-[#dfbfbc]/30 dark:border-stone-800 text-[#58413f] dark:text-[#bba8a4] hover:border-[#7d1017]'
                                            }`}
                                    >
                                        <span>{c.name}</span>
                                        <span className="text-[10px] opacity-75 font-mono">({c.posts_count})</span>
                                    </button>
                                ))}
                            </div>

                            {/* Daftar Artikel (Vertical Feed Klasik Blog) */}
                            {paginatedPosts.length === 0 ? (
                                <div className="text-center py-16 bg-white dark:bg-[#211d1a] rounded-xl border border-[#dfbfbc]/30 dark:border-stone-800 p-8">
                                    <Compass className="size-10 text-[#7d1017] dark:text-[#ffb3ae] mx-auto mb-3 opacity-60" />
                                    <h3 className="font-serif text-lg font-bold">No Dispatches Found</h3>
                                    <p className="text-sm text-[#58413f] dark:text-[#bba8a4] mt-1 max-w-sm mx-auto">
                                        No articles matched your criteria. Try resetting your search filter or category.
                                    </p>
                                    <button
                                        onClick={clearFilter}
                                        className="mt-4 px-4 py-2 rounded-lg bg-[#7d1017] text-white font-semibold text-xs hover:bg-[#9e2a2b] transition-colors cursor-pointer"
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-7">
                                    {paginatedPosts.map((post, index) => (
                                        <article
                                            key={post.id}
                                            className="bg-white dark:bg-[#211d1a] p-5 sm:p-6 rounded-xl border border-[#dfbfbc]/25 dark:border-stone-800 hover:border-[#7d1017]/40 hover:shadow-sm transition-all group"
                                        >
                                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                                                <div className="sm:col-span-4 rounded-lg overflow-hidden aspect-[4/3] bg-[#f3ede7] dark:bg-stone-800">
                                                    <Link href={`/article/${post.slug}`} className="block w-full h-full">
                                                        <img
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            alt={post.title}
                                                            src={post.featured_image || FALLBACK_IMAGES[(index + 1) % FALLBACK_IMAGES.length]}
                                                        />
                                                    </Link>
                                                </div>

                                                <div className="sm:col-span-8 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2 text-xs text-[#58413f] dark:text-[#bba8a4] mb-2">
                                                            <span className="text-[#45664e] dark:text-[#a2c8ab] font-semibold uppercase tracking-wider">
                                                                {post.category?.name || 'Field Dispatch'}
                                                            </span>
                                                            <span>•</span>
                                                            <span>{formatDate(post.published_at)}</span>
                                                            <span>•</span>
                                                            <span>{post.read_time_minutes || 5} min read</span>
                                                        </div>

                                                        <h3 className="font-serif text-xl font-bold text-[#1d1b18] dark:text-[#f6f0ea] group-hover:text-[#7d1017] dark:group-hover:text-[#ffb3ae] transition-colors leading-snug mb-2">
                                                            <Link href={`/article/${post.slug}`}>
                                                                {post.title}
                                                            </Link>
                                                        </h3>

                                                        <p className="font-sans text-[#58413f] dark:text-[#bba8a4] text-[14px] leading-relaxed line-clamp-2 mb-3">
                                                            {post.excerpt}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-2">
                                                        <span className="text-xs text-[#58413f]/80 dark:text-[#bba8a4]/80">
                                                            By {post.user?.name || 'Kelana Author'} • Contributor
                                                        </span>
                                                        <Link
                                                            className="text-[#7d1017] dark:text-[#ffb3ae] font-semibold text-xs inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                                                            href={`/article/${post.slug}`}
                                                        >
                                                            <span>Read More</span>
                                                            <ChevronRight className="size-4" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}

                            {/* Pagination Standar Blog (Stitch Spec) */}
                            {totalPages > 1 && (
                                <nav aria-label="Page navigation" className="pt-6 pb-4 flex items-center justify-center gap-2">
                                    {Array.from({ length: totalPages }).map((_, i) => {
                                        const pageNum = i + 1;
                                        const isActive = pageNum === currentPage;
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => changePage(pageNum)}
                                                className={`w-10 h-10 rounded-lg font-semibold text-sm flex items-center justify-center transition-colors cursor-pointer ${isActive
                                                    ? 'bg-[#7d1017] text-white shadow-sm'
                                                    : 'bg-white dark:bg-[#211d1a] text-[#1d1b18] dark:text-[#f6f0ea] hover:bg-[#f3ede7] dark:hover:bg-stone-800 border border-[#dfbfbc]/30 dark:border-stone-800'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    {currentPage < totalPages && (
                                        <button
                                            onClick={() => changePage(currentPage + 1)}
                                            className="px-4 h-10 rounded-lg bg-white dark:bg-[#211d1a] text-[#1d1b18] dark:text-[#f6f0ea] hover:bg-[#f3ede7] dark:hover:bg-stone-800 font-semibold text-sm flex items-center gap-1 border border-[#dfbfbc]/30 dark:border-stone-800 transition-colors cursor-pointer"
                                        >
                                            <span>Next</span>
                                            <ChevronRight className="size-4" />
                                        </button>
                                    )}
                                </nav>
                            )}
                        </div>

                        {/* Sidebar Kanan (~32%) */}
                        <aside className="lg:col-span-4 flex flex-col gap-8">
                            {/* Widget 1: Halo, Kami Kelana Club */}
                            <div className="bg-white dark:bg-[#211d1a] p-6 rounded-xl border border-[#dfbfbc]/30 dark:border-stone-800 shadow-sm text-center">
                                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-[#7d1017]/20 p-1 mb-4">
                                    <img
                                        className="w-full h-full object-cover rounded-full"
                                        alt="Kelana Club Avatar"
                                        src="/logo.png"
                                    />
                                </div>
                                <h3 className="font-serif text-xl font-bold text-[#1d1b18] dark:text-[#f6f0ea] mb-1">
                                    Hello, We are Kelana Club!
                                </h3>
                                <p className="text-xs uppercase font-semibold tracking-wider text-[#7d1017] dark:text-[#ffb3ae] mb-3">
                                    Independent Travelers &amp; Writers
                                </p>
                                <p className="font-sans text-[#58413f] dark:text-[#bba8a4] text-[14px] leading-relaxed mb-5">
                                    We are a collective of independent travelers documenting honest field stories, alternative trail routes, and authentic local wisdom without paid sponsor fluff.
                                </p>
                                <button
                                    onClick={() => setAboutModalOpen(true)}
                                    className="inline-block w-full py-2.5 px-4 rounded-lg bg-[#f3ede7] dark:bg-stone-800 text-[#1d1b18] dark:text-[#f6f0ea] hover:bg-[#7d1017] hover:text-white dark:hover:bg-[#ffb3ae] dark:hover:text-[#410004] font-semibold text-xs transition-colors border border-[#dfbfbc]/20 dark:border-stone-700 cursor-pointer"
                                >
                                    Learn More About Us
                                </button>
                            </div>

                            {/* Widget 2: Artikel Populer */}
                            <div className="bg-white dark:bg-[#211d1a] p-6 rounded-xl border border-[#dfbfbc]/30 dark:border-stone-800 shadow-sm">
                                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#dfbfbc]/20 dark:border-stone-800">
                                    <span className="w-2 h-2 rounded-full bg-[#7d1017] inline-block"></span>
                                    <h3 className="font-serif text-lg font-bold text-[#1d1b18] dark:text-[#f6f0ea]">
                                        Popular Articles
                                    </h3>
                                </div>
                                <div className="flex flex-col gap-4">
                                    {displayPopular.map((item, index) => (
                                        <Link
                                            key={item.id}
                                            href={`/article/${item.slug}`}
                                            className="flex items-start gap-3 group"
                                        >
                                            <span className="font-serif text-lg font-bold text-[#7d1017]/40 dark:text-[#ffb3ae]/40 group-hover:text-[#7d1017] dark:group-hover:text-[#ffb3ae] transition-colors shrink-0 w-4">
                                                {index + 1}
                                            </span>
                                            <div className="w-16 h-16 rounded-md overflow-hidden bg-[#f3ede7] dark:bg-stone-800 shrink-0">
                                                <img
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                    alt={item.title}
                                                    src={item.featured_image || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]}
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-serif text-sm font-semibold text-[#1d1b18] dark:text-[#f6f0ea] group-hover:text-[#7d1017] dark:group-hover:text-[#ffb3ae] transition-colors line-clamp-2 leading-snug">
                                                    {item.title}
                                                </h4>
                                                <span className="text-[11px] text-[#58413f] dark:text-[#bba8a4] mt-1 inline-block">
                                                    {formatReadersCount(item.views_count)}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Widget 3: Kategori Populer */}
                            <div id="popular-categories" className="bg-white dark:bg-[#211d1a] p-6 rounded-xl border border-[#dfbfbc]/30 dark:border-stone-800 shadow-sm">
                                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#dfbfbc]/20 dark:border-stone-800">
                                    <span className="w-2 h-2 rounded-full bg-[#45664e] inline-block"></span>
                                    <h3 className="font-serif text-lg font-bold text-[#1d1b18] dark:text-[#f6f0ea]">
                                        Popular Categories
                                    </h3>
                                </div>
                                <ul className="flex flex-col gap-2.5 text-sm">
                                    {categories.map((cat) => (
                                        <li key={cat.id}>
                                            <button
                                                onClick={() => selectCategory(cat.slug)}
                                                className="w-full flex items-center justify-between text-[#58413f] dark:text-[#bba8a4] hover:text-[#7d1017] dark:hover:text-[#ffb3ae] transition-colors py-1 cursor-pointer text-left"
                                            >
                                                <span>{cat.name}</span>
                                                <span className="px-2 py-0.5 rounded-full bg-[#f3ede7] dark:bg-stone-800 text-xs text-[#58413f] dark:text-[#bba8a4] font-medium">
                                                    {cat.posts_count}
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Widget 4: Langganan Newsletter (Kelana Dispatch) */}
                            <div id="newsletter-box" className="bg-[#f3ede7] dark:bg-[#282421] p-6 rounded-xl border border-[#dfbfbc]/20 dark:border-stone-800 text-center">
                                <div className="w-10 h-10 rounded-full bg-[#7d1017]/10 dark:bg-[#ffb3ae]/15 text-[#7d1017] dark:text-[#ffb3ae] mx-auto flex items-center justify-center mb-3">
                                    <Mail className="size-5" />
                                </div>
                                <h3 className="font-serif text-lg font-bold text-[#1d1b18] dark:text-[#f6f0ea] mb-1">
                                    Kelana Dispatch
                                </h3>
                                <p className="font-sans text-xs text-[#58413f] dark:text-[#bba8a4] mb-4">
                                    Get weekly curated route stories, hidden trails, and offbeat travel field notes delivered every Friday morning. Zero spam.
                                </p>
                                {subscribed ? (
                                    <div className="p-3 bg-white dark:bg-stone-800 rounded-lg border border-emerald-600/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                                        ✓ Welcome aboard! Check your inbox for the field journal issue.
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubscribe} className="flex flex-col gap-2.5">
                                        <input
                                            className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-[#211d1a] text-sm text-[#1d1b18] dark:text-[#f6f0ea] placeholder:text-[#58413f]/60 dark:placeholder:text-[#bba8a4]/60 border border-[#dfbfbc]/30 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-[#7d1017]/20"
                                            placeholder="Your email address..."
                                            type="email"
                                            required
                                            value={emailSub}
                                            onChange={(e) => setEmailSub(e.target.value)}
                                        />
                                        <button
                                            className="w-full py-2.5 rounded-lg bg-[#7d1017] hover:bg-[#9e2a2b] text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
                                            type="submit"
                                        >
                                            Subscribe Free
                                        </button>
                                    </form>
                                )}
                            </div>

                            {/* Widget 5: Ikuti Kami di Media Sosial */}
                            <div className="bg-white dark:bg-[#211d1a] p-6 rounded-xl border border-[#dfbfbc]/30 dark:border-stone-800 shadow-sm">
                                <h3 className="font-serif text-base font-bold text-[#1d1b18] dark:text-[#f6f0ea] mb-3 text-center">
                                    Follow Us on Social Media
                                </h3>
                                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                    <a
                                        className="p-3 rounded-lg bg-[#f3ede7] dark:bg-stone-800 hover:bg-[#ede7e2] dark:hover:bg-stone-700 transition-colors flex flex-col items-center gap-1.5"
                                        href="https://instagram.com"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <Camera className="size-5 text-[#7d1017] dark:text-[#ffb3ae]" />
                                        <span className="font-medium text-[#1d1b18] dark:text-[#f6f0ea]">Instagram</span>
                                    </a>
                                    <a
                                        className="p-3 rounded-lg bg-[#f3ede7] dark:bg-stone-800 hover:bg-[#ede7e2] dark:hover:bg-stone-700 transition-colors flex flex-col items-center gap-1.5"
                                        href="https://youtube.com"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <Youtube className="size-5 text-[#7d1017] dark:text-[#ffb3ae]" />
                                        <span className="font-medium text-[#1d1b18] dark:text-[#f6f0ea]">YouTube</span>
                                    </a>
                                    <a
                                        className="p-3 rounded-lg bg-[#f3ede7] dark:bg-stone-800 hover:bg-[#ede7e2] dark:hover:bg-stone-700 transition-colors flex flex-col items-center gap-1.5"
                                        href="https://twitter.com"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <Twitter className="size-5 text-[#7d1017] dark:text-[#ffb3ae]" />
                                        <span className="font-medium text-[#1d1b18] dark:text-[#f6f0ea]">Twitter/X</span>
                                    </a>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            {/* 5. Footer Blog yang Bersih (Stitch Spec) */}
            <footer className="w-full bg-[#f9f2ed] dark:bg-[#151311] border-t border-[#dfbfbc]/25 dark:border-stone-800 pt-14 pb-10">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
                        {/* Kolom Brand */}
                        <div className="md:col-span-5">
                            <div className="flex items-center gap-3 mb-3">
                                <img src="/logo.png" alt="Logo" className="h-8 w-auto rounded object-contain" />
                                <span className="font-serif text-2xl font-bold text-[#7d1017] dark:text-[#ffb3ae] tracking-tight">
                                    The Kelana Club
                                </span>
                            </div>
                            <p className="font-sans text-sm text-[#58413f] dark:text-[#bba8a4] max-w-sm mb-5 leading-relaxed">
                                An independent travel journal for curious wanderers who appreciate slow-paced journeys, thoughtful community encounters, and unhurried exploration across the Indonesian archipelago and beyond.
                            </p>
                            <p className="text-xs text-[#58413f]/80 dark:text-[#bba8a4]/80">
                                Letters, queries &amp; story submissions:{' '}
                                <a className="text-[#7d1017] dark:text-[#ffb3ae] underline" href="mailto:contact@kelanaclub.com">
                                    contact@kelanaclub.com
                                </a>
                            </p>
                        </div>

                        {/* Kolom Navigasi */}
                        <div className="md:col-span-4 grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-serif text-sm font-bold text-[#1d1b18] dark:text-[#f6f0ea] mb-3">
                                    Explore
                                </h4>
                                <ul className="space-y-2 text-xs text-[#58413f] dark:text-[#bba8a4]">
                                    <li><Link className="hover:text-[#7d1017] dark:hover:text-[#ffb3ae] transition-colors" href="/">Home</Link></li>
                                    <li><button onClick={() => selectCategory(null)} className="hover:text-[#7d1017] dark:hover:text-[#ffb3ae] transition-colors cursor-pointer">All Dispatches</button></li>
                                    <li><a className="hover:text-[#7d1017] dark:hover:text-[#ffb3ae] transition-colors" href="/feed.xml">RSS XML Feed</a></li>
                                    <li><a className="hover:text-[#7d1017] dark:hover:text-[#ffb3ae] transition-colors" href="/sitemap.xml">XML Sitemap</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-serif text-sm font-bold text-[#1d1b18] dark:text-[#f6f0ea] mb-3">
                                    About Us
                                </h4>
                                <ul className="space-y-2 text-xs text-[#58413f] dark:text-[#bba8a4]">
                                    <li><button onClick={() => setAboutModalOpen(true)} className="hover:text-[#7d1017] dark:hover:text-[#ffb3ae] transition-colors cursor-pointer">Editorial Collective</button></li>
                                    <li><Link className="hover:text-[#7d1017] dark:hover:text-[#ffb3ae] transition-colors" href="/admin/posts/create">Submit a Story</Link></li>
                                    <li><Link className="hover:text-[#7d1017] dark:hover:text-[#ffb3ae] transition-colors" href="/dashboard">Editor Portal</Link></li>
                                </ul>
                            </div>
                        </div>

                        {/* Kolom Kutipan Hangat Pejalan */}
                        <div className="md:col-span-3 bg-white dark:bg-[#211d1a] p-5 rounded-xl border border-[#dfbfbc]/20 dark:border-stone-800 self-start shadow-sm">
                            <Quote className="size-6 text-[#7d1017] dark:text-[#ffb3ae] mb-1 opacity-80" />
                            <p className="font-serif italic text-xs text-[#1d1b18] dark:text-[#f6f0ea] leading-relaxed mb-2">
                                &quot;It is not about how far we wander, but how deeply our footsteps leave kindness in the places we touch.&quot;
                            </p>
                            <span className="text-[11px] font-semibold text-[#58413f] dark:text-[#bba8a4]">
                                — The Kelana Club
                            </span>
                        </div>
                    </div>

                    {/* Copyright & Legal */}
                    <div className="pt-6 border-t border-[#dfbfbc]/20 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#58413f] dark:text-[#bba8a4]">
                        <p>© 2026 The Kelana Club. Real Routes by Real Travelers.</p>
                        <div className="flex items-center gap-5">
                            <span className="text-[#58413f]/60 dark:text-[#bba8a4]/60">Crafted with care for slow wanderers</span>
                            <span>•</span>
                            <a className="hover:text-[#7d1017] dark:hover:text-[#ffb3ae] transition-colors" href="/sitemap.xml">Sitemap</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* About Modal */}
            {aboutModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#fff8f3] dark:bg-[#211d1a] border border-[#dfbfbc]/40 dark:border-stone-700 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden mb-4 shadow border border-[#7d1017]/20">
                            <img src="/logo.png" alt="Kelana Club" className="w-full h-full object-cover" />
                        </div>
                        <h3 className="font-serif text-2xl font-bold text-[#1d1b18] dark:text-[#f6f0ea] mb-1">
                            The Kelana Club Story
                        </h3>
                        <p className="text-xs uppercase tracking-widest text-[#7d1017] dark:text-[#ffb3ae] font-semibold mb-4">
                            Real Routes by Real Travelers
                        </p>
                        <div className="space-y-3 text-sm text-[#58413f] dark:text-[#bba8a4] leading-relaxed">
                            <p>
                                Kelana Club began with a simple belief: the most profound travels are seldom found in sponsored resort reels. They unfold along quiet island ferries, dawn tea stalls in highland villages, and winding mountain passes shared with friendly strangers.
                            </p>
                            <p>
                                Our dispatch contributors are independent backpackers, overland explorers, and cultural chroniclers who document unhurried journeys across the Indonesian archipelago and world trails.
                            </p>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setAboutModalOpen(false)}
                                className="px-5 py-2.5 rounded-lg bg-[#7d1017] text-white font-semibold text-xs hover:bg-[#9e2a2b] transition-colors cursor-pointer shadow-sm"
                            >
                                Close &amp; Explore
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
