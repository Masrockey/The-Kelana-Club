<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Services\SeoService;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function __construct(
        protected SeoService $seoService
    ) {}

    /**
     * Generate sitemap.xml.
     */
    public function sitemap(): Response
    {
        $xml = $this->seoService->generateSitemapXml();

        return response($xml, 200, [
            'Content-Type' => 'application/xml',
            'X-Robots-Tag' => 'noindex',
        ]);
    }

    /**
     * Generate robots.txt.
     */
    public function robots(): Response
    {
        $appUrl = config('app.url', url('/'));
        $content = "User-agent: *\n";
        $content .= "Allow: /\n";
        $content .= "Disallow: /admin\n";
        $content .= "Disallow: /dashboard\n";
        $content .= "Disallow: /settings\n\n";
        $content .= "Sitemap: {$appUrl}/sitemap.xml\n";

        return response($content, 200, [
            'Content-Type' => 'text/plain',
        ]);
    }

    /**
     * Generate RSS 2.0 feed.
     */
    public function feed(): Response
    {
        $posts = Post::published()->with(['category', 'user'])->orderBy('published_at', 'desc')->limit(25)->get();
        $appUrl = config('app.url', url('/'));
        $appName = config('app.name', 'The Kelana Club');

        $rss = '<?xml version="1.0" encoding="UTF-8"?>';
        $rss .= '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">';
        $rss .= '<channel>';
        $rss .= '<title>'.htmlspecialchars($appName).'</title>';
        $rss .= '<link>'.htmlspecialchars($appUrl).'</link>';
        $rss .= '<description>Dispatches, essays and cultural commentary from The Kelana Club.</description>';
        $rss .= '<language>en-us</language>';
        $rss .= '<atom:link href="'.htmlspecialchars("{$appUrl}/feed.xml").'" rel="self" type="application/rss+xml" />';

        foreach ($posts as $post) {
            $postUrl = route('posts.show', $post->slug);
            $rss .= '<item>';
            $rss .= '<title>'.htmlspecialchars($post->title).'</title>';
            $rss .= '<link>'.htmlspecialchars($postUrl).'</link>';
            $rss .= '<guid isPermaLink="true">'.htmlspecialchars($postUrl).'</guid>';
            $rss .= '<pubDate>'.($post->published_at ? $post->published_at->toRssString() : $post->created_at->toRssString()).'</pubDate>';
            $rss .= '<description><![CDATA['.($post->excerpt ?: substr(strip_tags($post->content), 0, 280)).']]></description>';
            if ($post->user) {
                $rss .= '<author>'.htmlspecialchars($post->user->email).' ('.htmlspecialchars($post->user->name).')</author>';
            }
            if ($post->category) {
                $rss .= '<category>'.htmlspecialchars($post->category->name).'</category>';
            }
            $rss .= '</item>';
        }

        $rss .= '</channel>';
        $rss .= '</rss>';

        return response($rss, 200, [
            'Content-Type' => 'application/rss+xml',
        ]);
    }
}
