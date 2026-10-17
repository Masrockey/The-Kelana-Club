import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowUpRight,
    Bot,
    CheckCircle2,
    Compass,
    ExternalLink,
    FileText,
    Search,
    ShieldAlert,
    Sparkles,
} from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
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
    totalBotCrawls: number;
    totalPosts: number;
    goodSeo: number;
    okSeo: number;
    poorSeo: number;
}

interface BotItem {
    bot_name: string;
    count: number;
}

interface BotTimeline {
    date: string;
    crawls: number;
}

interface BotLog {
    id: number;
    bot_name: string;
    url: string;
    ip_address: string;
    country_name: string;
    created_at: string;
}

interface SearchReferrer {
    referrer_domain: string;
    count: number;
}

interface PostNeedingSeo {
    id: number;
    title: string;
    slug: string;
    seo_score: number;
    focus_keyword: string | null;
    views_count: number;
    category?: {
        name: string;
    };
}

interface Props {
    metrics: MetricData;
    botBreakdown: BotItem[];
    botTimeline: BotTimeline[];
    recentBotLogs: BotLog[];
    searchReferrers: SearchReferrer[];
    postsNeedingSeo: PostNeedingSeo[];
}

const BOT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function SeoAnalytics({
    metrics,
    botBreakdown,
    botTimeline,
    recentBotLogs,
    searchReferrers,
    postsNeedingSeo,
}: Props) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'SEO & Crawlers', href: '/admin/analytics/seo' },
            ]}
        >
            <Head title="SEO Intelligence & Search Bot Crawlers — The Kelana Club" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                            SEO Analytics & Search Engine Crawler Engine
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Monitor search engine indexing bots, schema accuracy, organic search referrals, and sitewide SEO scores.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View Live sitemap.xml
                            </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <a href="/robots.txt" target="_blank" rel="noopener noreferrer">
                                <FileText className="mr-2 h-4 w-4" />
                                View robots.txt
                            </a>
                        </Button>
                    </div>
                </div>

                {/* 4 Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Verified Bot Crawls</CardTitle>
                            <Bot className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.totalBotCrawls.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">Googlebot, Bingbot & spiders</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Good SEO Score (&gt;80)</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {metrics.goodSeo} / {metrics.totalPosts}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Well-optimized articles</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Needs Attention (55-79)</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                {metrics.okSeo} articles
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Minor keyword adjustments recommended</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Poor SEO (&lt;55)</CardTitle>
                            <ShieldAlert className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {metrics.poorSeo} articles
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Missing meta description or focus keywords</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Bot Indexing Breakdown & Crawl Timeline */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Bot Engine Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Search Crawler Distribution</CardTitle>
                            <CardDescription>Verified search engine bot crawl frequencies</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[240px] w-full pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={botBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                                    <XAxis dataKey="bot_name" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
                                    <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--background, #fff)',
                                            borderColor: 'var(--border, #e2e8f0)',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                        }}
                                    />
                                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Crawl Requests">
                                        {botBreakdown.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={BOT_COLORS[index % BOT_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Organic Search Referrals */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Organic Search Referrers</CardTitle>
                            <CardDescription>Search engines sending verified readership traffic</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {searchReferrers.length === 0 ? (
                                <p className="text-xs text-muted-foreground py-8 text-center">
                                    No external organic search engines logged yet.
                                </p>
                            ) : (
                                searchReferrers.map((sr) => (
                                    <div
                                        key={sr.referrer_domain}
                                        className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20 text-xs"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Search className="h-4 w-4 text-blue-500 shrink-0" />
                                            <span className="font-semibold text-foreground">{sr.referrer_domain}</span>
                                        </div>
                                        <Badge variant="secondary" className="font-mono">
                                            {sr.count} visits
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Articles Needing Optimization */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-semibold">Content Needing SEO Refinement</CardTitle>
                            <CardDescription>
                                Priority list of articles ranked by lowest SEO score for quick ranking improvements
                            </CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/posts">
                                All Posts <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {postsNeedingSeo.map((p) => (
                                <div
                                    key={p.id}
                                    className="flex flex-col justify-between p-3.5 rounded-xl border bg-card hover:border-primary/40 transition-all space-y-3"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <Badge
                                                className={
                                                    p.seo_score >= 80
                                                        ? 'bg-emerald-500/10 text-emerald-600'
                                                        : p.seo_score >= 55
                                                        ? 'bg-amber-500/10 text-amber-600'
                                                        : 'bg-red-500/10 text-red-600'
                                                }
                                            >
                                                SEO Score: {p.seo_score}/100
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">{p.views_count} views</span>
                                        </div>
                                        <h4 className="text-sm font-medium line-clamp-1 text-foreground">{p.title}</h4>
                                        <p className="text-xs text-muted-foreground">
                                            Keyword: {p.focus_keyword || 'None defined'}
                                        </p>
                                    </div>

                                    <Button variant="outline" size="sm" asChild className="w-full text-xs h-8">
                                        <Link href={`/admin/posts/${p.id}/edit`}>Optimize Article</Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Real-time Crawler Access Logs */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Live Crawler Access Stream</CardTitle>
                        <CardDescription>Recent search bot indexing events captured by the middleware</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b bg-muted/40 uppercase text-muted-foreground">
                                    <tr>
                                        <th className="py-2.5 px-4">Bot Agent</th>
                                        <th className="py-2.5 px-4">Target URL</th>
                                        <th className="py-2.5 px-4">IP Address</th>
                                        <th className="py-2.5 px-4">Origin Hub</th>
                                        <th className="py-2.5 px-4 text-right">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {recentBotLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-muted/30">
                                            <td className="py-2.5 px-4 font-semibold text-foreground">
                                                <div className="flex items-center gap-1.5">
                                                    <Bot className="h-3.5 w-3.5 text-blue-500" />
                                                    {log.bot_name}
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-4 font-mono truncate max-w-[260px]">
                                                {log.url.replace(/^https?:\/\/[^\/]+/, '')}
                                            </td>
                                            <td className="py-2.5 px-4 font-mono text-muted-foreground">
                                                {log.ip_address}
                                            </td>
                                            <td className="py-2.5 px-4 text-muted-foreground">
                                                {log.country_name || 'US'}
                                            </td>
                                            <td className="py-2.5 px-4 text-right text-muted-foreground font-mono">
                                                {new Date(log.created_at).toLocaleString([], {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
