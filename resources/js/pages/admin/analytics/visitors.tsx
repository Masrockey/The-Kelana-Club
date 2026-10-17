import { Head } from '@inertiajs/react';
import {
    Activity,
    Clock,
    Compass,
    Eye,
    Globe,
    Laptop,
    Smartphone,
    Tablet,
    Users,
} from 'lucide-react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

interface Props {
    metrics: {
        totalViews: number;
        uniqueVisitors: number;
        todayViews: number;
        todayUniques: number;
    };
    timeline: { date: string; views: number; uniques: number }[];
    hourly: { hour: string; visits: number }[];
    devices: { device_type: string; count: number }[];
    browsers: { browser: string; count: number }[];
    operatingSystems: { os: string; count: number }[];
    referrers: { referrer_domain: string; count: number }[];
    topPages: { url: string; views: number; uniques: number }[];
}

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

export default function VisitorsAnalytics({
    metrics,
    timeline,
    hourly,
    devices,
    browsers,
    operatingSystems,
    referrers,
    topPages,
}: Props) {
    const totalDeviceVisits = devices.reduce((a, b) => a + b.count, 0) || 1;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Visitor Statistics', href: '/admin/analytics/visitors' },
            ]}
        >
            <Head title="Visitor Analytics & Audience Dynamics — The Kelana Club" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        Visitor Analytics & Audience Metrics
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Deep inspection of page impressions, session uniqueness, reading schedules, and hardware platforms.
                    </p>
                </div>

                {/* 4 Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">All-Time Impressions</CardTitle>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.totalViews.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">Aggregated public reads</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Unique Audiences</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.uniqueVisitors.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">Distinct readers by IP & session</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Today's Impressions</CardTitle>
                            <Activity className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.todayViews.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">Visits recorded today</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Today's Uniques</CardTitle>
                            <Clock className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.todayUniques.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">New readers active today</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Views Curve */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">30-Day Impression Dynamics</CardTitle>
                        <CardDescription>Daily breakdown of total reads versus unique visitors</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[280px] w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
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
                                    stroke="#0ea5e9"
                                    strokeWidth={2}
                                    fill="#0ea5e9"
                                    fillOpacity={0.15}
                                    name="Impressions"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="uniques"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    fill="#10b981"
                                    fillOpacity={0.15}
                                    name="Uniques"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Peak Hours & Device Breakdown */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Hourly Distribution Bar Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Reading Hours Heatmap (24h)</CardTitle>
                            <CardDescription>When your audience is most engaged throughout the day</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[260px] w-full pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={hourly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                                    <XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
                                    <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--background, #fff)',
                                            borderColor: 'var(--border, #e2e8f0)',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                        }}
                                    />
                                    <Bar dataKey="visits" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Reads" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Hardware & Platforms */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Platform & Hardware Split</CardTitle>
                            <CardDescription>Desktop, mobile, and tablet audience distribution</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-2">
                            {devices.map((d) => {
                                const percent = Math.round((d.count / totalDeviceVisits) * 100);
                                const Icon =
                                    d.device_type === 'mobile'
                                        ? Smartphone
                                        : d.device_type === 'tablet'
                                        ? Tablet
                                        : Laptop;
                                return (
                                    <div key={d.device_type} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="flex items-center gap-2 font-medium capitalize">
                                                <Icon className="h-4 w-4 text-muted-foreground" />
                                                {d.device_type}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {d.count} ({percent}%)
                                            </span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all"
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}

                            <div className="grid grid-cols-2 gap-4 border-t pt-4">
                                <div>
                                    <div className="text-xs font-semibold mb-2 text-muted-foreground">Top Browsers</div>
                                    <div className="space-y-1.5 text-xs">
                                        {browsers.map((b) => (
                                            <div key={b.browser} className="flex justify-between">
                                                <span>{b.browser}</span>
                                                <span className="text-muted-foreground">{b.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs font-semibold mb-2 text-muted-foreground">Top Operating Systems</div>
                                    <div className="space-y-1.5 text-xs">
                                        {operatingSystems.map((o) => (
                                            <div key={o.os} className="flex justify-between">
                                                <span>{o.os}</span>
                                                <span className="text-muted-foreground">{o.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom: Top Referrers & Top Visited Pages */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Referrers */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Inbound Referrers</CardTitle>
                            <CardDescription>Where your audience discovers your dispatches</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-xs">
                                {referrers.map((r, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between py-2 border-b last:border-b-0"
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <Compass className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                            <span className="font-mono truncate">{r.referrer_domain || 'Direct / Bookmark'}</span>
                                        </div>
                                        <Badge variant="secondary" className="shrink-0">
                                            {r.count} visits
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Pages */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Top Visited URLs</CardTitle>
                            <CardDescription>Most requested endpoints by public readers</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-xs">
                                {topPages.map((p, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between py-2 border-b last:border-b-0"
                                    >
                                        <span className="font-mono truncate max-w-[280px]">
                                            {p.url.replace(/^https?:\/\/[^\/]+/, '') || '/'}
                                        </span>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className="font-semibold">{p.views} views</span>
                                            <span className="text-muted-foreground">({p.uniques} unique)</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
