<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MediaFile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class MediaController extends Controller
{
    /**
     * Display media library page (strictly Inertia response).
     */
    public function index(Request $request): Response
    {
        $query = MediaFile::query()->latest();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('alt_text', 'like', "%{$search}%")
                    ->orWhere('caption', 'like', "%{$search}%");
            });
        }

        $perPage = (int) $request->input('per_page', 24);
        $media = $query->paginate($perPage)->withQueryString();

        return Inertia::render('admin/media/index', [
            'media' => $media,
            'filters' => [
                'search' => $request->input('search', ''),
            ],
        ]);
    }

    /**
     * JSON API endpoint for modal picker and asynchronous fetching.
     */
    public function items(Request $request): JsonResponse
    {
        $query = MediaFile::query()->latest();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('alt_text', 'like', "%{$search}%")
                    ->orWhere('caption', 'like', "%{$search}%");
            });
        }

        $perPage = (int) $request->input('per_page', 40);
        $media = $query->paginate($perPage);

        return response()->json($media);
    }

    /**
     * Upload an image file to local storage and save to Media Library.
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'image', 'max:12288'], // max 12MB
            'alt_text' => ['nullable', 'string', 'max:255'],
            'caption' => ['nullable', 'string', 'max:500'],
        ]);

        $file = $request->file('file');
        $directory = 'media/'.date('Y/m');
        $filename = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)).'-'.Str::random(6).'.'.$file->getClientOriginalExtension();

        $path = $file->storeAs($directory, $filename, 'public');
        $url = Storage::url($path);

        $media = MediaFile::create([
            'user_id' => $request->user()?->id,
            'name' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
            'file_path' => $path,
            'url' => $url,
            'mime_type' => $file->getMimeType(),
            'size_bytes' => $file->getSize(),
            'alt_text' => $request->input('alt_text') ?: pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
            'caption' => $request->input('caption'),
            'source_type' => 'upload',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Image successfully uploaded to Media Library',
            'media' => $media,
        ], 201);
    }

    /**
     * Import an image from a URL, download it locally (if accessible), and register in Media Library.
     */
    public function importFromUrl(Request $request): JsonResponse
    {
        $request->validate([
            'url' => ['required', 'url'],
            'name' => ['nullable', 'string', 'max:255'],
            'alt_text' => ['nullable', 'string', 'max:255'],
            'caption' => ['nullable', 'string', 'max:500'],
        ]);

        $url = $request->input('url');

        try {
            $response = Http::timeout(15)->get($url);

            if ($response->successful()) {
                $contentType = $response->header('Content-Type') ?: 'image/jpeg';
                $ext = 'jpg';
                if (str_contains($contentType, 'png')) {
                    $ext = 'png';
                } elseif (str_contains($contentType, 'webp')) {
                    $ext = 'webp';
                } elseif (str_contains($contentType, 'gif')) {
                    $ext = 'gif';
                } elseif (str_contains($contentType, 'avif')) {
                    $ext = 'avif';
                }

                $filename = 'imported-'.Str::random(10).'.'.$ext;
                $directory = 'media/'.date('Y/m');
                $path = $directory.'/'.$filename;

                Storage::disk('public')->put($path, $response->body());
                $storedUrl = Storage::url($path);
                $size = strlen($response->body());

                $media = MediaFile::create([
                    'user_id' => $request->user()?->id,
                    'name' => $request->input('name') ?: 'Imported Travel Photo '.date('Y-m-d H:i'),
                    'file_path' => $path,
                    'url' => $storedUrl,
                    'mime_type' => $contentType,
                    'size_bytes' => $size,
                    'alt_text' => $request->input('alt_text') ?: 'Travel Photography',
                    'caption' => $request->input('caption') ?: '',
                    'source_type' => 'url',
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Image fetched, stored locally, and registered to Media Library',
                    'media' => $media,
                ], 201);
            }
        } catch (\Throwable $e) {
            // Fallback below
        }

        // Fallback: save remote URL directly as media entry
        $media = MediaFile::create([
            'user_id' => $request->user()?->id,
            'name' => $request->input('name') ?: 'External Photo Ref',
            'file_path' => null,
            'url' => $url,
            'mime_type' => 'image/jpeg',
            'size_bytes' => 0,
            'alt_text' => $request->input('alt_text') ?: 'Travel Photography',
            'caption' => $request->input('caption') ?: '',
            'source_type' => 'url',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'External image URL registered in Media Library',
            'media' => $media,
        ], 201);
    }

    /**
     * Update media file metadata (alt text, caption, name).
     */
    public function update(Request $request, MediaFile $media): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'alt_text' => ['nullable', 'string', 'max:255'],
            'caption' => ['nullable', 'string', 'max:500'],
        ]);

        $media->update(array_filter($validated, fn ($val) => $val !== null));

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json([
                'success' => true,
                'media' => $media,
            ]);
        }

        return back()->with('success', 'Media file metadata updated');
    }

    /**
     * Delete media item and its physical file.
     */
    public function destroy(Request $request, MediaFile $media): JsonResponse|RedirectResponse
    {
        if ($media->file_path && Storage::disk('public')->exists($media->file_path)) {
            Storage::disk('public')->delete($media->file_path);
        }

        $media->delete();

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json([
                'success' => true,
                'message' => 'Media file deleted',
            ]);
        }

        return back()->with('success', 'Media item removed');
    }
}
