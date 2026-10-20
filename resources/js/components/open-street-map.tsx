import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Globe, Layers, MapPin, ZoomIn, ZoomOut } from 'lucide-react';

interface RegionItem {
    name: string;
    interest: number;
}

interface Props {
    geo: string;
    regions: RegionItem[];
    keyword: string;
}

const REGION_COORDINATES: Record<string, [number, number]> = {
    // Indonesian Provinces
    'Bali': [-8.4095, 115.1889],
    'DKI Jakarta': [-6.2088, 106.8456],
    'DI Yogyakarta': [-7.7956, 110.3695],
    'Jawa Barat': [-6.9175, 107.6191],
    'Jawa Tengah': [-7.1510, 110.1403],
    'Jawa Timur': [-7.2575, 112.7521],
    'Banten': [-6.4058, 106.0640],
    'Nusa Tenggara Barat': [-8.6529, 117.3616],
    'Nusa Tenggara Timur': [-8.6574, 121.0794],
    'Sumatera Utara': [3.5952, 98.6722],
    'Sumatera Barat': [-0.7399, 100.8000],
    'Sumatera Selatan': [-3.3194, 104.9144],
    'Riau': [0.2933, 101.7068],
    'Kepulauan Riau': [3.9457, 108.1429],
    'Lampung': [-4.5586, 105.4068],
    'Aceh': [4.6951, 96.7494],
    'Jambi': [-1.6101, 103.6131],
    'Bengkulu': [-3.8004, 102.2655],
    'Kalimantan Timur': [0.5387, 116.4194],
    'Kalimantan Barat': [-0.0263, 109.3425],
    'Kalimantan Selatan': [-3.0926, 115.2838],
    'Kalimantan Tengah': [-1.6815, 113.3824],
    'Sulawesi Selatan': [-5.1477, 119.4327],
    'Sulawesi Utara': [0.6247, 123.9750],
    'Sulawesi Tengah': [-1.4300, 121.4456],
    'Maluku': [-3.2385, 130.1453],
    'Papua': [-4.2699, 138.0804],
    // Worldwide Countries
    'United States': [37.0902, -95.7129],
    'United Kingdom': [55.3781, -3.4360],
    'Indonesia': [-0.7893, 113.9213],
    'Singapore': [1.3521, 103.8198],
    'Malaysia': [4.2105, 101.9758],
    'Japan': [36.2048, 138.2529],
    'Germany': [51.1657, 10.4515],
    'France': [46.2276, 2.2137],
    'Australia': [-25.2744, 133.7751],
    'Canada': [56.1304, -106.3468],
    'Netherlands': [52.1326, 5.2913],
    'Switzerland': [46.8182, 8.2275],
    'Spain': [40.4637, -3.7492],
    'Italy': [41.8719, 12.5674],
    'Thailand': [15.8700, 100.9925],
    'Brazil': [-14.2350, -51.9253],
    'South Korea': [35.9078, 127.7669],
    'India': [20.5937, 78.9629],
    'United Arab Emirates': [23.4241, 53.8478],
    'Saudi Arabia': [23.8859, 45.0792],
    'Turkey': [38.9637, 35.2433],
    'New Zealand': [-40.9006, 174.8860],
    'Philippines': [12.8797, 121.7740],
    'Vietnam': [14.0583, 108.2772],
    'Mexico': [23.6345, -102.5528],
    'Argentina': [-38.4161, -63.6167],
    'South Africa': [-30.5595, 22.9375],
    'Nigeria': [9.0820, 8.6753],
    'Ireland': [53.1424, -7.6921],
    'Austria': [47.5162, 14.5501],
    'Portugal': [39.3999, -8.2245],
    'Greece': [39.0742, 21.8243],
    'Sweden': [60.1282, 18.6435],
    'Norway': [60.4720, 8.4689],
    'Egypt': [26.8206, 30.8025],
    'St. Helena': [-15.9650, -5.7089],
};

const GEO_CENTERS: Record<string, { center: [number, number]; zoom: number }> = {
    ID: { center: [-2.5489, 118.0149], zoom: 4 },
    US: { center: [37.0902, -95.7129], zoom: 4 },
    GB: { center: [54.5, -3.0], zoom: 5 },
    SG: { center: [1.3521, 103.8198], zoom: 11 },
    MY: { center: [4.2105, 101.9758], zoom: 5 },
    AU: { center: [-25.2744, 133.7751], zoom: 3 },
    JP: { center: [36.2048, 138.2529], zoom: 5 },
    GLOBAL: { center: [20, 10], zoom: 1 },
};

