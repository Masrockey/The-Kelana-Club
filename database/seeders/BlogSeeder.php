<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Comment;
use App\Models\MediaFile;
use App\Models\PageVisit;
use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use App\Services\SeoService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class BlogSeeder extends Seeder
{
    /**
     * Run the database seeds for Real Routes by Real Travelers.
     */
    public function run(): void
    {
        $seoService = new SeoService;

        // 1. Create or retrieve admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@kelanaclub.com'],
            [
                'name' => 'Kelana Expedition Staff',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // 2. Worldwide Travel Categories
        $categoriesData = [
            [
                'name' => 'Overland & Rail Expeditions',
                'slug' => 'overland-rail-expeditions',
                'description' => 'Cross-continent sleeper trains, border crossings, scenic rail passages, and slow overland transit.',
                'color' => '#9B1C1C', // Kelana Red
            ],
            [
                'name' => 'Hidden Trails & Mountain Passes',
                'slug' => 'hidden-trails-mountain-passes',
                'description' => 'Remote alpine traverses, backcountry trekking routes, GPS checkpoints, and elevation profiles.',
                'color' => '#047857',
            ],
            [
                'name' => 'Island Hopping & Coastal Routes',
                'slug' => 'island-hopping-coastal-routes',
                'description' => 'Wooden boat navigation, remote archipelagos, coastal trails, and maritime journeys.',
                'color' => '#1D4ED8',
            ],
            [
                'name' => 'Motorcycle & Road Trips',
                'slug' => 'motorcycle-road-trips',
                'description' => 'Unpaved high-pass highway routes, self-drive 4x4 safaris, and winding coastal tarmac.',
                'color' => '#B45309',
            ],
            [
                'name' => 'Traveler Intel & Field Guides',
                'slug' => 'traveler-intel-field-guides',
                'description' => 'Visa on arrival hacks, local transport hubs, offline map navigation, packing discipline, and border logistics.',
                'color' => '#6D28D9',
            ],
        ];

        $categories = [];
        foreach ($categoriesData as $catData) {
            $categories[$catData['slug']] = Category::updateOrCreate(['slug' => $catData['slug']], $catData);
        }

        // 3. Travel Tags
        $tagsData = ['Central Asia', 'Patagonia', 'Vietnam', 'Balkans', 'Indonesia', 'Overland', 'Trekking', 'Solo Travel', 'Off-Grid'];
        $tags = [];
        foreach ($tagsData as $tagName) {
            $slug = Str::slug($tagName);
            $tags[$slug] = Tag::firstOrCreate(['slug' => $slug], ['name' => $tagName]);
        }

        // 4. Authentic Worldwide Travel Posts with Real Routes
        $postsData = [
            [
                'title' => 'Riding the Ha Giang Loop: A 350km Motorbike Route Through the Karst Canyons of Northern Vietnam',
                'slug' => 'riding-ha-giang-loop-motorbike-route-vietnam',
                'category_slug' => 'motorcycle-road-trips',
                'tags' => ['vietnam', 'motorcycle', 'solo-travel'],
                'is_featured' => true,
                'featured_image' => 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=80',
                'excerpt' => 'Four days traversing the winding precipices of Ma Pi Leng Pass, sleeping in Tay homestays, and navigating the razor-sharp limestone towers along the Chinese border.',
                'focus_keyword' => 'Ha Giang Loop Motorbike Route',
                'meta_title' => 'Riding the Ha Giang Loop: Complete 350km Route Guide — Kelana Club',
                'meta_description' => 'The definitive real traveler route for the Ha Giang Loop in Vietnam. 4-day itinerary, road conditions, Ma Pi Leng Pass checkpoints, and homestay intel.',
                'geo_target_country' => 'VN',
                'geo_region' => 'VN-03',
                'geo_placename' => 'Ha Giang',
                'geo_latitude' => 22.8233000,
                'geo_longitude' => 104.9839000,
                'geo_hreflang_code' => 'en-VN',
                'content' => "## The Frontier of Northern Tonkin

Leaving Ha Giang city at six in the morning, the heavy tropical mist still blankets the Song Lo river valley. Within forty kilometers, the tarmac tilts skyward into the Dong Van Karst Plateau Geopark—a UNESCO geological wonderland of jagged dark limestone teeth punctuating the clouds.

This is not a package tour; it is 350 kilometers of sheer hairpin bends, plunging ravines, and gravel switchbacks where personal gear restraint and mechanical vigilance determine the quality of your expedition.

> \"Real routes are not measured by tourist landmarks, but by the condition of the road surface and the hospitality of strangers when the engine cools at dusk.\" — Real Routes by Real Travelers

### Day-by-Day Route Itinerary

#### Day 1: Ha Giang City to Yen Minh via Quan Ba Pass (98 km)
- **Checkpoints:** Bac Sum Slope, Heaven’s Gate (*Cong Troi*), Twin Mountains of Tam Son.
- **Surface Condition:** Smooth asphalt transitioning to occasional loose gravel on mountain descent.
- **Field Tip:** Refuel your semi-automatic Honda Blade in Tam Son town; petrol stations thin out quickly once you enter the limestone canyons.

#### Day 2: Yen Minh to Dong Van via Tham Ma Pass & Sa Phin (85 km)
- **Checkpoints:** Tham Ma Switchbacks, H'mong King's Palace (*Dinh Vua Meo*), Lung Cu Flag Tower (northernmost point of Vietnam bordering Yunnan).
- **Elevation:** Climbing past 1,400 meters. The air turns crisp and aromatic with woodsmoke.

#### Day 3: Dong Van to Du Gia via Ma Pi Leng Pass (92 km)
- **The Highlight:** Ma Pi Leng Pass, perched 1,500m above the turquoise Nho Que river canyon. Take the narrow cliff path (*Tu San chasm*) with utmost clutch control.
- **Lodging:** Authentic Tay stilt-house homestays in Du Gia surrounded by cascading rice paddies.

### Gear Discipline for the Karst Roads
1. **Semi-Automatic 110cc-125cc Bike:** Always choose a manual foot-gear motorcycle over an automatic scooter for engine braking on steep 15% descents.
2. **Waterproof Dry Bag:** Sudden Himalayan-influenced squalls can strike within minutes. Strap everything securely with bungee cords to the rear rack.
3. **Local SIM & Offline Maps:** Download Maps.me and OSM offline topo tiles before departing Ha Giang city.",
            ],
            [
                'title' => 'The Silk Road Rail Odyssey: Across the Red Desert from Tashkent to Samarkand and Bukhara',
                'slug' => 'silk-road-rail-odyssey-uzbekistan',
                'category_slug' => 'overland-rail-expeditions',
                'tags' => ['central-asia', 'overland'],
                'is_featured' => false,
                'featured_image' => 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1600&q=80',
                'excerpt' => 'Stepping onto the Soviet-built overnight sleeper trains and high-speed Afrosiyob rail across Uzbekistan’s desert steppes, where turquoise domes pierce the desert horizon.',
                'focus_keyword' => 'Silk Road Rail Route',
                'meta_title' => 'The Silk Road Rail Route: Tashkent to Samarkand & Bukhara — Kelana',
                'meta_description' => 'Real traveler guide to navigating the Silk Road by train in Uzbekistan. Ticket booking intel, sleeper berths, station architecture, and desert transit tips.',
                'geo_target_country' => 'UZ',
                'geo_region' => 'UZ-SA',
                'geo_placename' => 'Samarkand',
                'geo_latitude' => 39.6542000,
                'geo_longitude' => 66.9597000,
                'geo_hreflang_code' => 'en-UZ',
                'content' => "## The Whistle Across the Kyzylkum Desert

There is a timeless romance to Central Asian rail journeys. While modern travelers rush to airports, boarding a train at Tashkent's Severny station plunges you into the living rhythm of the ancient Silk Route. 

Vendors pass down the narrow carpeted corridors of the *Platskart* sleeper cars offering hot green tea from nickel-plated *podstakannik* holders, dried apricots from Fergana, and crusty non bread stamped with geometric solar patterns.

### Key Rail Legs & Ticketing Logistics

1. **Leg 1: Tashkent to Samarkand (344 km / 2 hours 15 min):** The modern Spanish-built Talgo *Afrosiyob* glides at 250 km/h past cotton fields and melon stalls, pulling into the shadow of Tamerlane's turquoise-tiled Registan.
2. **Leg 2: Samarkand to Bukhara (268 km / 1 hour 30 min):** Traversing the red clay steppes of the Kyzylkum into the UNESCO mudbrick labyrinth of Bukhara's trading domes.
3. **Leg 3: Bukhara to Khiva (450 km / 6 hours on the Sharq Desert Express):** The true desert crossing, where camel herds graze alongside rusty single-track rail ties.

### Field Notes for Central Asian Transit
- **Ticket Window:** Book through Uzbek Railways (*Uzrailways*) exactly 45 days in advance; tickets sell out within hours to local traders and pilgrims.
- **Baggage Security:** Station checkpoints require passport inspection before entering the platform gates. Keep physical copies of your electronic registration slips (*registratsiya*).",
            ],
            [
                'title' => 'Trekking the O-Circuit in Torres del Paine: Navigating the Savage Winds of John Gardner Pass',
                'slug' => 'trekking-o-circuit-torres-del-paine-patagonia',
                'category_slug' => 'hidden-trails-mountain-passes',
                'tags' => ['patagonia', 'trekking', 'off-grid'],
                'is_featured' => false,
                'featured_image' => 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=1600&q=80',
                'excerpt' => 'An eight-day, 130-kilometer backcountry circumnavigation behind the granite massifs of Patagonia, culminating in the 1,200m crest above the infinite Southern Ice Field.',
                'focus_keyword' => 'Torres del Paine O-Circuit',
                'meta_title' => 'Trekking the O-Circuit in Patagonia: Route Intel & Pass Guide — Kelana',
                'meta_description' => 'Field-tested guide to trekking the Torres del Paine O-Circuit in Chile. Campsite reservations, John Gardner Pass wind tactics, and gear packing essentials.',
                'geo_target_country' => 'CL',
                'geo_region' => 'CL-MA',
                'geo_placename' => 'Torres del Paine',
                'geo_latitude' => -51.2532000,
                'geo_longitude' => -72.8814000,
                'geo_hreflang_code' => 'en-CL',
                'content' => "## Beyond the Day-Tripper Crowds

Most visitors to Chilean Patagonia only see the southern face of Torres del Paine on the crowded W-Trek. But the true expedition lies along the northern perimeter—the 130-kilometer 'O' Circuit, where human footprints dwindle, and the full fury of Antarctic winds whips across the Patagonian steppe.

### The Crucible of John Gardner Pass (Paso John Gardner)

At 1,200 meters above sea level, Paso John Gardner is the crux of the circuit. Hikers leave Campamento Los Perros at 4:30 AM with headlamps, navigating slippery lenga root forests and glacial moraine scree in freezing temperatures.

Upon reaching the pass summit, the Southern Patagonian Ice Field (*Campo de Hielo Sur*) reveals itself—an unbroken ocean of glacial ice stretching beyond the horizon. The gusts here regularly exceed 100 km/h; hiking poles and a low center of gravity are mandatory survival tactics.

### Practical Trail Checklist
- **Trail Length:** 130 km (8 to 9 days)
- **Campground Permits:** Mandatory booking through CONAF, Las Torres, and Vertice Patagonia months in advance.
- **Water Source:** Pristine glacial melt throughout the route; no chemical filtration required along wild streams.",
            ],
            [
                'title' => 'Overland Across the Peaks of the Balkans: Crossing Unmarked Alpine Borders in Albania & Montenegro',
                'slug' => 'peaks-of-the-balkans-trail-albania-montenegro',
                'category_slug' => 'hidden-trails-mountain-passes',
                'tags' => ['balkans', 'trekking', 'solo-travel'],
                'is_featured' => false,
                'featured_image' => 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
                'excerpt' => 'Traversing the Accursed Mountains along shepherd paths once mined during the Cold War—hiking between remote Catholic, Muslim, and Orthodox mountain hamlets.',
                'focus_keyword' => 'Peaks of the Balkans Trail',
                'meta_title' => 'Peaks of the Balkans Trail Guide: Cross-Border Trekking — Kelana',
                'meta_description' => 'Real route breakdown for the 192km Peaks of the Balkans trail through Albania, Kosovo, and Montenegro. Border permits, guesthouse stays, and trail GPS intel.',
                'geo_target_country' => 'AL',
                'geo_region' => 'AL-09',
                'geo_placename' => 'Theth',
                'geo_latitude' => 42.3969000,
                'geo_longitude' => 19.7828000,
                'geo_hreflang_code' => 'en-AL',
                'content' => "## The Accursed Mountains Unlocked

For half a century under Enver Hoxha's totalitarian regime, the border zone between northern Albania and former Yugoslavia was lined with concrete pillbox bunkers and barbed wire. Today, the 192-kilometer circular Peaks of the Balkans trail links shepherd hamlets across Albania, Montenegro, and Kosovo.

### Cross-Border Permit Protocol
Because the trail crosses sovereign national boundaries through remote alpine passes with no formal customs posts, hikers must obtain a **Cross-Border Hiking Permit** at least two weeks before starting. This document authorizes legal mountain entry between:
- Valbona (Albania) → Çerem (Albania)
- Çerem → Doberdöl (border zone near Kosovo)
- Doberdöl → Milishevc (Kosovo)
- Babino Polje (Montenegro) → Plav (Montenegro)

### Mountain Hospitality in Theth
After 8 hours of steep descent over loose limestone scree, arriving in the stone-walled valley of Theth feels like stepping into 18th-century Europe. Family guesthouses serve warm sheep cheese (*djathë*), wild mountain sage tea, and freshly baked corn bread baked in wood-fired hearths.",
            ],
            [
                'title' => 'The Remote Phinisi Route: Sailing the Untamed Archipelagos of Misool and Northern Raja Ampat',
                'slug' => 'remote-phinisi-route-raja-ampat-indonesia',
                'category_slug' => 'island-hopping-coastal-routes',
                'tags' => ['indonesia', 'overland', 'off-grid'],
                'is_featured' => false,
                'featured_image' => 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1600&q=80',
                'excerpt' => 'Navigating remote labyrinthine channels, hidden lagoons, and oceanic trenches aboard a handcrafted ironwood schooner in Papua’s Coral Triangle.',
                'focus_keyword' => 'Raja Ampat Sailing Route',
                'meta_title' => 'Raja Ampat Phinisi Sailing Route: Field Navigation Guide — Kelana',
                'meta_description' => 'Real routes through Raja Ampat and Misool by traditional wooden Phinisi boat. Anchorages, oceanic currents, hidden jellyfish lagoons, and marine permits.',
                'geo_target_country' => 'ID',
                'geo_region' => 'ID-IB',
                'geo_placename' => 'Raja Ampat',
                'geo_latitude' => -0.2333000,
                'geo_longitude' => 130.5167000,
                'geo_hreflang_code' => 'id-ID',
                'content' => '## Navigating the Edge of the Pacific

In the far eastern reaches of the Indonesian archipelago, where the Pacific Ocean collides with the Halmahera Sea, lies the marine epicenter of our planet. Reaching the southern karst labyrinth of Misool requires boarding a traditional wooden *Phinisi* schooner from Sorong harbor.

Crafted by Bugis shipwrights using ironwood (*kayu besi*) and teak without blueprints or nails, these vessels navigate treacherous shallow reefs and uncharted tidal rips with ancient celestial and acoustic intuition.

### Key Route Anchorages

1. **Dampier Strait:** Powerful tidal currents where oceanic manta rays congregate over coral cleaning stations.
2. **Wayag Archipelagos:** The iconic mushroom-shaped limestone pinnacles rising like emerald towers out of sapphire water.
3. **Misool Blue Water Caves:** Labyrinthine cave systems navigable only at slack low tide, leading to hidden stingless jellyfish inland lagoons.

### Conservation & Marine Permits
- **BLUD Marine Park Tag:** Every independent traveler must register and pay the Environmental Maintenance Fee at the Sorong port authority office before chartering vessels.
- **Reef Protection:** Anchoring directly on coral beds is strictly prohibited; rely only on designated mooring buoys maintained by local indigenous Papuan village councils (*Masyarakat Adat*).',
            ],
        ];

        $createdPosts = [];
        foreach ($postsData as $pData) {
            $cat = $categories[$pData['category_slug']];
            $tagSlugs = $pData['tags'];
            unset($pData['category_slug'], $pData['tags']);

            $analysis = $seoService->analyze(
                $pData['title'],
                $pData['content'],
                $pData['focus_keyword'],
                $pData['meta_title'],
                $pData['meta_description']
            );

            $pData['user_id'] = $admin->id;
            $pData['category_id'] = $cat->id;
            $pData['status'] = 'published';
            $pData['published_at'] = Carbon::now()->subDays(rand(1, 20));
            $pData['read_time_minutes'] = Post::estimateReadTime($pData['content']);
            $pData['views_count'] = rand(1250, 6800);
            $pData['seo_score'] = $analysis['score'];

            $post = Post::updateOrCreate(['slug' => $pData['slug']], $pData);

            $attachedTagIds = [];
            foreach ($tagSlugs as $ts) {
                if (isset($tags[$ts])) {
                    $attachedTagIds[] = $tags[$ts]->id;
                }
            }
            $post->tags()->sync($attachedTagIds);
            $createdPosts[] = $post;
        }

        // 5. Seed Real Reader Comments
        $sampleComments = [
            [
                'author_name' => 'Liam Gallagher',
                'author_email' => 'liam.g@overlandjournal.co.uk',
                'content' => 'Rode the Ha Giang loop two months ago. You are spot on about Ma Pi Leng Pass—do not take an automatic scooter up there! The engine braking on manual 110cc was essential.',
            ],
            [
                'author_name' => 'Elena Rostov',
                'author_email' => 'elena.rostov@travelintel.org',
                'content' => 'The night train from Tashkent to Samarkand remains one of my favorite rail trips in the world. Buying non bread through the train window at stations is pure magic.',
            ],
            [
                'author_name' => 'Mateo Benitez',
                'author_email' => 'mateo@andes-trail.cl',
                'content' => 'John Gardner Pass nearly blew my 70L backpack off the ridge in 2024. Your recommendation to leave Los Perros before 5 AM is crucial advice.',
            ],
        ];

        foreach ($createdPosts as $idx => $p) {
            $cData = $sampleComments[$idx % count($sampleComments)];
            Comment::create([
                'post_id' => $p->id,
                'author_name' => $cData['author_name'],
                'author_email' => $cData['author_email'],
                'content' => $cData['content'],
                'status' => 'approved',
                'created_at' => now()->subDays(rand(1, 10)),
            ]);
        }

        // 6. Seed Page Visits over last 30 days for Worldwide Travel Analytics
        $countryProfiles = [
            ['code' => 'ID', 'name' => 'Indonesia', 'cities' => ['Jakarta', 'Bali', 'Yogyakarta', 'Bandung'], 'lat' => -6.2088, 'lng' => 106.8456, 'weight' => 35],
            ['code' => 'VN', 'name' => 'Vietnam', 'cities' => ['Hanoi', 'Da Nang', 'Saigon', 'Ha Giang'], 'lat' => 21.0285, 'lng' => 105.8542, 'weight' => 20],
            ['code' => 'US', 'name' => 'United States', 'cities' => ['New York', 'San Francisco', 'Denver', 'Seattle'], 'lat' => 40.7128, 'lng' => -74.0060, 'weight' => 15],
            ['code' => 'UZ', 'name' => 'Uzbekistan', 'cities' => ['Tashkent', 'Samarkand', 'Bukhara'], 'lat' => 41.2995, 'lng' => 69.2401, 'weight' => 10],
            ['code' => 'CL', 'name' => 'Chile', 'cities' => ['Santiago', 'Puerto Natales', 'Punta Arenas'], 'lat' => -33.4489, 'lng' => -70.6693, 'weight' => 8],
            ['code' => 'AL', 'name' => 'Albania', 'cities' => ['Tirana', 'Shkodër'], 'lat' => 41.3275, 'lng' => 19.8187, 'weight' => 7],
            ['code' => 'GB', 'name' => 'United Kingdom', 'cities' => ['London', 'Bristol', 'Edinburgh'], 'lat' => 51.5074, 'lng' => -0.1278, 'weight' => 5],
        ];

        $bots = [
            ['name' => 'Googlebot', 'ua' => 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', 'weight' => 50],
            ['name' => 'Bingbot', 'ua' => 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)', 'weight' => 25],
            ['name' => 'DuckDuckBot', 'ua' => 'DuckDuckBot/1.0; (+http://duckduckgo.com/duckduckbot.html)', 'weight' => 15],
            ['name' => 'AhrefsBot', 'ua' => 'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)', 'weight' => 10],
        ];

        $referrers = [
            'https://www.google.com/search?q=ha+giang+loop+motorbike+route',
            'https://www.google.com/search?q=tashkent+to+samarkand+train',
            'https://www.bing.com/search?q=torres+del+paine+o+circuit+intel',
            'https://duckduckgo.com/?q=peaks+of+the+balkans+cross+border+permit',
            'https://lonelyplanet.com',
            'https://reddit.com/r/solotravel',
            'https://t.co/kelanaclub_routes',
            null,
        ];

        $devices = ['desktop', 'mobile', 'tablet'];
        $browsers = ['Chrome', 'Safari', 'Firefox', 'Edge'];
        $osList = ['iOS', 'Android', 'Windows', 'macOS'];

        // Generate ~500 visits across the past 30 days
        for ($day = 29; $day >= 0; $day--) {
            $date = Carbon::now()->subDays($day);
            $visitsCount = rand(15, 40);

            for ($v = 0; $v < $visitsCount; $v++) {
                $isBot = (rand(1, 100) <= 15);
                $createdAt = $date->copy()->setHour(rand(0, 23))->setMinute(rand(0, 59));

                if ($isBot) {
                    $botProfile = $bots[array_rand($bots)];
                    $targetPost = $createdPosts[array_rand($createdPosts)];
                    PageVisit::create([
                        'post_id' => $targetPost->id,
                        'url' => route('posts.show', $targetPost->slug),
                        'ip_address' => '66.249.66.'.rand(1, 250),
                        'session_id' => null,
                        'user_agent' => $botProfile['ua'],
                        'country_code' => 'US',
                        'country_name' => 'United States',
                        'city' => 'Mountain View',
                        'region' => 'California',
                        'latitude' => 37.4220,
                        'longitude' => -122.0841,
                        'device_type' => 'desktop',
                        'browser' => 'Bot Crawler',
                        'os' => 'Linux Server',
                        'referrer' => null,
                        'referrer_domain' => null,
                        'is_bot' => true,
                        'bot_name' => $botProfile['name'],
                        'is_unique' => false,
                        'created_at' => $createdAt,
                    ]);
                } else {
                    $randCountry = $countryProfiles[array_rand($countryProfiles)];
                    $city = $randCountry['cities'][array_rand($randCountry['cities'])];
                    $targetPost = rand(1, 10) > 3 ? $createdPosts[array_rand($createdPosts)] : null;
                    $url = $targetPost ? route('posts.show', $targetPost->slug) : url('/');
                    $ref = $referrers[array_rand($referrers)];
                    $refHost = $ref ? parse_url($ref, PHP_URL_HOST) : 'direct';

                    PageVisit::create([
                        'post_id' => $targetPost ? $targetPost->id : null,
                        'url' => $url,
                        'ip_address' => rand(100, 200).'.'.rand(10, 99).'.'.rand(1, 250).'.'.rand(1, 250),
                        'session_id' => Str::random(32),
                        'user_agent' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
                        'country_code' => $randCountry['code'],
                        'country_name' => $randCountry['name'],
                        'city' => $city,
                        'region' => $randCountry['name'],
                        'latitude' => $randCountry['lat'],
                        'longitude' => $randCountry['lng'],
                        'device_type' => $devices[array_rand($devices)],
                        'browser' => $browsers[array_rand($browsers)],
                        'os' => $osList[array_rand($osList)],
                        'referrer' => $ref,
                        'referrer_domain' => $refHost,
                        'is_bot' => false,
                        'bot_name' => null,
                        'is_unique' => (rand(1, 10) > 3),
                        'created_at' => $createdAt,
                    ]);
                }
            }
        }

        // 7. Seed Worldwide Travel Photographs into Media Library
        $travelPhotos = [
            [
                'name' => 'Ha Giang Karst Limestone Towers',
                'url' => 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=80',
                'alt_text' => 'Ha Giang Northern Vietnam karst limestone mountains and misty canyon',
                'caption' => 'Ma Pi Leng Pass canyon, Northern Vietnam. Elevation ~1,500m.',
                'mime_type' => 'image/jpeg',
                'size_bytes' => 1245000,
                'source_type' => 'url',
            ],
            [
                'name' => 'Pamir Highway Mountain Pass & Yurt',
                'url' => 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=80',
                'alt_text' => 'Pamir Highway Kyrgyzstan high altitude mountains and river valley',
                'caption' => 'Ak-Baital Pass approach, Pamir Highway M41, Central Asia.',
                'mime_type' => 'image/jpeg',
                'size_bytes' => 1890000,
                'source_type' => 'url',
            ],
            [
                'name' => 'Toraja Highland Sacred Village',
                'url' => 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=80',
                'alt_text' => 'Traditional Toraja Tongkonan ancestral roof in South Sulawesi',
                'caption' => 'Ancestral Tongkonan settlement in Kete Kesu, Tana Toraja.',
                'mime_type' => 'image/jpeg',
                'size_bytes' => 1520000,
                'source_type' => 'url',
            ],
            [
                'name' => 'Komodo Phinisi Schooner at Sunset',
                'url' => 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1600&q=80',
                'alt_text' => 'Traditional Indonesian wooden phinisi sailing schooner at sunset in Flores',
                'caption' => 'Liveaboard expedition crossing the Sape Strait, East Nusa Tenggara.',
                'mime_type' => 'image/jpeg',
                'size_bytes' => 1640000,
                'source_type' => 'url',
            ],
            [
                'name' => 'Patagonia Fitz Roy Glacier Peak',
                'url' => 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80',
                'alt_text' => 'Mount Fitz Roy granite towers with alpine lake in Argentine Patagonia',
                'caption' => 'Laguna de los Tres dawn vantage point, El Chalten, Argentina.',
                'mime_type' => 'image/jpeg',
                'size_bytes' => 2100000,
                'source_type' => 'url',
            ],
            [
                'name' => 'Nakasendo Trail Japanese Wooden Post Town',
                'url' => 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80',
                'alt_text' => 'Historical wooden shophouse lanterns along the Nakasendo trail in Japan',
                'caption' => 'Evening lantern glow in Tsumago-juku, Kiso Valley, Japan.',
                'mime_type' => 'image/jpeg',
                'size_bytes' => 1780000,
                'source_type' => 'url',
            ],
            [
                'name' => 'Iceland Route 1 Glacier Lagoon',
                'url' => 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1600&q=80',
                'alt_text' => 'Glacial icebergs floating in blue lagoon along Iceland Ring Road',
                'caption' => 'Jokulsarlon iceberg lagoon, South Coast Route 1, Iceland.',
                'mime_type' => 'image/jpeg',
                'size_bytes' => 1430000,
                'source_type' => 'url',
            ],
            [
                'name' => 'Karakoram Highway Mountain Road',
                'url' => 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
                'alt_text' => 'Carved mountain highway road between massive snowcapped peaks',
                'caption' => 'Hunza valley segment along the high Karakoram highway.',
                'mime_type' => 'image/jpeg',
                'size_bytes' => 1950000,
                'source_type' => 'url',
            ],
        ];

        foreach ($travelPhotos as $photo) {
            MediaFile::firstOrCreate(
                ['url' => $photo['url']],
                array_merge($photo, ['user_id' => $admin->id])
            );
        }
    }
}
