import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    ArrowDown,
    ArrowUp,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    Database,
    Download,
    ExternalLink,
    Filter,
    Flame,
    Globe,
    Info,
    Layers,
    MoreVertical,
    Newspaper,
    PenSquare,
    Plus,
    RefreshCw,
    Search,
    ShieldCheck,
    Trash2,
    TrendingUp,
    X,
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
import OpenStreetMap from '@/components/open-street-map';
import ConfirmDialog from '@/components/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface TimelinePoint {
    time: string;
    datetime: string;
    interest: number;
}

interface RegionItem {
    name: string;
    interest: number;
}

interface QueryItem {
    rank: number;
    query: string;
    interest: number;
    change: string;
    type: 'top' | 'rising';
}

interface ExploreData {
    keyword: string;
    geo: string;
    timeRange: string;
    metrics: {
        growth24h: string;
        growthPrevWeek: string;
    };
    timeline: TimelinePoint[];
    regions: RegionItem[];
    topQueries: QueryItem[];
    risingQueries: QueryItem[];
}

interface TrendItem {
    id: number;
    geo: string;
    query: string;
    approx_traffic: string | null;
    description: string | null;
    picture_url: string | null;
    news_title: string | null;
    news_url: string | null;
    news_source: string | null;
    published_at: string | null;
    fetched_at: string;
}

interface CacheInfo {
    fetchedAt: string | null;
    expiresAt: string | null;
    remainingMinutes: number;
    cacheTtlHours: number;
    count: number;
}

interface Props {
    mode?: 'explore' | 'trending';
    keyword?: string;
    currentGeo?: string;
    timeRange?: string;
    exploreData: ExploreData;
    dailyTrends: TrendItem[];
    supportedGeos: Record<string, string>;
    cacheInfo: CacheInfo;
}

