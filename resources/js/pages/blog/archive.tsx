import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Clock, Feather } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PostItem {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featured_image: string | null;
    read_time_minutes: number;
    views_count: number;
    geo_placename: string | null;
    geo_target_country: string;
    published_at: string;
    category?: {
        name: string;
        slug: string;
        color: string;
    };
    user?: {
        name: string;
    };
}

interface CategoryItem {
    id: number;
    name: string;
    slug: string;
    posts_count: number;
}

interface Props {
    title: string;
    description: string;
    badge: string;
    posts: {
        data: PostItem[];
        current_page: number;
        last_page: number;
        total: number;
    };
    categories: CategoryItem[];
    currentSlug: string;
}

export default function BlogArchive({
    title,
    description,
    badge,
    posts,
    categories,
    currentSlug,
}: Props) {
    return (
        <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#121110] text-[#1C1917] dark:text-[#E7E5E4] antialiased selection:bg-[#C2410C] selection:text-white font-sans transition-colors duration-200">
            <Head>
                <title>{`${title} — The Kelana Club`}</title>
                <meta name="description" content={description} />
            </Head>

            {/* Header */}
            <header className="border-b border-[#E7E5E4] dark:border-[#262422] bg-[#FAF7F2] dark:bg-[#181716]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between text-xs">
                    <Link
                        href="/"
                        className="flex items-center gap-3 text-[#1C1917] dark:text-white group transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 text-[#78716C] group-hover:text-[#C2410C] transition-colors" />
                        <img
                            src="/logo.png"
                            alt="The Kelana Club"
                            className="h-8 w-8 rounded-full border border-[#E7E5E4] dark:border-[#38332E] shadow-sm object-cover"
                        />
                        <div className="flex flex-col">
                            <span className="font-serif font-bold text-sm tracking-tight text-[#1C1917] dark:text-white leading-none">
                                The Kelana Club
                            </span>
                            <span className="font-mono text-[9px] uppercase tracking-wider text-[#C2410C] font-semibold mt-0.5">
                                Real Routes by Real Travelers
                            </span>
                        </div>
                    </Link>

                    <div className="font-serif italic text-muted-foreground text-xs hidden sm:block">
                        Worldwide Travel Archives
                    </div>
                </div>

                {/* Archive Title Banner */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center space-y-3">
                    <Badge variant="outline" className="font-mono text-xs uppercase rounded-full">
                        {badge}
                    </Badge>
                    <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#1C1917] dark:text-white">
                        {title}
                    </h1>
                    <p className="font-serif italic text-sm sm:text-base text-[#78716C] dark:text-[#A8A29E] max-w-xl mx-auto leading-relaxed">
                        {description}
                    </p>
                </div>

                {/* Category Switcher Pills */}
                <div className="border-t border-[#E7E5E4] dark:border-[#262422]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-4 overflow-x-auto py-3 text-xs no-scrollbar">
                        <Link
                            href="/"
                            className="whitespace-nowrap px-3 py-1 rounded-full border border-[#E7E5E4] dark:border-[#262422] text-[#78716C] hover:border-[#C2410C]"
                        >
                            All Dispatches
                        </Link>
                        {categories.map((c) => (
                            <Link
                                key={c.id}
                                href={`/category/${c.slug}`}
                                className={`whitespace-nowrap px-3 py-1 rounded-full text-xs transition-all ${
                                    currentSlug === c.slug
                                        ? 'bg-[#1C1917] dark:bg-white text-white dark:text-[#1C1917] font-semibold'
                                        : 'border border-[#E7E5E4] dark:border-[#262422] text-[#78716C] hover:border-[#C2410C]'
                                }`}
                            >
                                {c.name} ({c.posts_count})
                            </Link>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main Grid */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
                {posts.data.length === 0 ? (
                    <div className="py-16 text-center space-y-3">
                        <p className="font-serif italic text-lg text-[#78716C] dark:text-[#A8A29E]">
                            No dispatches filed under this archive yet.
                        </p>
                        <Link href="/" className="text-xs text-[#C2410C] hover:underline font-medium">
                            Return to Front Page
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.data.map((post) => (
                            <article
                                key={post.id}
                                className="flex flex-col justify-between border border-[#E7E5E4] dark:border-[#262422] rounded-xl overflow-hidden bg-[#FAF7F2] dark:bg-[#181716] transition-all hover:shadow-md hover:border-[#C2410C]/40 group"
                            >
                                <div>
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
                                                The Kelana Archive
                                            </div>
                                        )}
                                    </Link>

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
            </main>

            <footer className="border-t border-[#E7E5E4] dark:border-[#262422] py-8 text-center text-xs text-[#78716C] dark:text-[#A8A29E] font-serif italic">
                The Kelana Club • Real Routes by Real Travelers • Worldwide Field Archives
            </footer>
        </div>
    );
}