export default function OpenStreetMap({ geo, regions = [], keyword }: Props) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<any>(null);
    const [leafletLoaded, setLeafletLoaded] = useState(false);

    // Get default center and zoom
    const target = GEO_CENTERS[geo] || GEO_CENTERS.GLOBAL;

    // Dynamically inject Leaflet CSS & JS from CDN
    useEffect(() => {
        if ((window as any).L) {
            setLeafletLoaded(true);
            return;
        }

        // Add Leaflet CSS
        const cssId = 'leaflet-css-cdn';
        if (!document.getElementById(cssId)) {
            const link = document.createElement('link');
            link.id = cssId;
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
            link.crossOrigin = '';
            document.head.appendChild(link);
        }

        // Add Leaflet JS
        const scriptId = 'leaflet-js-cdn';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
            script.crossOrigin = '';
            script.onload = () => setLeafletLoaded(true);
            document.body.appendChild(script);
        } else {
            const existingScript = document.getElementById(scriptId) as HTMLScriptElement;
            existingScript.addEventListener('load', () => setLeafletLoaded(true));
        }
    }, []);

    // Initialize or update Leaflet map with OpenStreetMap tiles
    useEffect(() => {
        const L = (window as any).L;
        if (!leafletLoaded || !L || !mapContainerRef.current) return;

        // Destroy previous instance if any
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }

        try {
            const map = L.map(mapContainerRef.current, {
                center: target.center,
                zoom: target.zoom,
                minZoom: 1,
                maxZoom: 18,
                zoomControl: true,
                attributionControl: true,
                scrollWheelZoom: false,
            });

            // OpenStreetMap Standard Tile Layer
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
            }).addTo(map);

            // Add circle markers for active regions with search interest scaling
            regions.forEach((region) => {
                const coords = REGION_COORDINATES[region.name];
                if (!coords) return;

                // Scale radius based on interest (min 8px, max 24px)
                const radius = 8 + (region.interest / 100) * 16;
                const fillOpacity = 0.4 + (region.interest / 100) * 0.4;

                const circle = L.circleMarker(coords, {
                    radius,
                    color: '#1a73e8',
                    weight: 2,
                    fillColor: region.interest >= 75 ? '#1a73e8' : region.interest >= 50 ? '#38bdf8' : '#93c5fd',
                    fillOpacity,
                }).addTo(map);

                // Tooltip / Popup on click or hover
                circle.bindPopup(`
                    <div style="font-family: inherit; font-size: 12px; line-height: 1.4; padding: 2px;">
                        <strong style="color: #0f172a; font-size: 13px;">${region.name}</strong><br/>
                        <span style="color: #64748b;">Topik: <em>${keyword}</em></span><br/>
                        <div style="margin-top: 4px; display: inline-block; background: #e0f2fe; color: #0284c7; padding: 2px 6px; border-radius: 4px; font-weight: 600; font-size: 11px;">
                            Search Interest: ${region.interest} / 100
                        </div>
                    </div>
                `);

                circle.bindTooltip(`${region.name}: ${region.interest}`, {
                    permanent: false,
                    direction: 'top',
                });
            });

            mapInstanceRef.current = map;
        } catch (err) {
            console.error('Failed to initialize Leaflet OpenStreetMap:', err);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [leafletLoaded, geo, regions, keyword]);

    return (
        <div className="relative h-64 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-zinc-800 dark:bg-zinc-900">
            {/* Header info badge */}
            <div className="pointer-events-none absolute left-3 top-3 z-400 flex items-center gap-1.5 rounded-md border border-slate-200/80 bg-white/90 px-2 py-1 text-[11px] font-semibold text-slate-700 shadow-xs backdrop-blur-xs dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-200">
                <Globe className="h-3 w-3 text-[#1a73e8]" />
                <span>OpenStreetMap Live ({geo})</span>
            </div>

            {/* Direct OpenStreetMap Link */}
            <a
                href={
                    geo === 'ID'
                        ? 'https://www.openstreetmap.org/#map=5/-2.5489/118.0149'
                        : 'https://www.openstreetmap.org/#map=2/20/10'
                }
                target="_blank"
                rel="noopener noreferrer"
                className="absolute right-3 top-3 z-400 inline-flex items-center gap-1 rounded-md border border-slate-200/80 bg-white/90 px-2 py-1 text-[10px] font-medium text-slate-600 shadow-xs backdrop-blur-xs hover:text-[#1a73e8] dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-300"
                title="Buka di OpenStreetMap.org"
            >
                <span>OSM</span>
                <ExternalLink className="h-2.5 w-2.5" />
            </a>

            {/* Leaflet OSM Interactive Container */}
            <div
                ref={mapContainerRef}
                className="h-full w-full z-10"
                style={{ background: '#e5e7eb' }}
            />

            {/* Fallback if Leaflet is loading / network delay */}
            {!leafletLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-500 dark:bg-zinc-900 dark:text-zinc-400">
                    <Globe className="h-6 w-6 animate-spin text-[#1a73e8]" />
                    <span className="mt-2 text-xs font-medium">Memuat Peta OpenStreetMap...</span>
                </div>
            )}
        </div>
    );
}