export default function GoogleTrendsExplorer({
    mode = 'explore',
    keyword = 'hotel',
    currentGeo = 'GLOBAL',
    timeRange = '24h',
    exploreData,
    dailyTrends = [],
    supportedGeos = {},
    cacheInfo,
}: Props) {
    const [activeTab, setActiveTab] = useState<'explore' | 'trending'>(mode);
    const [searchInput, setSearchInput] = useState(keyword);
    const [isEditingTerm, setIsEditingTerm] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isPurging, setIsPurging] = useState(false);
    const [showPurgeModal, setShowPurgeModal] = useState(false);

    // Pagination states for sub-tables
    const [regionPage, setRegionPage] = useState(0);
    const [topQueriesPage, setTopQueriesPage] = useState(0);
    const [risingQueriesPage, setRisingQueriesPage] = useState(0);
    const itemsPerPage = 5;

    function handleSearch(term: string, geo = currentGeo, time = timeRange) {
        const cleanTerm = term.trim() || 'hotel';
        setActiveTab('explore');
        setIsEditingTerm(false);
        router.get(
            '/admin/trends',
            {
                mode: 'explore',
                q: cleanTerm,
                geo,
                time,
            },
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    }

    function handleGeoChange(newGeo: string) {
        if (activeTab === 'explore') {
            handleSearch(keyword, newGeo, timeRange);
        } else {
            router.get(
                '/admin/trends',
                {
                    mode: 'trending',
                    geo: newGeo,
                },
                {
                    preserveScroll: true,
                    preserveState: true,
                }
            );
        }
    }

    function handleTimeChange(newTime: string) {
        handleSearch(keyword, currentGeo, newTime);
    }

    function handleForceRefresh() {
        setIsRefreshing(true);
        router.post(
            '/admin/trends/refresh',
            { geo: currentGeo },
            {
                preserveScroll: true,
                onFinish: () => setIsRefreshing(false),
            }
        );
    }

    function handleManualPurge() {
        setShowPurgeModal(true);
    }

    function executePurge() {
        setIsPurging(true);
        router.post(
            '/admin/trends/purge',
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsPurging(false);
                    setShowPurgeModal(false);
                },
            }
        );
    }

    const currentGeoLabel = supportedGeos[currentGeo] || (currentGeo === 'GLOBAL' ? 'Worldwide' : currentGeo);

    // Paginated datasets
    const paginatedRegions = exploreData?.regions?.slice(
        regionPage * itemsPerPage,
        (regionPage + 1) * itemsPerPage
    ) || [];

    const paginatedTopQueries = exploreData?.topQueries?.slice(
        topQueriesPage * itemsPerPage,
        (topQueriesPage + 1) * itemsPerPage
    ) || [];

    const paginatedRisingQueries = exploreData?.risingQueries?.slice(
        risingQueriesPage * itemsPerPage,
        (risingQueriesPage + 1) * itemsPerPage
    ) || [];

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Kelana Trends', href: '/admin/trends' },
            ]}
        >
            <Head title={`Kelana Trends - Explore: "${keyword}"`} />

            <div className="flex flex-1 flex-col gap-5 bg-slate-50/60 p-4 font-sans text-slate-800 dark:bg-zinc-950 dark:text-zinc-100 md:p-8">
                {/* 1. Google Trends Top Navigation Bar */}
                <div className="flex flex-col gap-3 rounded-xl border border-slate-200/90 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-6">
                        {/* Logo */}
                        <div className="flex items-center gap-1.5 pl-2 font-medium">
                            <span className="flex items-center text-lg font-bold tracking-tight">
                                <span className="ml-1 text-slate-700 dark:text-zinc-300">The Kelana Club Trends</span>
                            </span>
                        </div>

                        {/* Google Trends Sub-Nav Tabs */}
                        <div className="flex items-center gap-1 border-l pl-4 dark:border-zinc-800">
                            <button
                                type="button"
                                onClick={() => handleSearch('hotel', currentGeo)}
                                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${activeTab === 'explore'
                                    ? 'border-b-2 border-[#1a73e8] font-semibold text-[#1a73e8]'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                                    }`}
                            >
                                Explore
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('trending')}
                                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${activeTab === 'trending'
                                    ? 'border-b-2 border-[#1a73e8] font-semibold text-[#1a73e8]'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                                    }`}
                            >
                                Trending now
                            </button>
                        </div>
                    </div>

                    {/* Cache & Rate-limit Indicator */}
                    <div className="flex items-center gap-2 pr-2">
                        <Badge
                            variant="secondary"
                            className="gap-1 border border-emerald-200 bg-emerald-50 text-[11px] font-medium text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300"
                        >
                            <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Database Cache: Auto-Purge 3 Jam</span>
                        </Badge>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleManualPurge}
                            disabled={isPurging}
                            className="h-6 gap-1 rounded-md border-rose-200 bg-rose-50/70 px-2 text-[11px] font-medium text-rose-700 hover:bg-rose-100 hover:text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60"
                            title="Hapus / Purge manual seluruh cache database trends"
                        >
                            <Trash2 className={`h-3 w-3 ${isPurging ? 'animate-spin' : ''}`} />
                            <span>Purge Manual</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleForceRefresh}
                            disabled={isRefreshing}
                            className="h-8 w-8 text-slate-500 hover:text-slate-800"
                            title="Refresh Data"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
                        </Button>
                    </div>
                </div>

                {activeTab === 'explore' ? (
                    <>
                        {/* 2. Explore search trends Header & Term Card */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                                        Explore search trends
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchInput('');
                                                setIsEditingTerm(true);
                                            }}
                                            className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                                        >
                                            Clear
                                        </button>
                                        <span className="text-slate-300 dark:text-zinc-700">|</span>
                                        <button
                                            type="button"
                                            onClick={() => handleSearch('travel', currentGeo)}
                                            className="text-xs font-medium text-[#1a73e8] hover:underline"
                                        >
                                            Suggest search terms
                                        </button>
                                    </div>
                                </div>

                                {/* Active Search Term Chip & Comparison Button */}
                                <div className="flex flex-wrap items-center gap-3">
                                    {isEditingTerm ? (
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                handleSearch(searchInput);
                                            }}
                                            className="flex items-center gap-2"
                                        >
                                            <Input
                                                type="text"
                                                autoFocus
                                                value={searchInput}
                                                onChange={(e) => setSearchInput(e.target.value)}
                                                placeholder="Ketik topik atau istilah penelusuran..."
                                                className="h-10 w-64 text-sm"
                                            />
                                            <Button type="submit" size="sm" className="h-10 bg-[#1a73e8] text-white hover:bg-[#1557b0]">
                                                Jelajahi
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setIsEditingTerm(false)}
                                                className="h-10"
                                            >
                                                Batal
                                            </Button>
                                        </form>
                                    ) : (
                                        <div className="group relative flex h-14 min-w-[200px] items-center justify-between gap-4 rounded-xl border border-blue-200 bg-blue-50/60 px-4 transition-all hover:bg-blue-50 dark:border-blue-900/60 dark:bg-blue-950/30">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-3 w-3 rounded-full bg-[#1a73e8]" />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                                        {keyword}
                                                    </span>
                                                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                                                        Search term
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setIsEditingTerm(true)}
                                                className="rounded-full p-1.5 text-slate-400 hover:bg-blue-100 hover:text-slate-700 dark:hover:bg-blue-900/50"
                                                title="Ganti istilah penelusuran"
                                            >
                                                <Search className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    )}

                                    {/* Add Comparison Button */}
                                    <button
                                        type="button"
                                        onClick={() => setIsEditingTerm(true)}
                                        className="flex h-14 items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 text-xs font-medium text-slate-500 transition-colors hover:border-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:border-zinc-700 dark:hover:bg-zinc-800"
                                    >
                                        <Plus className="h-4 w-4" />
                                        <span>Ganti / Bandingkan istilah</span>
                                    </button>
                                </div>

                                {/* Filter Controls Bar: Geo, TimeRange, Category, SearchType */}
                                <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
                                    {/* Country Selector */}
                                    <div className="relative">
                                        <select
                                            value={currentGeo}
                                            onChange={(e) => handleGeoChange(e.target.value)}
                                            className="h-8 rounded-full border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 focus:border-[#1a73e8] focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                                        >
                                            <option value="GLOBAL">🌐 Worldwide</option>
                                            <option value="ID">🇮🇩 Indonesia</option>
                                            <option value="US">🇺🇸 United States</option>
                                            <option value="GB">🇬🇧 United Kingdom</option>
                                            <option value="SG">🇸🇬 Singapore</option>
                                            <option value="MY">🇲🇾 Malaysia</option>
                                            <option value="AU">🇦🇺 Australia</option>
                                            <option value="JP">🇯🇵 Japan</option>
                                        </select>
                                    </div>

                                    {/* Time Range Selector */}
                                    <div className="relative">
                                        <select
                                            value={timeRange}
                                            onChange={(e) => handleTimeChange(e.target.value)}
                                            className="h-8 rounded-full border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 focus:border-[#1a73e8] focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                                        >
                                            <option value="24h">📅 Past 24 hours</option>
                                            <option value="7d">📅 Past 7 days</option>
                                            <option value="30d">📅 Past 30 days</option>
                                            <option value="12m">📅 Past 12 months</option>
                                        </select>
                                    </div>

                                    {/* Category */}
                                    <div className="relative">
                                        <select
                                            disabled
                                            className="h-8 rounded-full border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 shadow-2xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                                        >
                                            <option>📁 All Categories</option>
                                        </select>
                                    </div>

                                    {/* Search Type */}
                                    <div className="relative">
                                        <select
                                            disabled
                                            className="h-8 rounded-full border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 shadow-2xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                                        >
                                            <option>🌐 Web Search</option>
                                        </select>
                                    </div>

                                    {/* Direct Post Creation Action */}
                                    <div className="ml-auto">
                                        <Button
                                            asChild
                                            size="sm"
                                            className="h-8 gap-1.5 bg-[#1a73e8] text-xs font-semibold text-white hover:bg-[#1557b0]"
                                        >
                                            <Link href={`/admin/posts/create?title=${encodeURIComponent(keyword)}&focus_keyword=${encodeURIComponent(keyword)}`}>
                                                <PenSquare className="h-3.5 w-3.5" />
                                                Tulis Artikel Topik Ini
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Card: Interest over time */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                                Interest over time
                                            </h3>
                                            <Info className="h-3.5 w-3.5 text-slate-400" />
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                                            {currentGeoLabel} · {timeRange === '24h' ? 'Past 24 hours' : timeRange}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800"
                                        title="Download data"
                                    >
                                    </button>
                                </div>

                                {/* Metric Badges */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-[#1a73e8] dark:border-blue-900/50 dark:bg-blue-950/40">
                                        <ArrowUp className="h-3 w-3" />
                                        <span>+10% vs. preceding 24 hours</span>
                                    </div>
                                    <div className="flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-[#1a73e8] dark:border-blue-900/50 dark:bg-blue-950/40">
                                        <ArrowUp className="h-3 w-3" />
                                        <span>+10% vs. same time previous week</span>
                                    </div>
                                </div>

                                {/* Interest Over Time Chart */}
                                <div className="relative mt-2 h-72 w-full">
                                    {/* Google Trends watermark */}
                                    <div className="pointer-events-none absolute left-12 top-2 z-10 flex items-center gap-1 text-[11px] font-medium text-slate-400/80">
                                        <TrendingUp className="h-3.5 w-3.5" />
                                        <span>Google Trends</span>
                                    </div>

                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart
                                            data={exploreData.timeline}
                                            margin={{ top: 10, right: 20, left: -15, bottom: 0 }}
                                        >
                                            <defs>
                                                <linearGradient id="trendsGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#1a73e8" stopOpacity={0.25} />
                                                    <stop offset="95%" stopColor="#1a73e8" stopOpacity={0.0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="time"
                                                tickLine={false}
                                                axisLine={{ stroke: '#e2e8f0' }}
                                                tick={{ fill: '#64748b', fontSize: 11 }}
                                            />
                                            <YAxis
                                                domain={[0, 100]}
                                                ticks={[0, 20, 40, 60, 80, 100]}
                                                tickLine={false}
                                                axisLine={{ stroke: '#e2e8f0' }}
                                                tick={{ fill: '#64748b', fontSize: 11 }}
                                            />
                                            <Tooltip
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload as TimelinePoint;
                                                        return (
                                                            <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-md dark:border-zinc-700 dark:bg-zinc-800">
                                                                <span className="block text-[11px] text-slate-500 dark:text-zinc-400">
                                                                    {data.datetime || data.time}
                                                                </span>
                                                                <div className="mt-1 flex items-center gap-2">
                                                                    <div className="h-2.5 w-2.5 rounded-full bg-[#1a73e8]" />
                                                                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                                                                        {keyword}: <span className="font-mono text-sm">{data.interest}</span>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="interest"
                                                stroke="#1a73e8"
                                                strokeWidth={2.5}
                                                fillOpacity={1}
                                                fill="url(#trendsGradient)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* 4. Card: Interest by region */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                                Interest by region
                                            </h3>
                                            <Info className="h-3.5 w-3.5 text-slate-400" />
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                                            {currentGeoLabel} · {timeRange === '24h' ? 'Past 24 hours' : timeRange}
                                        </p>
                                    </div>

                                </div>

                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                                    {/* Left: OpenStreetMap Map */}
                                    <div className="flex flex-col gap-2 lg:col-span-6">
                                        <OpenStreetMap
                                            geo={currentGeo}
                                            regions={exploreData.regions}
                                            keyword={keyword}
                                        />
                                        <div className="flex items-center justify-between px-1 text-[11px] text-slate-500">
                                            <span className="flex items-center gap-1.5">
                                                <Globe className="h-3 w-3 text-[#1a73e8]" />
                                                Klik titik peta untuk detail minat pencarian OpenStreetMap
                                            </span>
                                            <div className="flex items-center gap-1.5">
                                                <span>Rendah</span>
                                                <div className="h-2 w-20 rounded-full bg-gradient-to-r from-blue-200 via-sky-400 to-[#1a73e8]" />
                                                <span>Tinggi</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Ranked Regions Table */}
                                    <div className="flex flex-col justify-between lg:col-span-6">
                                        <div className="overflow-hidden">
                                            <div className="flex items-center justify-between border-b pb-2 text-[11px] font-semibold text-slate-500 dark:border-zinc-800">
                                                <span>Region</span>
                                                <span>Search interest</span>
                                            </div>

                                            <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                                                {paginatedRegions.map((region, idx) => {
                                                    const rankNum = regionPage * itemsPerPage + idx + 1;
                                                    return (
                                                        <div
                                                            key={region.name}
                                                            className="flex items-center justify-between py-2.5 text-xs transition-colors hover:bg-slate-50/70 dark:hover:bg-zinc-800/40"
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                <span className="w-4 text-center font-mono text-slate-400">
                                                                    {rankNum}
                                                                </span>
                                                                <span className="font-medium text-slate-800 dark:text-zinc-200">
                                                                    {region.name}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-3">
                                                                <div className="h-2.5 w-32 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                                                                    <div
                                                                        className="h-full rounded-full bg-[#1a73e8]"
                                                                        style={{ width: `${region.interest}%` }}
                                                                    />
                                                                </div>
                                                                <span className="w-8 text-right font-mono text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                                                    {region.interest}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Pagination */}
                                        <div className="flex items-center justify-end gap-2 pt-3 border-t text-xs text-slate-500 dark:border-zinc-800">
                                            <span>
                                                {regionPage * itemsPerPage + 1} -{' '}
                                                {Math.min((regionPage + 1) * itemsPerPage, exploreData.regions.length)} of{' '}
                                                {exploreData.regions.length}
                                            </span>
                                            <button
                                                type="button"
                                                disabled={regionPage === 0}
                                                onClick={() => setRegionPage((p) => Math.max(0, p - 1))}
                                                className="rounded p-1 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-zinc-800"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                disabled={(regionPage + 1) * itemsPerPage >= exploreData.regions.length}
                                                onClick={() => setRegionPage((p) => p + 1)}
                                                className="rounded p-1 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-zinc-800"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 5. Card: Commonly searched queries (Top & Rising) */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="flex flex-col gap-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                        Commonly searched queries
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                                        People who searched for <strong className="text-slate-800 dark:text-zinc-200 font-semibold">{keyword}</strong> also searched for these queries
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {/* Top queries table */}
                                    <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/40 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                                        <div>
                                            <div className="flex items-center justify-between pb-2">
                                                <div>
                                                    <div className="flex items-center gap-1">
                                                        <h4 className="text-xs font-bold uppercase text-slate-800 dark:text-zinc-200">
                                                            Top queries
                                                        </h4>
                                                        <Info className="h-3 w-3 text-slate-400" />
                                                    </div>
                                                    <span className="text-[11px] text-slate-400">
                                                        {currentGeoLabel} · {timeRange}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-2 flex items-center justify-between border-b pb-1.5 text-[11px] font-semibold text-slate-400 dark:border-zinc-800">
                                                <span>Query</span>
                                                <div className="flex items-center gap-6">
                                                    <span>Search interest</span>
                                                    <span>Change</span>
                                                </div>
                                            </div>

                                            <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                                                {paginatedTopQueries.map((item, idx) => {
                                                    const isNegative = item.change.startsWith('-');
                                                    return (
                                                        <div
                                                            key={item.query}
                                                            className="group flex items-center justify-between py-2 text-xs transition-colors hover:bg-white dark:hover:bg-zinc-800/60"
                                                        >
                                                            <div className="flex items-center gap-2 overflow-hidden pr-2">
                                                                <span className="w-4 font-mono text-[11px] text-slate-400">
                                                                    {topQueriesPage * itemsPerPage + idx + 1}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleSearch(item.query)}
                                                                    className="truncate text-left font-medium text-slate-800 hover:text-[#1a73e8] dark:text-zinc-200"
                                                                >
                                                                    {item.query}
                                                                </button>
                                                            </div>

                                                            <div className="flex items-center gap-4 shrink-0">
                                                                <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800">
                                                                    <div
                                                                        className="h-full rounded-full bg-[#1a73e8]"
                                                                        style={{ width: `${item.interest}%` }}
                                                                    />
                                                                </div>
                                                                <span
                                                                    className={`w-12 text-right font-mono text-[11px] font-semibold ${isNegative ? 'text-slate-500' : 'text-emerald-600 dark:text-emerald-400'
                                                                        }`}
                                                                >
                                                                    {item.change}
                                                                </span>
                                                                <Link
                                                                    href={`/admin/posts/create?title=${encodeURIComponent(item.query)}&focus_keyword=${encodeURIComponent(item.query)}`}
                                                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-[#1a73e8]"
                                                                    title="Tulis artikel dari kueri ini"
                                                                >
                                                                    <PenSquare className="h-3.5 w-3.5" />
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Pagination */}
                                        <div className="flex items-center justify-end gap-2 pt-3 border-t text-[11px] text-slate-400 dark:border-zinc-800">
                                            <span>
                                                {topQueriesPage * itemsPerPage + 1} -{' '}
                                                {Math.min((topQueriesPage + 1) * itemsPerPage, exploreData.topQueries.length)} of{' '}
                                                {exploreData.topQueries.length}
                                            </span>
                                            <button
                                                type="button"
                                                disabled={topQueriesPage === 0}
                                                onClick={() => setTopQueriesPage((p) => Math.max(0, p - 1))}
                                                className="rounded p-1 hover:bg-slate-200 disabled:opacity-30 dark:hover:bg-zinc-800"
                                            >
                                                <ChevronLeft className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                disabled={(topQueriesPage + 1) * itemsPerPage >= exploreData.topQueries.length}
                                                onClick={() => setTopQueriesPage((p) => p + 1)}
                                                className="rounded p-1 hover:bg-slate-200 disabled:opacity-30 dark:hover:bg-zinc-800"
                                            >
                                                <ChevronRight className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Rising queries table */}
                                    <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/40 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                                        <div>
                                            <div className="flex items-center justify-between pb-2">
                                                <div>
                                                    <div className="flex items-center gap-1">
                                                        <h4 className="text-xs font-bold uppercase text-slate-800 dark:text-zinc-200">
                                                            Rising queries
                                                        </h4>
                                                        <Info className="h-3 w-3 text-slate-400" />
                                                    </div>
                                                    <span className="text-[11px] text-slate-400">
                                                        {currentGeoLabel} · {timeRange}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-2 flex items-center justify-between border-b pb-1.5 text-[11px] font-semibold text-slate-400 dark:border-zinc-800">
                                                <span>Query</span>
                                                <div className="flex items-center gap-6">
                                                    <span>Search interest</span>
                                                    <span>Change</span>
                                                </div>
                                            </div>

                                            <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                                                {paginatedRisingQueries.map((item, idx) => (
                                                    <div
                                                        key={item.query}
                                                        className="group flex items-center justify-between py-2 text-xs transition-colors hover:bg-white dark:hover:bg-zinc-800/60"
                                                    >
                                                        <div className="flex items-center gap-2 overflow-hidden pr-2">
                                                            <span className="w-4 font-mono text-[11px] text-slate-400">
                                                                {risingQueriesPage * itemsPerPage + idx + 1}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleSearch(item.query)}
                                                                className="truncate text-left font-medium text-slate-800 hover:text-[#1a73e8] dark:text-zinc-200"
                                                            >
                                                                {item.query}
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center gap-4 shrink-0">
                                                            <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800">
                                                                <div
                                                                    className="h-full rounded-full bg-sky-500"
                                                                    style={{ width: `${item.interest * 2}%` }}
                                                                />
                                                            </div>
                                                            <span className="w-14 text-right font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                                                {item.change}
                                                            </span>
                                                            <Link
                                                                href={`/admin/posts/create?title=${encodeURIComponent(item.query)}&focus_keyword=${encodeURIComponent(item.query)}`}
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-[#1a73e8]"
                                                                title="Tulis artikel dari kueri ini"
                                                            >
                                                                <PenSquare className="h-3.5 w-3.5" />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Pagination */}
                                        <div className="flex items-center justify-end gap-2 pt-3 border-t text-[11px] text-slate-400 dark:border-zinc-800">
                                            <span>
                                                {risingQueriesPage * itemsPerPage + 1} -{' '}
                                                {Math.min((risingQueriesPage + 1) * itemsPerPage, exploreData.risingQueries.length)} of{' '}
                                                {exploreData.risingQueries.length}
                                            </span>
                                            <button
                                                type="button"
                                                disabled={risingQueriesPage === 0}
                                                onClick={() => setRisingQueriesPage((p) => Math.max(0, p - 1))}
                                                className="rounded p-1 hover:bg-slate-200 disabled:opacity-30 dark:hover:bg-zinc-800"
                                            >
                                                <ChevronLeft className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                disabled={(risingQueriesPage + 1) * itemsPerPage >= exploreData.risingQueries.length}
                                                onClick={() => setRisingQueriesPage((p) => p + 1)}
                                                className="rounded p-1 hover:bg-slate-200 disabled:opacity-30 dark:hover:bg-zinc-800"
                                            >
                                                <ChevronRight className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* 6. "Trending now" View (Daily Trends Grid) */
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                                    Trending Searches Today ({currentGeoLabel})
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-zinc-400">
                                    Daftar penelusuran harian dengan lonjakan pencarian tertinggi hari ini.
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <select
                                    value={currentGeo}
                                    onChange={(e) => handleGeoChange(e.target.value)}
                                    className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-800"
                                >
                                    {Object.entries(supportedGeos).map(([code, name]) => (
                                        <option key={code} value={code}>
                                            {name} ({code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {dailyTrends.map((trend, index) => {
                                const postCreateUrl = `/admin/posts/create?title=${encodeURIComponent(
                                    trend.query
                                )}&focus_keyword=${encodeURIComponent(trend.query)}&excerpt=${encodeURIComponent(
                                    trend.news_title || trend.description || ''
                                )}`;

                                return (
                                    <div
                                        key={trend.id || index}
                                        className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition-all hover:border-[#1a73e8] hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                                    >
                                        <div className="space-y-2.5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-500 dark:bg-zinc-800 dark:text-zinc-300">
                                                        #{index + 1}
                                                    </span>
                                                    <span className="text-[11px] font-mono text-slate-400">
                                                        {trend.geo}
                                                    </span>
                                                </div>

                                                {trend.approx_traffic && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="flex items-center gap-1 border border-amber-200 bg-amber-50 text-[11px] font-bold text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
                                                    >
                                                        <Flame className="h-3 w-3 fill-amber-500 text-amber-500" />
                                                        {trend.approx_traffic}
                                                    </Badge>
                                                )}
                                            </div>

                                            <h4 className="text-base font-bold text-slate-900 transition-colors group-hover:text-[#1a73e8] dark:text-white line-clamp-1">
                                                {trend.query}
                                            </h4>

                                            {trend.description && (
                                                <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                                    {trend.description}
                                                </p>
                                            )}

                                            {trend.news_title && (
                                                <div className="mt-2 rounded-lg border border-slate-100 bg-slate-50 p-2 text-xs dark:border-zinc-800 dark:bg-zinc-950/60">
                                                    <a
                                                        href={trend.news_url || `https://www.google.com/search?q=${encodeURIComponent(trend.query)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-medium text-slate-800 hover:text-[#1a73e8] dark:text-zinc-200 line-clamp-2"
                                                    >
                                                        {trend.news_title}
                                                    </a>
                                                    <span className="mt-1 block text-[10px] text-slate-400">
                                                        {trend.news_source || 'Google News'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 flex items-center gap-2 border-t pt-3 dark:border-zinc-800">
                                            <Button
                                                asChild
                                                size="sm"
                                                className="w-full h-8 gap-1.5 bg-[#1a73e8] text-xs font-semibold text-white hover:bg-[#1557b0]"
                                            >
                                                <Link href={postCreateUrl}>
                                                    <PenSquare className="h-3.5 w-3.5" />
                                                    Tulis Artikel
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleSearch(trend.query)}
                                                className="h-8 w-8 shrink-0"
                                                title="Jelajahi di Google Trends"
                                            >
                                                <Activity className="h-3.5 w-3.5 text-slate-600" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Konfirmasi Purge Manual */}
            <ConfirmDialog
                open={showPurgeModal}
                onOpenChange={setShowPurgeModal}
                title="Purge Cache Database Google Trends?"
                description="Apakah Anda yakin ingin membersihkan (purge) seluruh cache database Google Trends sekarang? Data tren dan explore akan di-generate dan di-fetch ulang saat diakses kembali."
                confirmText="Ya, Purge Cache"
                cancelText="Batal (No)"
                variant="destructive"
                icon="trash"
                loading={isPurging}
                onConfirm={executePurge}
            />
        </AppLayout>
    );
}
