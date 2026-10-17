import { Head } from '@inertiajs/react';
import {
    Compass,
    Globe,
    Layers,
    MapPin,
    Navigation,
    Target,
    Users,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

interface CountryItem {
    country_code: string;
    country_name: string;
    views: number;
    uniques: number;
    share: number;
}

interface CityItem {
    city: string;
    country_name: string;
    country_code: string;
    views: number;
}

interface TargetItem {
    geo_target_country: string;
    count: number;
}

interface Props {
    totalGeoVisits: number;
    countries: CountryItem[];
    topCities: CityItem[];
    targetDistribution: TargetItem[];
}

export default function GeoAnalytics({
    totalGeoVisits,
    countries,
    topCities,
    targetDistribution,
}: Props) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'GEO Analytics', href: '/admin/analytics/geo' },
            ]}
        >
            <Head title="GEO Analytics & Global Dispersion — The Kelana Club" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        Geographic Intelligence & Global Dispersion
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Analyze reader dispersion across continents, countries, cities, and evaluate localized content targeting.
                    </p>
                </div>

                {/* KPI Bar */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Global Readers Logged</CardTitle>
                            <Globe className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalGeoVisits.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">Geo-resolved reader sessions</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Countries Reached</CardTitle>
                            <MapPin className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{countries.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">Independent national territories</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Metropolitan Hubs</CardTitle>
                            <Compass className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{topCities.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">Active urban centers recorded</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Interactive Geographic Dispersion Map / Visual Card */}
                <Card className="overflow-hidden border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                    Global Readership Hubs & Coordinates
                                </CardTitle>
                                <CardDescription>
                                    Active geolocation clusters identified through IP telemetry
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="font-mono text-xs">
                                📍 Multi-Region Cluster
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Visual SVG World Graphic Representation */}
                        <div className="relative rounded-xl border bg-card p-6 shadow-sm overflow-hidden min-h-[220px] flex flex-col justify-between">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {countries.slice(0, 4).map((c) => (
                                    <div
                                        key={c.country_code}
                                        className="rounded-lg border p-3.5 bg-background/80 backdrop-blur space-y-1"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono font-bold text-sm">[{c.country_code}]</span>
                                            <Badge variant="secondary" className="text-[10px]">
                                                {c.share}% Share
                                            </Badge>
                                        </div>
                                        <div className="text-sm font-semibold text-foreground truncate">{c.country_name}</div>
                                        <div className="text-xs text-muted-foreground flex justify-between">
                                            <span>{c.views} impressions</span>
                                            <span>{c.uniques} unique</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t mt-4">
                                <span className="flex items-center gap-1.5">
                                    <Target className="h-3.5 w-3.5 text-amber-500" />
                                    GEO optimizer tags actively match regional hreflang headers
                                </span>
                                <span className="font-mono text-[11px]">RFC 5646 & ICBM Verified</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Country Rankings Table & City Leaderboard */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Country Leaderboard */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">National Traffic Rankings</CardTitle>
                            <CardDescription>Verified impressions by country of origin</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {countries.map((c) => (
                                <div key={c.country_code} className="space-y-1.5 p-2 rounded-lg border bg-muted/20">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold flex items-center gap-2">
                                            <span className="font-mono text-muted-foreground">[{c.country_code}]</span>
                                            {c.country_name}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{c.views} reads</span>
                                            <span className="text-muted-foreground">({c.share}%)</span>
                                        </div>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                        <div
                                            className="h-full bg-amber-600 dark:bg-amber-500 rounded-full transition-all"
                                            style={{ width: `${c.share}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Top Cities & Post GEO Targeting Split */}
                    <div className="space-y-6">
                        {/* Cities */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">Top Urban Centers</CardTitle>
                                <CardDescription>Cities with the highest reading density</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-xs">
                                    {topCities.slice(0, 8).map((city, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between py-1.5 border-b last:border-b-0"
                                        >
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                <span className="font-medium">{city.city}</span>
                                                <span className="text-muted-foreground font-mono text-[11px]">
                                                    ({city.country_code})
                                                </span>
                                            </div>
                                            <Badge variant="outline" className="font-mono text-xs">
                                                {city.views} reads
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* GEO Targeted Articles */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">Content GEO Targeting Focus</CardTitle>
                                <CardDescription>How your published essays are targeted by territory</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {targetDistribution.map((t) => (
                                        <div
                                            key={t.geo_target_country}
                                            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 bg-card text-xs"
                                        >
                                            <span className="font-mono font-bold">📍 {t.geo_target_country || 'ALL'}</span>
                                            <span className="text-muted-foreground">• {t.count} articles</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
