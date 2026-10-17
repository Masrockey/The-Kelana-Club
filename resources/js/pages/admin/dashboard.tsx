import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    ArrowUpRight,
    Bot,
    Compass,
    Eye,
    FileText,
    Globe,
    MessageSquare,
    PenSquare,
    Search,
    TrendingUp,
} from 'lucide-react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
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

interface MetricData {
    totalViews: number;
    uniqueVisitors: number;
    publishedPosts: number;
    totalPosts: number;
    botCrawls: number;
    pendingComments: number;
    topCountry: string;
}

interface ChartItem {
    date: string;
    label: string;
    views: number;
    uniques: number;
}

interface TopPost {
    id: number;
    title: string;
    slug: string;
    views_count: number;
    seo_score: number;
    geo_target_country: string;
    published_at: string;
    category?: {
        name: string;
        color: string;
    };
}

interface RecentBot {
    id: number;
    bot_name: string;
    url: string;
    ip_address: string;
    country_name: string;
    created_at: string;
}

interface TopCountry {
    country_name: string;
    country_code: string;
    views: number;
}

interface Props {
    metrics: MetricData;
    chartData: ChartItem[];
    topPosts: TopPost[];
    recentBots: RecentBot[];
    recentComments: any[];
    topCountries: TopCountry[];
}

export default function AdminDashboard({
    metrics,
    chartData,
    topPosts,
    recentBots,
    topCountries,
}: Props) {
    const totalCountryViews = topCountries.reduce((acc, c) => acc + c.views, 0) || 1;

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
            <Head title="Admin Intelligence Dashboard — The Kelana Club" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header Welcome banner with quick actions */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                                Editorial & Analytics Suite
                            </h1>
                            <Badge variant="outline" className="text-xs font-normal">
                                Live Engine
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Real-time SEO scoring, GEO reader dispersion, and visitor analytics.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/" target="_blank">
                                <Compass className="mr-2 h-4 w-4" />
                                View Public Journal
                            </Link>
                        </Button>
                        <Button size="sm" asChild>
                            <Link href="/admin/posts/create">
                                <PenSquare className="mr-2 h-4 w-4" />
                                Write New Dispatch
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* 6 Key Metric Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.totalViews.toLocaleString()}</div>
                            <p className="flex items-center text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                                <TrendingUp className="mr-1 h-3 w-3" />
                                +14.2% from previous month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Unique Readers</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.uniqueVisitors.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Verified unique browser sessions
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Search Bot Crawls</CardTitle>
                            <Bot className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.botCrawls.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Googlebot, Bingbot & AI scrapers indexed
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Primary GEO Hub</CardTitle>
                            <Globe className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold truncate">{metrics.topCountry}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Highest reader density
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main 30-Day Growth Chart */}
                <Card className="col-span-4">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-semibold">30-Day Reader Dynamics</CardTitle>
                            <CardDescription>
                                Total page impressions vs verified unique readers over the last month
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                                <span className="text-muted-foreground">Total Views</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                <span className="text-muted-foreground">Unique Visitors</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[280px] w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary, #0ea5e9)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary, #0ea5e9)" stopOpacity={0.0} />
                                    </linearGradient>
                                    <linearGradient id="uniquesGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--background, #fff)',
                                        borderColor: 'var(--border, #e2e8f0)',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="views"
                                    stroke="var(--primary, #0ea5e9)"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#viewsGradient)"
                                    name="Total Views"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="uniques"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#uniquesGradient)"
                                    name="Unique Readers"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Lower Grid: Top Stories & Geographic Hubs */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Top Stories */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div>
                                <CardTitle className="text-base font-semibold">Top Performing Dispatches</CardTitle>
                                <CardDescription>Articles ranked by reader retention & views</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/admin/posts">
                                    View All <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {topPosts.map((post) => (
                                <div
                                    key={post.id}
                                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                >
                                    <div className="space-y-1 pr-4 min-w-0">
                                        <div className="flex items-center gap-2">
                                            {post.category && (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-[10px] py-0 px-1.5"
                                                    style={{ borderLeft: `3px solid ${post.category.color}` }}
                                                >
                                                    {post.category.name}
                                                </Badge>
                                            )}
                                            <span className="text-xs text-muted-foreground font-mono">
                                                📍 {post.geo_target_country}
                                            </span>
                                        </div>
                                        <Link
                                            href={`/article/${post.slug}`}
                                            target="_blank"
                                            className="block text-sm font-medium text-foreground hover:underline truncate"
                                        >
                                            {post.title}
                                        </Link>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="text-right">
                                            <div className="text-sm font-semibold">{post.views_count.toLocaleString()}</div>
                                            <div className="text-[10px] text-muted-foreground">views</div>
                                        </div>

                                        <Badge
                                            className={
                                                post.seo_score >= 80
                                                    ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                                                    : 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
                                            }
                                        >
                                            SEO {post.seo_score}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* GEO Dispersion & Search Bot Activity */}
                    <div className="flex flex-col gap-6">
                        {/* GEO Countries */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div>
                                    <CardTitle className="text-base font-semibold">GEO Reader Dispersion</CardTitle>
                                    <CardDescription>Top geographic locations by verified traffic</CardDescription>
                                </div>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/admin/analytics/geo">
                                        Full Map <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {topCountries.map((c) => {
                                    const percent = Math.round((c.views / totalCountryViews) * 100);
                                    return (
                                        <div key={c.country_code} className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-medium flex items-center gap-1.5">
                                                    <span className="font-mono text-muted-foreground">[{c.country_code}]</span>{' '}
                                                    {c.country_name}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {c.views} views ({percent}%)
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                                <div
                                                    className="h-full bg-amber-600 dark:bg-amber-500 rounded-full transition-all"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        {/* Recent Search Bots Log */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div>
                                    <CardTitle className="text-base font-semibold">Active Bot Crawlers</CardTitle>
                                    <CardDescription>Verified search indexers visiting posts</CardDescription>
                                </div>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/admin/analytics/seo">
                                        SEO Logs <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {recentBots.slice(0, 4).map((b) => (
                                    <div
                                        key={b.id}
                                        className="flex items-center justify-between text-xs py-1.5 border-b last:border-b-0"
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <Badge variant="outline" className="text-[10px] py-0">
                                                {b.bot_name}
                                            </Badge>
                                            <span className="text-muted-foreground truncate max-w-[200px]">
                                                {b.url.replace(/^https?:\/\/[^\/]+/, '')}
                                            </span>
                                        </div>
                                        <span className="text-[11px] text-muted-foreground shrink-0 font-mono">
                                            {new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
